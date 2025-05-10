from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
import jwt
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
SUPABASE_JWT_ISSUER = os.getenv("SUPABASE_JWT_ISSUER")


# --- JWT Verification Middleware --- #
@app.middleware("http")
async def verify_token_middleware(request: Request, call_next):
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
            options={"verify_aud": False},
            issuer=SUPABASE_JWT_ISSUER
        )
        request.state.user = payload  # store decoded token if needed
    except jwt.PyJWTError as e:
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
uvicorn.run(app)