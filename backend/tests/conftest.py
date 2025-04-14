import os
import tempfile
import pytest
from app import create_app
from models.software import db

@pytest.fixture
def client():
    app = create_app('testing')
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()

@pytest.fixture
def sample_software():
    return {
        'name': 'Test Software',
        'software_type': 'Test Type',
        'latest_version': '1.0.0',
        'check_url': 'http://test.com'
    }

@pytest.fixture
def sample_project():
    return {
        'name': 'Test Project',
        'description': 'Test Description',
        'start_date': '2025-04-14',
        'end_date': '2025-12-31'
    }

@pytest.fixture
def sample_customer():
    return {
        'name': 'Test Customer',
        'email': 'test@example.com',
        'contact_person': 'Test Person'
    }