#!/bin/bash

set -e

echo "Starting deployment..."

cd /home/zeeshan/Desktop/deploy_folder

python3 -m venv venv
source venv/bin/activate

cd backend
pip install -r requirements.txt
pip install gunicorn

export FLASK_APP=app.py
flask db upgrade

sudo tee /etc/systemd/system/ithcapp.service > /dev/null << SERVICE
[Unit]
Description=ITHC Software App
After=network.target

[Service]
User=zeeshan
WorkingDirectory=/home/zeeshan/Desktop/deploy_folder/backend
Environment="PATH=${DEPLOY_DIR}/venv/bin"
Environment="FLASK_ENV=production"
ExecStart=/home/zeeshan/Desktop/deploy_folder/venv/bin/gunicorn -w 4 -b 127.0.0.1:8000 app:app


[Install]
WantedBy=multi-user.target
SERVICE

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

ln -sf /etc/nginx/sites-available/ithcapp /etc/nginx/sites-enabled/
nginx -t
sudo systemctl daemon-reload
sudo systemctl restart nginx
sudo systemctl restart ithcapp
sudo systemctl enable ithcapp

echo "Deployment finished!"
