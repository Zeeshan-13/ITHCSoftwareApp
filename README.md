# Software Management System

A web-based application for managing software versions, projects, and customer relationships.

## Architecture Diagrams

### Application Architecture
```mermaid
graph TD
    A[Client Browser] <--> B[Frontend Layer]
    subgraph Frontend
        B --> C[HTML Templates]
        B --> D[Static Assets]
        D --> E[JavaScript Modules]
        D --> F[CSS]
        E --> E1[main.js]
        E --> E2[projects.js]
        E --> E3[ithc.js]
        E --> E4[utilities.js]
    end
    B <--> G[Backend Layer]
    subgraph Backend
        G --> H[Flask Application]
        H --> I[REST API Endpoints]
        H --> J[Route Handlers]
        H --> K[Database Interface]
    end
    K <--> L[Data Layer/SQLite]
```

### Data Model
```mermaid
erDiagram
    Software ||--o{ Project : has
    Software ||--o{ ITHCSoftware : tracks
    Project ||--o{ Release : contains
    Project ||--o{ ITHCSoftware : has
    Project }|--o{ Customer : serves
    
    Software {
        int id PK
        string name UK
        string software_type
        string latest_version
        datetime last_updated
        string check_url
    }
    
    Project {
        int id PK
        string name
        string description
        datetime created_at
        int software_id FK
        string software_version
    }
    
    Customer {
        int id PK
        string name
        string email
        string contact_person
    }
    
    ITHCSoftware {
        int id PK
        int project_id FK
        int software_id FK
        string project_version
        string current_software_version
        datetime created_at
        datetime updated_at
    }
    
    Release {
        int id PK
        string version
        datetime release_date
        string notes
        int project_id FK
    }
```

### Code Flow (Typical Request)
```mermaid
sequenceDiagram
    participant U as User/Browser
    participant F as Frontend JS
    participant A as Flask API
    participant D as Database
    
    U->>F: User Action
    activate F
    F->>F: Event Handler
    F->>A: API Request
    activate A
    A->>A: Request Validation
    A->>D: Database Operation
    activate D
    D-->>A: Data Response
    deactivate D
    A-->>F: JSON Response
    deactivate A
    F->>F: Update DOM
    F->>U: User Feedback
    deactivate F
```

## Features

- Software Management
  - Track software versions and metadata
  - Record software types and latest versions
  - Store URLs for version checking
  - Search and filter software entries
  - Edit and delete software entries

- Project Management
  - Create and manage projects with versions
  - Track project descriptions and status
  - Manage project releases with versioning
  - Associate software versions with projects
  - Edit and delete project entries
  - Search projects functionality

- Customer Management
  - Manage customer information
  - Associate customers with projects
  - Track customer contact details
  - Add/remove customers from projects

- ITHC (IT Health Check) Management
  - Track software versions across projects
  - Compare current vs latest versions
  - Project version management
  - Software version auditing
  - Version history tracking

- Bulk Import/Export
  - Excel import for software entries
  - Excel import for project data
  - Excel import for customer data
  - Excel import for ITHC data
  - Download template files

## Technology Stack

### Backend
- Python 3.x
- Flask 3.0.0
- SQLAlchemy ORM
- SQLite database
- Flask-Migrate for database migrations
- Pytest for testing

### Frontend
- HTML5/CSS3
- JavaScript (ES6+)
- Bootstrap 5.3.0
- Bootstrap Icons
- Jest for testing
- Testing Library for DOM testing

## Prerequisites

1. Python 3.x (The project uses Flask 3.0.0)
2. Node.js (for frontend development and testing)
3. Git
4. SQLite (included with Python)
5. npm (Node Package Manager)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ITHCSoftwareApp
```

### 2. Backend Setup

1. Create and activate a Python virtual environment:
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

2. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Initialize the database:
```bash
flask db upgrade
```

### 3. Frontend Setup

1. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Running Tests

### Backend Tests

From the backend directory:
```bash
# Run all tests
pytest

# Run tests with coverage report
pytest --cov=.

# Run specific test file
pytest tests/test_software.py
```

### Frontend Tests

From the frontend directory:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
backend/
├── app.py              # Main Flask application
├── models/            # Database models
│   └── software.py    # Core data models
├── migrations/        # Database migrations
├── tests/            # Backend test files
└── requirements.txt   # Python dependencies

frontend/
├── static/
│   ├── css/          # Stylesheets
│   └── js/           # JavaScript modules
│       ├── main.js       # Software management
│       ├── projects.js   # Project management
│       ├── ithc.js      # ITHC functionality
│       └── utilities.js  # Import/Export features
├── templates/        # HTML templates
└── tests/           # Frontend test files
```

## Running the Application

1. Start the backend server:
```bash
cd backend
flask run
```

