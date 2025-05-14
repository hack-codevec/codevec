from celery import Celery
from celery.signals import worker_process_init
import time
import redis
import json
import qdrant_client
import os
from llama_index.core import VectorStoreIndex, StorageContext, Settings
from llama_index.vector_stores.qdrant import QdrantVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.ollama import Ollama
from dotenv import load_dotenv

load_dotenv()

# Global variables initialized per worker
llm = None
embed_model = None

QDRANT_URL = os.environ.get("QDRANT_URL")
QDRANT_API = os.environ.get("QDRANT_API")

# Redis and Qdrant can be shared
redis_client = redis.Redis(host='localhost', port=6379, db=0)
qdrant = qdrant_client.QdrantClient(
    url=QDRANT_URL,
    port=443,
    api_key=QDRANT_API,
    https=True,
    prefer_grpc=False
)

# Celery setup
app = Celery(
    'worker',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0'
)

@worker_process_init.connect
def init_worker(**kwargs):
    """
    Initializes LLM and embedding model in each worker process (spawn-safe)
    """
    global llm, embed_model

    # Load Ollama and HF embeddings safely per worker process
    llm = Ollama(model="llama3.1:8b", request_timeout=60.0)
    embed_model = HuggingFaceEmbedding(model_name="all-MiniLM-L6-v2")
    Settings.embed_model = embed_model


@app.task(bind=True, name='process_task')
def process_task(self, query: str, project_id: str):
    """
    Processes a query with streaming updates via Redis Pub/Sub.
    """

    def get_vector_index(project_id):
        vector_store = QdrantVectorStore(client=qdrant, collection_name=project_id)
        storage_context = StorageContext.from_defaults(vector_store=vector_store)
        return VectorStoreIndex.from_vector_store(vector_store, storage_context=storage_context)

    def stream_message(step, data):
        message = {
            'step': step,
            'timestamp': time.time(),
            'data': data
        }
        redis_client.publish(f"stream:{project_id}", json.dumps(message))

    try:
        stream_message("start", "<start>")

        index = get_vector_index(project_id)
        query_engine = index.as_query_engine(llm=llm, similarity_top_k=5, streaming=True)

        response = query_engine.query(query)

        for chunk in response.response_gen:
            stream_message("chunk", chunk)

        stream_message("complete", "<stop>")

        return {
            'query': query,
            'status': 'completed',
            'finished_at': time.time()
        }

    except Exception as e:
        error_msg = {
            'status': 'error',
            'message': str(e),
            'timestamp': time.time()
        }
        redis_client.publish(f"stream:{project_id}", json.dumps(error_msg))
        raise
