from fastapi import FastAPI, Request, Response, status , WebSocket
from fastapi.responses import JSONResponse
import jwt
import uvicorn
import os
import mimetypes
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from supabase import create_client, Client
from celery import Celery
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core import Settings
from llama_index.core import StorageContext
import qdrant_client
from fastapi.middleware.cors import CORSMiddleware
from llama_index.vector_stores.qdrant import QdrantVectorStore

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API = os.getenv("QDRANT_API")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
SUPABASE_JWT_ISSUER = os.getenv("SUPABASE_JWT_ISSUER", "")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")

celery_client = Celery('client', broker=f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/0', backend=f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/0')

Settings.embed_model = HuggingFaceEmbedding(
    model_name=EMBEDDING_MODEL
)

from utils import clone_repo, get_file_tree


supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

# CORS for frontend debugging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://codevec.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)


# --- JWT Verification Middleware --- #
@app.middleware("http")
async def verify_token_middleware(request: Request, call_next):
    # Bypass preflight CORS requests
    if request.method == "OPTIONS":
        return await call_next(request)

    # Allow public routes (optional)
    if request.url.path in ["/", "/public"]:
        return await call_next(request)

    token = request.headers.get("Authorization")
    
    if not token or not token.startswith("Bearer "):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Missing or invalid Authorization header"},
        )

    token = token.replace("Bearer ", "")

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        request.state.user = payload
    except jwt.PyJWTError:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": f"Token verification failed"},
        )

    return await call_next(request)

# --- Health Route --- #

@app.get("/health")
async def health(request: Request):
    return {
        "status": "ok",
        "user": request.state.user.get("email") if hasattr(request.state, "user") else None
    }

async def init_project(project_id):
    """Fetches the files from the github repo and initializes the vector store, stroes it in the qdrant database.
    
    Keyword arguments:
    argument -- project_id : str : The project id of the project to be initialized.
    Return: --  bool : True if the project was initialized successfully, False otherwise.
    """
    
    try:
        response =  supabase.table('project').select('base_git_url').eq('id', project_id).execute()
        github_base_url=(response.data[0]['base_git_url'])
        clone_status = clone_repo( repo_base = github_base_url, save_dir = f"codebase/{project_id}" )
        if not clone_status:
            raise Exception("Failed to clone repo")
        documents = SimpleDirectoryReader(
        input_dir=f"codebase/{project_id}",
        recursive=True,
        exclude_hidden=True,  # optional: hides .git and other dot folders
        required_exts=[".py", ".md", ".txt", ".tsx", ".ts", ".json", ".gitignore"],  # list of file types you want to read
        exclude=[".git", ".vscode"]  # <-- ignore .git folder
        )
        
        client = qdrant_client.QdrantClient(
        url = QDRANT_URL,
        port=443,
        api_key= QDRANT_API,
        https= True,
        prefer_grpc=False
        )
        
        vector_store = QdrantVectorStore(client=client, collection_name=project_id)
        storage_context = StorageContext.from_defaults(vector_store=vector_store)
        
        VectorStoreIndex.from_documents(
            documents.load_data(),
            storage_context=storage_context,
        )
        return True

    except Exception as e:
        print(f"Error initializing project {project_id}\n{e}")
        return False

@app.websocket("/ws/init")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    await websocket.send_json({"status": False, "message": "Initializing project..."})
    # Access query parameters
    try:    
        params = websocket.query_params
        project_id = params.get("project_id", None)
        if not project_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        done=await init_project(project_id)
        if not done:
            await websocket.send_json({"status": True, "message": "Project already present"})
            await websocket.close()
            return
        else:
            supabase.table('project').update({
                'status': True
            }).eq('id', project_id).execute()
            await websocket.send_json({"status": True, "message": "Project initialized successfully"})

        await websocket.close()
    except Exception as e:
        print(f"Error initializing project {project_id} , {e}")

@app.post("/v1/query")
async def init_query(request: Request):
    #get the question from the request body
    body = await request.json()
    question = body.get("question")
    project_id = body.get("project_id")
    
    if not question or not project_id:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Missing question or project_id"},
        )
        
    result = celery_client.send_task('process_task', kwargs={
        'query': question,
        'project_id': project_id
    })

    print("Task sent. ID:", result.id)

    return { "message" : result.id }

@app.get("/v1/tree")
async def get_tree(request: Request):
    project_id= request.query_params.get("project_id")
    if not project_id:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Missing project_id"},
        )
    base_path = f"codebase/{project_id}"
    tree = get_file_tree(base_path=base_path)
    return { "tree" : tree }

@app.get("/v1/file")
async def get_file(request: Request):
    project_id = request.query_params.get("project_id")
    if not project_id:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Missing project_id"},
        )
    file_path = "codebase/" + project_id + "/" + request.query_params.get("file_path")

    if os.path.exists(file_path):
        # Detect if file is an image or text
        mime_type, _ = mimetypes.guess_type(file_path)
        
        if mime_type and mime_type.startswith("image/"):
            return JSONResponse(content={"content": "Preview not available"})
        
        # Assume it's a text file
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
        return JSONResponse(content={"content": text})
    
    return JSONResponse(content={"error": "File not found"}, status_code=404)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8081)