import pytest
import json
from datetime import datetime
from app import create_app
from models.software import Software

@pytest.fixture
def app():
    app = create_app('testing')
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_get_projects_list(client):
    response = client.get('/api/projects')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_create_project(client):
    project_data = {
        'name': 'Test Project',
        'description': 'Test Description',
        'start_date': '2025-04-14',
        'end_date': '2025-12-31'
    }
    response = client.post('/api/projects', 
                         json=project_data)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['name'] == project_data['name']

def test_update_project(client):
    # First create a project
    project_data = {
        'name': 'Test Project',
        'description': 'Test Description',
        'start_date': '2025-04-14',
        'end_date': '2025-12-31'
    }
    create_response = client.post('/api/projects', 
                                json=project_data)
    project_id = json.loads(create_response.data)['id']
    
    # Update the project
    update_data = {
        'name': 'Updated Project',
        'description': 'Updated Description'
    }
    response = client.put(f'/api/projects/{project_id}', 
                         json=update_data)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['name'] == update_data['name']
    assert data['description'] == update_data['description']

def test_delete_project(client):
    # First create a project
    project_data = {
        'name': 'Test Project',
        'description': 'Test Description',
        'start_date': '2025-04-14',
        'end_date': '2025-12-31'
    }
    create_response = client.post('/api/projects', 
                                json=project_data)
    project_id = json.loads(create_response.data)['id']
    
    # Delete the project
    response = client.delete(f'/api/projects/{project_id}')
    assert response.status_code == 200

def test_add_customer_to_project(client):
    # Create a project
    project_data = {
        'name': 'Test Project',
        'description': 'Test Description',
        'start_date': '2025-04-14',
        'end_date': '2025-12-31'
    }
    project_response = client.post('/api/projects', 
                                 json=project_data)
    project_id = json.loads(project_response.data)['id']
    
    # Create a customer
    customer_data = {
        'name': 'Test Customer',
        'email': 'test@example.com',
        'contact_person': 'John Doe'
    }
    customer_response = client.post('/api/customers', 
                                  json=customer_data)
    customer_id = json.loads(customer_response.data)['id']
    
    # Add customer to project
    response = client.post(f'/api/projects/{project_id}/customers/{customer_id}')
    assert response.status_code == 200
    
    # Verify customer is in project
    project_response = client.get(f'/api/projects/{project_id}')
    project_data = json.loads(project_response.data)
    assert any(c['id'] == customer_id for c in project_data['customers'])

def test_create_project_release(client):
    # Create a project
    project_data = {
        'name': 'Test Project',
        'description': 'Test Description',
        'start_date': '2025-04-14',
        'end_date': '2025-12-31'
    }
    project_response = client.post('/api/projects', 
                                 json=project_data)
    project_id = json.loads(project_response.data)['id']
    
    # Create a release
    release_data = {
        'version': '1.0.0',
        'release_date': '2025-05-01',
        'notes': 'Initial release'
    }
    response = client.post(f'/api/projects/{project_id}/releases', 
                         json=release_data)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['version'] == release_data['version']

def test_invalid_project_data(client):
    invalid_data = {
        'name': '',  # Empty name should be invalid
        'description': 'Test Description'
    }
    response = client.post('/api/projects', 
                         json=invalid_data)
    assert response.status_code == 400

def test_project_not_found(client):
    response = client.get('/api/projects/99999')  # Non-existent ID
    assert response.status_code == 404

def test_duplicate_project_name(client):
    project_data = {
        'name': 'Test Project',
        'description': 'Test Description',
        'start_date': '2025-04-14',
        'end_date': '2025-12-31'
    }
    # Create first project
    client.post('/api/projects', json=project_data)
    # Try to create project with same name
    response = client.post('/api/projects', json=project_data)
    assert response.status_code == 400

def test_search_projects(client):
    # Create test project
    project_data = {
        'name': 'Unique Test Project',
        'description': 'Test Description',
        'start_date': '2025-04-14',
        'end_date': '2025-12-31'
    }
    client.post('/api/projects', json=project_data)
    
    # Search for the project
    response = client.get('/api/projects/search?q=Unique')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) > 0
    assert data[0]['name'] == project_data['name']

def test_project_customer_validation(client):
    # Test adding non-existent customer to project
    project_data = {
        'name': 'Test Project',
        'description': 'Test Description',
        'start_date': '2025-04-14',
        'end_date': '2025-12-31'
    }
    project_response = client.post('/api/projects', 
                                 json=project_data)
    project_id = json.loads(project_response.data)['id']
    
    response = client.post(f'/api/projects/{project_id}/customers/99999')
    assert response.status_code == 404