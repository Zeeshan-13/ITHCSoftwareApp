pipeline {
    agent any

    environment {
        APP_NAME = 'ithcapp'
        DEPLOY_DIR = '/home/zeeshan/Desktop/deploy_folder'
        VM_USER = 'zeeshan'
        VM_HOST = '10.102.193.125'
        GIT_BASH_PATH = 'C:\\Users\\zeeshan.mujawar\\AppData\\Local\\Programs\\Git\\git-bash.exe'
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
                bat """
                    "${GIT_BASH_PATH}" -c 'ssh -vvv ${VM_USER}@${VM_HOST} "/usr/bin/sh ${DEPLOY_DIR}/deploy.sh"'
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
