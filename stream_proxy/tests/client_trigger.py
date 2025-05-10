# from your client.py
from celery import Celery

app = Celery('client', broker='redis://localhost:6379/0', backend='redis://localhost:6379/0')

result = app.send_task('process_task', kwargs={
    'query': 'can you fix the form in the ChatInput component and explain it in depth i am a new learner?',
    'project_id': '313b682d-f508-4378-8c8c-59e14be62882'
})

print("Task sent. ID:", result.id)