2. Access the application at `http://localhost:5000`

## Release Process

### Creating a Release

1. Ensure all tests pass and coverage meets requirements
```bash
# Backend tests
cd backend
python -m pytest --cov=. --cov-report=html:coverage-report

# Frontend tests
cd ../frontend
npm test -- --coverage
```

2. Update version numbers
- Update version in `backend/app.py`
- Update version in `frontend/package.json`
- Update version in `README.md`

3. Create release notes
- Document new features
- Document bug fixes
- Document breaking changes
- List any database migrations
- List any configuration changes

4. Create a GitHub Release
- Tag format: v1.0.0 (following semantic versioning)
- Title: Version 1.0.0
- Include release notes
- Attach build artifacts:
  - Frontend build files
  - Database migration scripts
  - Configuration templates

### Production Deployment

#### Prerequisites
- Linux server (Ubuntu 20.04 LTS or later recommended)
- 4GB RAM minimum
- 40GB storage
- Domain name configured (for SSL)
- Python 3.8+
- Nginx
- PostgreSQL 12+
- Redis (for caching)
- SSL certificate

#### Pre-deployment Checklist
1. Database backup
2. Configuration backup
3. Document rollback plan
4. Maintenance window communication
5. SSL certificate validity check
6. System resource check

#### Deployment Steps

1. Stop existing services
```bash
sudo systemctl stop ithcapp
sudo systemctl stop nginx
```

2. Backup existing deployment
```bash
# Backup database
cd /opt/ithcapp/backend
sqlite3 instance/software.db ".backup '/backup/software-$(date +%Y%m%d).db'"

# Backup configuration
sudo cp -r /etc/nginx/sites-available/ithcapp /backup/
sudo cp /etc/systemd/system/ithcapp.service /backup/
```

3. Deploy new release
```bash
# Download release
cd /opt/ithcapp
git fetch --tags
git checkout v1.0.0  # Replace with actual version

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn psycopg2-binary redis

# Run migrations
export FLASK_APP=app.py
flask db upgrade

# Update frontend
cd ../frontend
npm install
npm run build
```

4. Update configuration
```bash
# Update environment variables
sudo nano /opt/ithcapp/backend/.env
```

Production environment variables:
```ini
FLASK_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/ithcapp
REDIS_URL=redis://localhost:6379
SECRET_KEY=<your-secure-key>
ALLOWED_HOSTS=your-domain.com
```

5. Configure services
```bash
# Update systemd service
sudo nano /etc/systemd/system/ithcapp.service
```

```ini
[Unit]
Description=ITHC Software App
After=network.target postgresql.service redis.service

[Service]
User=ithcapp
Group=ithcapp
WorkingDirectory=/opt/ithcapp/backend
Environment="PATH=/opt/ithcapp/venv/bin"
Environment="FLASK_ENV=production"
Environment="DATABASE_URL=postgresql://user:password@localhost:5432/ithcapp"
Environment="REDIS_URL=redis://localhost:6379"
ExecStart=/opt/ithcapp/venv/bin/gunicorn -w 4 -b 127.0.0.1:8000 app:app --access-logfile /var/log/ithcapp/access.log --error-logfile /var/log/ithcapp/error.log

[Install]
WantedBy=multi-user.target
```

6. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/ithcapp
```

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    access_log /var/log/nginx/ithcapp-access.log;
    error_log /var/log/nginx/ithcapp-error.log;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /opt/ithcapp/frontend/static/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

7. Start services
```bash
# Reload systemd
sudo systemctl daemon-reload

# Start services
sudo systemctl start postgresql
sudo systemctl start redis
sudo systemctl start ithcapp
sudo systemctl start nginx

# Enable services on boot
sudo systemctl enable postgresql
sudo systemctl enable redis
sudo systemctl enable ithcapp
sudo systemctl enable nginx
```

8. Verify deployment
- Check service status
- Verify SSL certificate
- Test all major features
- Monitor logs
- Check database connectivity
- Verify Redis caching

#### Monitoring

1. Application logs
```bash
sudo journalctl -u ithcapp
tail -f /var/log/ithcapp/error.log
```

2. Nginx logs
```bash
tail -f /var/log/nginx/ithcapp-error.log
tail -f /var/log/nginx/ithcapp-access.log
```

3. System monitoring
```bash
htop
df -h
free -m
```

#### Rollback Procedure

1. Stop services
```bash
sudo systemctl stop ithcapp nginx
```

2. Restore backup
```bash
# Restore database
sqlite3 instance/software.db ".restore '/backup/software-YYYYMMDD.db'"

# Restore code
git checkout <previous-version-tag>

