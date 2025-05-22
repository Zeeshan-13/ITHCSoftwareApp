#!/bin/bash
set -x

APP_NAME="ithcapp"
DEPLOY_DIR="backend"
APP_PATH="/home/zeeshan/Desktop/deploy_folder"

# Step 1: Prepare deploy folder
sudo rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"
cp -r "$APP_PATH"/* "$DEPLOY_DIR"
chmod 777 -R "$DEPLOY_DIR"

# Step 2: Setup Python environment
python3 -m venv "$DEPLOY_DIR/venv"
source "$DEPLOY_DIR/venv/bin/activate"

cd "$DEPLOY_DIR/backend"
pip install -r requirements.txt
pip install gunicorn

# Step 3: Apply Flask database migrations
export FLASK_APP=app.py
export FLASK_ENV=production
flask db upgrade

# Step 4: Setup frontend
cd "$DEPLOY_DIR/frontend"
npm install

# Step 5: Start Flask server in background (as fallback, if not using systemd)
cd "$DEPLOY_DIR/backend"
nohup python3 -m flask run --host=0.0.0.0 --port=5000 > flask.log 2>&1 &

# Step 6: Restart system services (if configured with systemd)
sudo systemctl daemon-reload
sudo systemctl restart nginx
sudo systemctl restart "$APP_NAME"
sudo systemctl enable "$APP_NAME"
