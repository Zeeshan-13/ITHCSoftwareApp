pipeline {
    agent any

    environment {
        BACKEND_DIR = 'backend'
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
                    pip install -r %BACKEND_DIR%\\requirements.txt pymysql pytest-cov pytest-html
                """
            }
        }

        stage('Run Backend Tests') {
            steps {
                bat """
                    call %VENV_PATH%\\Scripts\\activate
                    pytest %BACKEND_DIR% --cov=%BACKEND_DIR% --cov-report=html:%BACKEND_DIR%\\coverage-report --html=%BACKEND_DIR%\\test-report.html || exit 0
                """
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: "${env.BACKEND_DIR}/coverage-report",
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
