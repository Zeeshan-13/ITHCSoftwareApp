# Software Management System

A web-based application for managing software versions, projects, and customer relationships.

## Features

- Software version tracking and management
- Project management with release versioning
- Customer relationship management
- Excel import functionality for bulk software updates
- RESTful API backend
- Modern responsive frontend

## Technology Stack

- Backend:
  - Python 3.x
  - Flask 3.0.0
  - SQLAlchemy
  - SQLite database

- Frontend:
  - HTML5/CSS3
  - JavaScript
  - Bootstrap
  - Jest for testing

## Prerequisites

1. Python 3.x (The project uses Flask 3.0.0)
2. Node.js (for frontend development and testing)
3. Git
4. SQLite (included with Python)

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
├── app.py              # Main application file
├── models/            # Database models
├── tests/            # Backend test files
└── migrations/       # Database migration files

frontend/
├── static/           # Static assets (JS, CSS)
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

## Development Notes

- The application uses SQLite for development. The database file will be created at `backend/instance/software.db`
- Frontend tests use Jest with jsdom for DOM testing
- Backend tests use pytest with an in-memory SQLite database
- Database migrations are handled using Flask-Migrate

## Troubleshooting

### Database Issues
- If you encounter database errors, try removing the `instance/software.db` file and running `flask db upgrade` again

### Frontend Test Issues
- Clear Jest cache: `npm test -- --clearCache`
- Ensure all dependencies are installed: `npm install`

### Backend Test Issues
- Ensure your virtual environment is activated
- Verify all requirements are installed: `pip install -r requirements.txt`
- Check Python path settings in `pytest.ini`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[Add your license here]

## Contact

[Add your contact information here]