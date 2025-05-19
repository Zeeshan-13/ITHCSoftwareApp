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
    }
}

       
