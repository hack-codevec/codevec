import redis
import json
from rich.console import Console
import sys

console = Console()

r = redis.Redis(host='localhost', port=6379)
ps = r.pubsub()
ps.subscribe('stream:313b682d-f508-4378-8c8c-59e14be62882')

for msg in ps.listen():
    if msg['type'] == 'message':
        try:
            payload = json.loads(msg['data'])
            data = payload.get("data")  # Only print the "data" field inside the message
            console.print(data, end="", highlight=False, soft_wrap=True)
            sys.stdout.flush()
        except Exception as e:
            print("Invalid message:", e)
