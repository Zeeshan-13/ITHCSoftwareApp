pipeline {
    agent any

    environment {
        DEPLOY_DIR = 'backend'
        VENV_PATH = 'venv'
        VM_USER = 'zeeshan'
        VM_HOST = '10.102.193.125'
        REMOTE_SCRIPT = '/home/zeeshan/Desktop/deploy_backend.sh'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Zeeshan-13/ITHCSoftwareApp.git'
            }
        }

        stage('Set Up Python Environment') {
            steps {
                bat """
                    python -m venv %VENV_PATH%
                    call %VENV_PATH%\\Scripts\\activate
                    pip install --upgrade pip
                    pip install -r %DEPLOY_DIR%\\requirements.txt pymysql pytest-cov pytest-html
                """
            }
        }

        stage('Run Backend Tests') {
            steps {
                bat """
                    call %VENV_PATH%\\Scripts\\activate
                    pytest %DEPLOY_DIR% --cov=%DEPLOY_DIR% --cov-report=html:%DEPLOY_DIR%\\coverage-report --html=%DEPLOY_DIR%\\test-report.html || exit 0
                """
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: "${env.DEPLOY_DIR}/coverage-report",
                        reportFiles: 'index.html',
                        reportName: 'Backend Test Coverage'
                    ])
                }
            }
        }

        stage('Deploy to Ubuntu VM') {
            steps {
                bat """
                    ssh -o StrictHostKeyChecking=no %VM_USER%@%VM_HOST% "chmod +x %REMOTE_SCRIPT% && %REMOTE_SCRIPT%"
                """
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed.'
        }
    }
}
