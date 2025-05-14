#!/bin/bash

echo "Deploying Celery worker service..."

sudo cp backend.service /etc/systemd/system/

sudo systemctl daemon-reexec
sudo systemctl daemon-reload

sudo systemctl enable backend
sudo systemctl start backend

echo "✅ Celery worker service status:"
sudo systemctl status backend
