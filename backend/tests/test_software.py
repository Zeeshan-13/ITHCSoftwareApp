import pytest
import json
from datetime import datetime
from io import BytesIO
import pandas as pd
from app import create_app
from models.software import Software

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