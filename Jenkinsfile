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
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Zeeshan-13/ITHCSoftwareApp.git'
            }
        }

        stage('Setup Backend') {
            steps {
                bat '''
                    python -m venv venv
                    call venv\\Scripts\\activate

                    cd backend
                    pip install -r requirements.txt
                    pip install pymysql
                '''
            }
        }

        stage('Deploy to DevTest') {
            steps {
                bat """
                    ssh %VM_USER%@%VM_HOST% "rm -rf %DEPLOY_DIR% && \
                    mkdir -p %DEPLOY_DIR% && \
                    cp -r %APP_PATH%/* %DEPLOY_DIR%/ && \
                    python3 -m venv %DEPLOY_DIR%/venv && \
                    source %DEPLOY_DIR%/venv/bin/activate && \
                    cd %DEPLOY_DIR%/backend && \
                    pip install -r requirements.txt && \
                    pip install gunicorn && \
                    export FLASK_APP=app.py && \
                    flask db upgrade && \
                    sudo systemctl daemon-reload && \
                    sudo systemctl restart nginx && \
                    sudo systemctl restart %APP_NAME% && \
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
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
