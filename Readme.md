# CodeVec

**CodeVec** is a hackathon project that brings intelligent code understanding to life using natural language queries.

It functions like a real-time CodeLLM assistant: you can ask questions about your codebase, and it responds based on the actual code context—no need for manual prompt engineering. Just write code, ask, and get answers.

- Understands your code with context-aware LLMs  
- Query using natural language  
- Supports full projects  
- Powered by Ollama-hosted models  
- Real-time backend interaction  

**1st Runner-Up** at the hackathon where it was built.

> Built to explore smarter code interaction through LLMs.

## Architecture
<img src="https://github.com/user-attachments/assets/b491c6cb-91b7-4688-9d77-0804fe8e60ae" alt="architecture" style="width: 50%;" />

## Services

| Service        | Core Language / Tech | Purpose                                                                 |
|----------------|----------------------|-------------------------------------------------------------------------|
| Studio         | TypeScript (Next.js) | Frontend UI for chatting and interacting with the code assistant.       |
| Backend        | Python (FastAPI)     | Orchestrates requests, talks to Redis, Supabase, and triggers Celery jobs. |
| Supabase       | PgSQL                | Stores metadata, user sessions, and project information.                |
| Redis          | Redis                | Acts as a task queue for Celery and also streams LLM output to client.  |
| Celery         | Python (Celery)      | Executes background tasks like LLM inference.                           |
| Stream Proxy   | Python (FastAPI)     | Forwards the stream response from redis to client with proper authentication |