# Restore configurations
sudo cp /backup/ithcapp /etc/nginx/sites-available/
sudo cp /backup/ithcapp.service /etc/systemd/system/
```

3. Restart services
```bash
sudo systemctl daemon-reload
sudo systemctl start ithcapp nginx
```

## DevTest VM Deployment

### System Requirements
- Ubuntu 20.04 LTS or later
- 2GB RAM minimum
- 20GB storage
- Python 3.8+
- Nginx
- Systemd
- Git

### 1. System Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3-pip python3-venv nginx git nodejs npm
```

### 2. Application Setup
```bash
# Create application directory
sudo mkdir -p /opt/ithcapp
sudo chown -R $USER:$USER /opt/ithcapp

# Clone repository
git clone <repository-url> /opt/ithcapp
cd /opt/ithcapp

# Setup backend
python3 -m venv venv
source venv/bin/activate
cd backend
pip install -r requirements.txt
pip install gunicorn

# Setup frontend
cd ../frontend
npm install
npm run build
```

### 3. Configure Gunicorn
```bash
# Create systemd service file
sudo nano /etc/systemd/system/ithcapp.service
```

Add this content to the service file:
```ini
[Unit]
Description=ITHC Software App
After=network.target

[Service]
User=<your-user>
WorkingDirectory=/opt/ithcapp/backend
Environment="PATH=/opt/ithcapp/venv/bin"
ExecStart=/opt/ithcapp/venv/bin/gunicorn -w 4 -b 127.0.0.1:8000 app:app

[Install]
WantedBy=multi-user.target
```

### 4. Configure Nginx
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/ithcapp
```

Add this content:
```nginx
server {
    listen 80;
    server_name your-domain-or-ip;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /opt/ithcapp/frontend/static/;
    }
}
```

### 5. Enable and Start Services
```bash
# Configure Nginx
sudo ln -s /etc/nginx/sites-available/ithcapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Start application
sudo systemctl start ithcapp
sudo systemctl enable ithcapp
```

### 6. Database Setup
```bash
cd /opt/ithcapp/backend
source ../venv/bin/activate
export FLASK_APP=app.py
flask db upgrade
```

### 7. Environment Configuration
```bash
# Create environment file
nano /opt/ithcapp/backend/.env
```

Add these variables:
```ini
FLASK_ENV=production
DATABASE_URL=sqlite:///instance/software.db
SECRET_KEY=<your-secret-key>
```

### Monitoring and Logs
```bash
# View application logs
sudo journalctl -u ithcapp

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Security Considerations
1. Configure UFW firewall:
```bash
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

2. Setup SSL with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Backup Configuration
```bash
# Backup database
cd /opt/ithcapp/backend
sqlite3 instance/software.db ".backup '/backup/software-$(date +%Y%m%d).db'"

# Backup configuration
sudo cp -r /etc/nginx/sites-available/ithcapp /backup/
sudo cp /etc/systemd/system/ithcapp.service /backup/
```

## Development Notes

- The application uses SQLite for development. The database file is created at `backend/instance/software.db`
- Frontend JavaScript is organized into modular files for each major feature
- Bootstrap is used for responsive UI design
- The application implements RESTful API patterns
- Database migrations handle schema changes
- Both frontend and backend have comprehensive test coverage

## API Endpoints

### Software
- GET /api/software - List all software
- POST /api/software - Add new software
- PUT /api/software/<id> - Update software
- DELETE /api/software/<id> - Delete software
- POST /api/software/import - Import software from Excel

### Projects
- GET /api/projects - List all projects
- POST /api/projects - Create new project
- PUT /api/projects/<id> - Update project
- DELETE /api/projects/<id> - Delete project
- POST /api/projects/<id>/releases - Add project release
- POST /api/projects/import - Import projects from Excel

### ITHC
- GET /api/ithc/software - List ITHC entries
- POST /api/ithc/software - Add ITHC entry
- PUT /api/ithc/software/<id> - Update ITHC entry
- DELETE /api/ithc/software/<id> - Delete ITHC entry
- POST /api/ithc/software/import - Import ITHC data from Excel

### Customers
- GET /api/customers - List all customers
- POST /api/customers - Add new customer
- POST /api/customers/import - Import customers from Excel
- POST /api/projects/<id>/customers/<id> - Add customer to project

## Troubleshooting

### Database Issues
- If you encounter database errors, try removing the `instance/software.db` file and running `flask db upgrade` again
- Check database migrations in `backend/migrations/versions`

### Frontend Issues
- Clear Jest cache: `npm test -- --clearCache`
- Ensure all dependencies are installed: `npm install`
- Check browser console for JavaScript errors
- Verify Bootstrap is properly loaded

### Backend Issues
- Ensure virtual environment is activated
- Verify all requirements are installed: `pip install -r requirements.txt`
- Check `flask run` output for errors
- Verify database connection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.