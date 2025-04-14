import pytest
import json
from datetime import datetime
from io import BytesIO
import pandas as pd
from app import create_app
from backend.models.software import Software  # Updated import path

@pytest.fixture
def app():
    app = create_app('testing')
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_get_software_list(client):
    response = client.get('/api/software')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_create_software(client):
    software_data = {
        'name': 'Test Software',
        'software_type': 'Application',
        'latest_version': '1.0.0',
        'check_url': 'http://test.com'
    }
    response = client.post('/api/software', 
                         json=software_data)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['name'] == software_data['name']

def test_update_software(client):
    # First create a software
    software_data = {
        'name': 'Test Software',
        'software_type': 'Application',
        'latest_version': '1.0.0',
        'check_url': 'http://test.com'
    }
    create_response = client.post('/api/software', 
                                json=software_data)
    software_id = json.loads(create_response.data)['id']
    
    # Update the software
    update_data = {
        'name': 'Updated Software',
        'latest_version': '2.0.0'
    }
    response = client.put(f'/api/software/{software_id}', 
                         json=update_data)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['name'] == update_data['name']
    assert data['latest_version'] == update_data['latest_version']

def test_delete_software(client):
    # First create a software
    software_data = {
        'name': 'Test Software',
        'software_type': 'Application',
        'latest_version': '1.0.0',
        'check_url': 'http://test.com'
    }
    create_response = client.post('/api/software', 
                                json=software_data)
    software_id = json.loads(create_response.data)['id']
    
    # Delete the software
    response = client.delete(f'/api/software/{software_id}')
    assert response.status_code == 200

def test_import_excel(client):
    # Create a test Excel file
    df = pd.DataFrame({
        'name': ['Test Software 1', 'Test Software 2'],
        'software_type': ['App', 'Tool'],
        'latest_version': ['1.0.0', '2.0.0'],
        'check_url': ['http://test1.com', 'http://test2.com']
    })
    excel_file = BytesIO()
    df.to_excel(excel_file, index=False)
    excel_file.seek(0)
    
    response = client.post('/api/software/import',
                         data={'file': (excel_file, 'test.xlsx')},
                         content_type='multipart/form-data')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['imported'] == 2

def test_invalid_software_data(client):
    invalid_data = {
        'name': '',  # Empty name should be invalid
        'software_type': 'Application'
    }
    response = client.post('/api/software', 
                         json=invalid_data)
    assert response.status_code == 400

def test_software_not_found(client):
    response = client.get('/api/software/99999')  # Non-existent ID
    assert response.status_code == 404

def test_duplicate_software_name(client):
    software_data = {
        'name': 'Test Software',
        'software_type': 'Application',
        'latest_version': '1.0.0',
        'check_url': 'http://test.com'
    }
    # Create first software
    client.post('/api/software', json=software_data)
    # Try to create software with same name
    response = client.post('/api/software', json=software_data)
    assert response.status_code == 400

def test_search_software(client):
    # Create test software
    software_data = {
        'name': 'Unique Test Software',
        'software_type': 'Application',
        'latest_version': '1.0.0',
        'check_url': 'http://test.com'
    }
    client.post('/api/software', json=software_data)
    
    # Search for the software
    response = client.get('/api/software/search?q=Unique')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) > 0
    assert data[0]['name'] == software_data['name']

def test_create_ithc_software(client):
    # First create a software
    software_data = {
        'name': 'Test Software',
        'software_type': 'Application',
        'latest_version': '1.0.0'
    }
    software_response = client.post('/api/software', json=software_data)
    software_id = json.loads(software_response.data)['id']
    
    # Create a project
    project_data = {
        'name': 'Test Project',
        'description': 'Test Description'
    }
    project_response = client.post('/api/projects', json=project_data)
    project_id = json.loads(project_response.data)['id']
    
    # Create ITHC software entry
    ithc_data = {
        'project_id': project_id,
        'software_id': software_id,
        'project_version': '1.0.0',
        'current_software_version': '1.0.0'
    }
    response = client.post('/api/ithc/software', json=ithc_data)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['project_version'] == ithc_data['project_version']
    assert data['current_software_version'] == ithc_data['current_software_version']

def test_get_ithc_software_list(client):
    response = client.get('/api/ithc/software')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_update_ithc_software(client):
    # First create necessary data
    software_data = {
        'name': 'Test Software',
        'software_type': 'Application',
        'latest_version': '1.0.0'
    }
    software_response = client.post('/api/software', json=software_data)
    software_id = json.loads(software_response.data)['id']
    
    project_data = {
        'name': 'Test Project',
        'description': 'Test Description'
    }
    project_response = client.post('/api/projects', json=project_data)
    project_id = json.loads(project_response.data)['id']
    
    ithc_data = {
        'project_id': project_id,
        'software_id': software_id,
        'project_version': '1.0.0',
        'current_software_version': '1.0.0'
    }
    ithc_response = client.post('/api/ithc/software', json=ithc_data)
    ithc_id = json.loads(ithc_response.data)['id']
    
    # Update ITHC software
    update_data = {
        'current_software_version': '2.0.0'
    }
    response = client.put(f'/api/ithc/software/{ithc_id}', json=update_data)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['current_software_version'] == update_data['current_software_version']

def test_invalid_ithc_software_data(client):
    invalid_data = {
        'project_id': 1,  # Missing required fields
    }
    response = client.post('/api/ithc/software', json=invalid_data)
    assert response.status_code == 400

def test_ithc_software_search(client):
    # Create necessary test data first
    software_data = {
        'name': 'Unique Test Software',
        'software_type': 'Application',
        'latest_version': '1.0.0'
    }
    software_response = client.post('/api/software', json=software_data)
    software_id = json.loads(software_response.data)['id']
    
    project_data = {
        'name': 'Unique Test Project',
        'description': 'Test Description'
    }
    project_response = client.post('/api/projects', json=project_data)
    project_id = json.loads(project_response.data)['id']
    
    ithc_data = {
        'project_id': project_id,
        'software_id': software_id,
        'project_version': '1.0.0',
        'current_software_version': '1.0.0'
    }
    client.post('/api/ithc/software', json=ithc_data)
    
    # Search for the ITHC software
    response = client.get('/api/ithc/software/search?project=Unique')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) > 0
    assert data[0]['project']['name'] == project_data['name']