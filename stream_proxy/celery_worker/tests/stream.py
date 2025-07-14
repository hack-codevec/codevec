import redis
import json
from rich.console import Console
import sys
from dotenv import load_dotenv
import os
load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")

project_id = input("Enter the project id: ")
console = Console()

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, password=REDIS_PASSWORD)
ps = r.pubsub()
ps.subscribe(f'stream:{project_id}')

for msg in ps.listen():
    if msg['type'] == 'message':
        try:
            payload = json.loads(msg['data'])
            data = payload.get("data")  # Only print the "data" field inside the message
            console.print(data, end="", highlight=False, soft_wrap=True)
            sys.stdout.flush()
        except Exception as e:
            print("Invalid message:", e)
