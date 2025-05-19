pipeline {
    agent any

    environment {
        APP_NAME = 'ithcapp'
        DEPLOY_DIR = '/application_deploy/deploy_folder'
        VENV_PATH = "${DEPLOY_DIR}/venv"
        VM_USER = 'zeeshan'
        VM_HOST = '10.102.193.125' 
        APP_PATH = '/home/zeeshan/Desktop/deploy_folder'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Zeeshan-13/ITHCSoftwareApp.git'
            }
        }

        stage('Check Python Version') {
            steps {
                withEnv(['PATH=C:\\Program Files\\Python311;C:\\Program Files\\Python311\\Scripts;' + env.PATH]) {
                    bat 'python --version'
            }
        }
        }

        stage('Setup Environment') {
            steps {
                withEnv(['PATH=C:\\Program Files\\Python311;C:\\Program Files\\Python311\\Scripts;' + env.PATH]) {
                    bat '''
                    python -m venv venv
                    call venv\\Scripts\\activate

                    cd backend
                    pip install -r requirements.txt
                    pip install pytest-cov pytest-html

                    cd ..\\frontend
                    npm install
                '''
                }
            }
        }

        stage('Run Tests') {
             steps {
                withEnv(['PATH=C:\\Program Files\\Python311;C:\\Program Files\\Python311\\Scripts;' + env.PATH]){
            parallel {
                stage('Backend Tests') {
                    steps {
                        sh '''
                            . venv/bin/activate
                            cd backend
                            pytest
                            pytest --cov=.
                            pytest tests/test_software.py
                            pytest --cov=. --cov-report=html:coverage-report --html=test-report.html || true
                        '''
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'backend',
                                reportFiles: 'test-report.html,coverage-report/**',
                                reportName: 'Backend Test Report',
                                reportTitles: 'Test Report,Coverage Report'
                            ])
                        }
                    }
                }

                stage('Frontend Tests') {
                    steps {
                        sh '''
                            cd frontend
                            npm test
                            npm run test:watch || true
                            npm run test:coverage || true
                        '''
                    }
                    post {
                        always {
                            junit 'frontend/junit.xml'
                            publishHTML([
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'frontend/coverage',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Coverage Report'
                            ])
                        }
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                    cd frontend
                    npm run build
                '''
            }
        }

        stage('Deploy to DevTest') {
            steps {
                sh '''
                    ssh $VM_USER@$VM_HOST << 'EOF'
                        sudo mkdir -p $DEPLOY_DIR
                        sudo rm -rf $DEPLOY_DIR/*
                        sudo cp -r $APP_PATH/* $DEPLOY_DIR/
                        sudo chown -R $USER:$USER $DEPLOY_DIR

                        cd $DEPLOY_DIR
                        python3 -m venv venv
                        source venv/bin/activate

                        cd backend
                        pip install -r requirements.txt
                        pip install gunicorn

                        export FLASK_APP=app.py
                        flask db upgrade

                        sudo tee /etc/systemd/system/$APP_NAME.service > /dev/null << SERVICE
[Unit]
Description=ITHC Software App
After=network.target

[Service]
User=$USER
WorkingDirectory=$DEPLOY_DIR/backend
Environment="PATH=$DEPLOY_DIR/venv/bin"
Environment="FLASK_ENV=production"
ExecStart=$DEPLOY_DIR/venv/bin/gunicorn -w 4 -b 127.0.0.1:8000 app:app

[Install]
WantedBy=multi-user.target
SERVICE

                        sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << NGINX
server {
    listen 80;
    zeeshan 10.102.193.125;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /static/ {
        alias $DEPLOY_DIR/frontend/static/;
    }
}
NGINX

                        sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
                        sudo nginx -t
                        sudo systemctl daemon-reload
                        sudo systemctl restart nginx
                        sudo systemctl restart $APP_NAME
                        sudo systemctl enable $APP_NAME
                    EOF
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
