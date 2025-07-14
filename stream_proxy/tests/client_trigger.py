from celery import Celery
from dotenv import load_dotenv
import os
load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost") 
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")

app = Celery('client', broker=f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/0', backend=f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/0')

query = input("Enter the query: ")
project_id = input("Enter the project id: ")

result = app.send_task('process_task', kwargs={
    'query': query,
    'project_id': project_id
})

print("Task sent. ID:", result.id)
