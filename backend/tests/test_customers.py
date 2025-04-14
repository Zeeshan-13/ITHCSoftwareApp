import json
import pytest
import io
import pandas as pd
from models.software import Customer

def test_get_customers_empty(client):
    """Test getting customers list when empty"""
    response = client.get('/api/customers')
    assert response.status_code == 200
    assert json.loads(response.data) == []

def test_add_customer(client, sample_customer):
    """Test adding new customer"""
    response = client.post('/api/customers',
                         data=json.dumps(sample_customer),
                         content_type='application/json')
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['name'] == sample_customer['name']
    assert data['email'] == sample_customer['email']
    assert data['contact_person'] == sample_customer['contact_person']

def test_add_customer_minimal(client):
    """Test adding customer with only required fields"""
    minimal_customer = {
        'name': 'Minimal Customer'
    }
    response = client.post('/api/customers',
                         data=json.dumps(minimal_customer),
                         content_type='application/json')
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['name'] == minimal_customer['name']
    assert data['email'] == ''
    assert data['contact_person'] == ''

def test_get_customers_after_add(client, sample_customer):
    """Test getting customers list after adding one"""
    client.post('/api/customers',
                data=json.dumps(sample_customer),
                content_type='application/json')
    response = client.get('/api/customers')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 1
    assert data[0]['name'] == sample_customer['name']

def test_import_customers_excel(client):
    """Test importing customers from Excel file"""
    # Create test Excel data
    df = pd.DataFrame({
        'Name': ['Test Customer 1', 'Test Customer 2'],
        'Email': ['test1@example.com', 'test2@example.com'],
        'Contact Person': ['Contact 1', 'Contact 2']
    })
    excel_file = io.BytesIO()
    df.to_excel(excel_file, index=False)
    excel_file.seek(0)
    
    response = client.post('/api/customers/import',
                         data={'file': (excel_file, 'test.xlsx')},
                         content_type='multipart/form-data')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['imported'] == 2
    assert data['updated'] == 0

def test_import_customers_excel_with_updates(client, sample_customer):
    """Test importing customers with updates to existing ones"""
    # First add a customer
    client.post('/api/customers',
               data=json.dumps(sample_customer),
               content_type='application/json')
    
    # Create Excel with same customer name but updated info
    df = pd.DataFrame({
        'Name': [sample_customer['name']],
        'Email': ['updated@example.com'],
        'Contact Person': ['Updated Contact']
    })
    excel_file = io.BytesIO()
    df.to_excel(excel_file, index=False)
    excel_file.seek(0)
    
    response = client.post('/api/customers/import',
                         data={'file': (excel_file, 'test.xlsx')},
                         content_type='multipart/form-data')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['imported'] == 0
    assert data['updated'] == 1
    
    # Verify the customer was updated
    response = client.get('/api/customers')
    customers = json.loads(response.data)
    assert len(customers) == 1
    assert customers[0]['email'] == 'updated@example.com'
    assert customers[0]['contact_person'] == 'Updated Contact'

def test_import_customers_invalid_file(client):
    """Test importing customers with invalid file"""
    response = client.post('/api/customers/import',
                         data={'file': (io.BytesIO(b'invalid'), 'test.txt')},
                         content_type='multipart/form-data')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data