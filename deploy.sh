#!/bin/bash

set -e

echo "Starting deployment..."

# Define deployment directory
DEPLOY_DIR="/home/zeeshan/Desktop/deploy_folder"

cd "$DEPLOY_DIR"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies for backend
cd backend
pip install -r requirements.txt
pip install gunicorn

# Run database migrations
export FLASK_APP=app.py
flask db upgrade

# Create systemd service for Flask (Gunicorn)
sudo tee /etc/systemd/system/ithcapp.service > /dev/null << SERVICE
[Unit]
Description=ITHC Software App
After=network.target

[Service]
User=zeeshan
WorkingDirectory=${DEPLOY_DIR}/backend
Environment="PATH=${DEPLOY_DIR}/venv/bin"
Environment="FLASK_ENV=production"
ExecStart=${DEPLOY_DIR}/venv/bin/gunicorn -w 4 -b 0.0.0.0:8000 app:app

[Install]
WantedBy=multi-user.target
SERVICE

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/ithcapp > /dev/null << NGINX
server {
    listen 80;
    server_name 10.102.193.125;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /static/ {
        alias ${DEPLOY_DIR}/frontend/static/;
    }
}
NGINX

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/ithcapp /etc/nginx/sites-enabled/
sudo nginx -t

# Reload and restart services
sudo systemctl daemon-reload
sudo systemctl restart nginx
sudo systemctl restart ithcapp
sudo systemctl enable ithcapp

echo "Deployment finished!"
