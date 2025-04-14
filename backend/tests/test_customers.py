import json
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