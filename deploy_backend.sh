set -e

APP_NAME="ithcapp"
DEPLOY_DIR="/application_deploy/deploy_folder"
APP_PATH="/home/zeeshan/Desktop/deploy_folder"

# Step 1: Prepare deploy folder
sudo rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"
cp -r "$APP_PATH"/* "$DEPLOY_DIR"

# Step 2: Setup Python environment
python3 -m venv "$DEPLOY_DIR/venv"
source "$DEPLOY_DIR/venv/bin/activate"

cd "$DEPLOY_DIR/backend"
pip install -r requirements.txt
pip install gunicorn

export FLASK_APP=app.py
flask db upgrade

# Step 3: Restart services
sudo systemctl daemon-reload
sudo systemctl restart nginx
sudo systemctl restart "$ITHCAPP"
sudo systemctl enable "$ITHCAPP"
