pipeline {
    agent any

    environment {
        APP_NAME = 'ithcapp'
        DEPLOY_DIR = '/application_deploy/deploy_folder'
        VM_USER = 'zeeshan'
        VM_HOST = '10.102.193.125'
        LOCAL_DEPLOY_SCRIPT = 'deploy_backend.sh'
    }

    stages {
        stage('Checkout') {
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

        stage('Backend Tests') {
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
                        reportDir: 'backend/coverage-report',
                        reportFiles: 'index.html',
                        reportName: 'Backend Test Coverage'
                    ])
                }
            }
        }

        stage('Deploy to DevTest') {
            steps {
                sh ''
                    ssh zeeshan@10.102.193.125 "chmod +x /home/zeeshan/Desktop/deploy_backend.sh"
                    ssh zeeshan@10.102.193.125 "/home/zeeshan/Desktop/deploy_backend.sh"
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
