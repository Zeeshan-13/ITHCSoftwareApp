pipeline {
    agent any

    environment {
        APP_NAME = 'ithcapp'
        DEPLOY_DIR = '/home/zeeshan/Desktop/deploy_folder'
        VM_USER = 'zeeshan'
        VM_HOST = '10.102.193.125'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Zeeshan-13/ITHCSoftwareApp.git'
            }
        }

        stage('Check Python Version') {
            steps {
                bat 'python --version'
            }
        }

        stage('Setup Environment') {
            steps {
                bat '''
                    python -m venv venv
                    call venv\\Scripts\\activate
                    cd backend
                    pip install -r requirements.txt
                    pip install pytest-cov pytest-html
                '''
            }
        }

        stage('Run Backend Tests') {
            steps {
                bat '''
                    call venv\\Scripts\\activate
                    cd backend
                    pytest
                    pytest --cov=.
                    pytest tests/test_software.py
                    pytest --cov=. --cov-report=html:coverage-report --html=test-report.html || exit /b 0
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

        stage('Deploy to DevTest') {
            steps {
                // Copy files to remote
                bat """
                    pscp -r "C:/ProgramData/Jenkins/.jenkins/workspace/Job_1_new/deploy.sh" zeeshan@10.102.193.125:/home/zeeshan/Desktop/deploy_folder/

                """
                // SSH and run deployment script remotely
                bat """
                    ssh zeeshan@10.102.193.125 "cd /home/zeeshan/Desktop/deploy_folder && chmod +x deploy.sh && ./deploy.sh"
                """
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
