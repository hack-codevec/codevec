#!/bin/bash

echo "Deploying Celery worker service..."

sudo cp celery-worker.service /etc/systemd/system/

sudo systemctl daemon-reexec
sudo systemctl daemon-reload

sudo systemctl enable celery-worker
sudo systemctl start celery-worker

echo "✅ Celery worker service status:"
sudo systemctl status celery-worker
