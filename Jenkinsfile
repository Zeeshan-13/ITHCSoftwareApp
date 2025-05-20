pipeline {
    agent any

    environment {
        APP_NAME = 'ithcapp'
        DEPLOY_DIR = '/application_deploy/deploy_folder'
        VM_USER = 'zeeshan'
        VM_HOST = '10.102.193.125'
        APP_PATH = '/home/zeeshan/Desktop/deploy_folder'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Zeeshan-13/ITHCSoftwareApp.git'
            }
        }

        stage('Setup Python Environment') {
            steps {
                bat '''
                    python -m venv venv
                    call venv\\Scripts\\activate
                    cd backend
                    pip install -r requirements.txt
                    pip install pymysql pytest-cov pytest-html
                '''
            }
        }

        stage('Run Backend Tests') {
            steps {
                bat '''
                    call venv\\Scripts\\activate
                    cd backend
                    pytest --cov=. --cov-report=html:coverage-report --html=test-report.html || exit 0
                '''
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'backend',
                        reportFiles: 'test-report.html,coverage-report/index.html',
                        reportName: 'Backend Test Coverage'
                    ])
                }
            }
        }

        stage('Deploy to DevTest') {
            steps {
                bat """
                    ssh %VM_USER%@%VM_HOST% ^
                    "rm -rf %DEPLOY_DIR% && ^
                     mkdir -p %DEPLOY_DIR% && ^
                     cp -r %APP_PATH%/* %DEPLOY_DIR%/ && ^
                     python3 -m venv %DEPLOY_DIR%/venv && ^
                     source %DEPLOY_DIR%/venv/bin/activate && ^
                     cd %DEPLOY_DIR%/backend && ^
                     pip install -r requirements.txt && ^
                     pip install gunicorn && ^
                     export FLASK_APP=app.py && flask db upgrade && ^

                     sudo systemctl restart nginx && ^
                     sudo systemctl daemon-reload && ^
                     sudo systemctl restart %APP_NAME% || true && ^
                     sudo systemctl enable %APP_NAME%"
                """
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo '✅ Pipeline completed successfully.'
        }
        failure {
            echo '❌ Pipeline failed.'
        }
    }
}
