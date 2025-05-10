from fastapi import FastAPI, Request, status , WebSocket
from fastapi.responses import JSONResponse
import jwt
import uvicorn
import os
from dotenv import load_dotenv
import supabase
from supabase import create_client, Client


from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core import Settings
from llama_index.core import StorageContext
import qdrant_client
from llama_index.vector_stores.qdrant import QdrantVectorStore


Settings.embed_model = HuggingFaceEmbedding(
    model_name="all-MiniLM-L6-v2"
)

load_dotenv()

from utils import clone_repo, get_file_tree
import shutil

QDRANT_URL = os.environ.get("QDRANT_URL")
QDRANT_API = os.environ.get("QDRANT_API")

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
SUPABASE_JWT_ISSUER = os.getenv("SUPABASE_JWT_ISSUER")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()





# --- JWT Verification Middleware --- #
# @app.middleware("http")
# async def verify_token_middleware(request: Request, call_next):
#     # Allow public routes (optional)
#     if request.url.path in ["/", "/public"]:
#         return await call_next(request)

#     token = request.headers.get("Authorization")
#     if not token or not token.startswith("Bearer "):
#         return JSONResponse(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             content={"detail": "Missing or invalid Authorization header"},
#         )

#     token = token.replace("Bearer ", "")
#     try:
#         payload = jwt.decode(
#             token,
#             SUPABASE_JWT_SECRET,
#             algorithms=["HS256"],
#             options={"verify_aud": False},
#             issuer=SUPABASE_JWT_ISSUER
#         )
#         request.state.user = payload  # store decoded token if needed
#     except jwt.PyJWTError as e:
#         print(f"JWT Error: {e}")
#         return JSONResponse(
#             status_code=status.HTTP_403_FORBIDDEN,
#             content={"detail": f"Token verification failed"},
#         )

#     return await call_next(request)

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
    await websocket.send_text("Initializing project, please wait...")
    
    # Access query parameters
    try:    
        params = websocket.query_params
        project_id = params.get("project_id", None)
        if not project_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        done=await init_project(project_id)
        if not done:
            shutil.rmtree(f"codebase/{project_id}", ignore_errors=True)
            await websocket.send_text("Error initializing project")
            await websocket.close()
            return
        else:
            await websocket.send_text(f"Project initialized successfully.")

        await websocket.close()
    except Exception as e:
        print(f"Error initializing project {project_id} , {e}")





@app.post("/query")
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

    
    
    

@app.post("/v1/query/init")
async def init_query(request: Request):
    project_id = request.query_params.get("project_id")
    if not project_id:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Missing project_id"},
        )
    
    

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)