pipeline {
    agent any
    
    environment {
        APP_NAME = 'ithcapp'
        DEPLOY_DIR = '/opt/ithcapp'
        VENV_PATH = "${DEPLOY_DIR}/venv"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Environment') {
            steps {
                sh '''
                    # Create Python virtual environment
                    python3 -m venv ${VENV_PATH}
                    . ${VENV_PATH}/bin/activate
                    
                    # Install backend dependencies
                    cd backend
                    pip install -r requirements.txt
                    pip install pytest-cov pytest-html
                    
                    # Install frontend dependencies
                    cd ../frontend
                    npm install
                '''
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        sh '''
                            . ${VENV_PATH}/bin/activate
                            cd backend
                            python -m pytest --cov=. --cov-report=html:coverage-report --html=test-report.html || true
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
                            npm test -- --coverage --ci --reporters=default --reporters=jest-junit || true
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
                    # Ensure target directory exists
                    sudo mkdir -p ${DEPLOY_DIR}
                    sudo chown -R jenkins:jenkins ${DEPLOY_DIR}
                    
                    # Copy application files
                    cp -r . ${DEPLOY_DIR}/
                    
                    # Setup backend environment
                    cd ${DEPLOY_DIR}
                    python3 -m venv venv
                    . venv/bin/activate
                    
                    cd backend
                    pip install -r requirements.txt
                    pip install gunicorn
                    
                    # Database setup
                    export FLASK_APP=app.py
                    flask db upgrade
                    
                    # Configure systemd service
                    sudo tee /etc/systemd/system/${APP_NAME}.service << EOF
[Unit]
Description=ITHC Software App
After=network.target

[Service]
User=jenkins
WorkingDirectory=${DEPLOY_DIR}/backend
Environment="PATH=${DEPLOY_DIR}/venv/bin"
Environment="FLASK_ENV=production"
Environment="DATABASE_URL=sqlite:///instance/software.db"
ExecStart=${DEPLOY_DIR}/venv/bin/gunicorn -w 4 -b 127.0.0.1:8000 app:app

[Install]
WantedBy=multi-user.target
EOF

                    # Configure Nginx
                    sudo tee /etc/nginx/sites-available/${APP_NAME} << EOF
server {
    listen 80;
    zeeshan 10.102.193.125;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /static/ {
        alias ${DEPLOY_DIR}/frontend/static/;
    }
}
EOF

                    # Enable and restart services
                    sudo ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
                    sudo nginx -t
                    sudo systemctl restart nginx
                    sudo systemctl daemon-reload
                    sudo systemctl restart ${APP_NAME}
                    sudo systemctl enable ${APP_NAME}
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
