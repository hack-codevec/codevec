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
from llama_index.core.prompts import RichPromptTemplate
from llama_index.llms.ollama import Ollama
from dotenv import load_dotenv
load_dotenv()

llm = None
embed_model = None

QDRANT_URL = os.getenv("QDRANT_URL", "")
QDRANT_API = os.getenv("QDRANT_API", "")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "llama3.1:8b")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

# Redis and Qdrant can be shared
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0,  password="satlokashramai")
qdrant = qdrant_client.QdrantClient(
    url=QDRANT_URL,
    port=443,
    api_key=QDRANT_API,
    https=True,
    prefer_grpc=False
)

chat_text_qa_prompt_str = """
{% chat role="system" %}
You are also a senior developer and you know the codebase very well.
Always answer the question, even if the context isn't helpful.
{% endchat %}

{% chat role="user" %}
The following is some retrieved context:

<context>
{{ context_str }}
</context>

Using the context, answer the provided question:
{{ query_str }}
{% endchat %}
"""

text_qa_template = RichPromptTemplate(chat_text_qa_prompt_str)

# Refine Prompt
chat_refine_prompt_str = """
{% chat role="system" %}
Always answer the question, even if the context isn't helpful.
{% endchat %}

{% chat role="user" %}
The following is some new retrieved context:

<context>
{{ context_msg }}
</context>

And here is an existing answer to the query:
<existing_answer>
{{ existing_answer }}
</existing_answer>

Using both the new retrieved context and the existing answer, either update or repeat the existing answer to this query:
{{ query_str }}
{% endchat %}
"""

refine_template = RichPromptTemplate(chat_refine_prompt_str)

# Celery setup
app = Celery(
    'worker',
    broker= f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/0',
    backend= f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/0'
)

@worker_process_init.connect
def init_worker(**kwargs):
    """
    Initializes LLM and embedding model in each worker process (spawn-safe)
    """
    global llm, embed_model

    # Load Ollama and HF embeddings safely per worker process
    llm = Ollama(base_url=OLLAMA_HOST, model=MODEL_NAME, request_timeout=60.0)
    embed_model = HuggingFaceEmbedding(model_name=EMBEDDING_MODEL)
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
        
        query_engine.update_prompts(
            {
                "response_synthesizer:text_qa_template": text_qa_template,
                "response_synthesizer:refine_template": refine_template,
            }
        )
        
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
