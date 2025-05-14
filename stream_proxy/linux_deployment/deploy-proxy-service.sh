#!/bin/bash

echo "Deploying Proxy WebSocket service..."

sudo cp proxy-service.service /etc/systemd/system/

sudo systemctl daemon-reexec
sudo systemctl daemon-reload

sudo systemctl enable proxy-service
sudo systemctl start proxy-service

echo "✅ Proxy service status:"
sudo systemctl status proxy-service
