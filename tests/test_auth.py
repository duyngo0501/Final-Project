import pytest
from app import app
from models import db, User
import json

@pytest.fixture
def client():
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test-secret-key'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()

def test_register_user(client):
    """Test user registration"""
    data = {
        "email": "test@example.com",
        "password": "password123",
        "role": "user"
    }
    
    response = client.post('/auth/register',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 201
    response_data = json.loads(response.data)
    assert 'message' in response_data
    assert 'user_id' in response_data
    
    # Verify user was created in database
    user = User.query.filter_by(email=data['email']).first()
    assert user is not None
    assert user.role == 'user'

def test_register_duplicate_email(client):
    """Test registering with duplicate email"""
    # Create first user
    data = {
        "email": "test@example.com",
        "password": "password123"
    }
    client.post('/auth/register',
                data=json.dumps(data),
                content_type='application/json')
    
    # Try to register with same email
    response = client.post('/auth/register',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 400
    assert 'error' in json.loads(response.data)

def test_login_success(client):
    """Test successful login"""
    # Register user first
    data = {
        "email": "test@example.com",
        "password": "password123"
    }
    client.post('/auth/register',
                data=json.dumps(data),
                content_type='application/json')
    
    # Try to login
    response = client.post('/auth/login',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 200
    response_data = json.loads(response.data)
    assert 'token' in response_data
    assert 'user' in response_data
    assert response_data['user']['email'] == data['email']

def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    data = {
        "email": "test@example.com",
        "password": "wrongpassword"
    }
    
    response = client.post('/auth/login',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 401
    assert 'error' in json.loads(response.data)

def test_get_user_info(client):
    """Test getting user info with valid token"""
    # Register and login first
    data = {
        "email": "test@example.com",
        "password": "password123"
    }
    client.post('/auth/register',
                data=json.dumps(data),
                content_type='application/json')
    
    login_response = client.post('/auth/login',
                               data=json.dumps(data),
                               content_type='application/json')
    token = json.loads(login_response.data)['token']
    
    # Get user info
    response = client.get('/auth/me',
                         headers={'Authorization': f'Bearer {token}'})
    
    assert response.status_code == 200
    response_data = json.loads(response.data)
    assert response_data['email'] == data['email']

def test_get_user_info_no_token(client):
    """Test getting user info without token"""
    response = client.get('/auth/me')
    assert response.status_code == 401
    assert 'error' in json.loads(response.data)

def test_get_user_info_invalid_token(client):
    """Test getting user info with invalid token"""
    response = client.get('/auth/me',
                         headers={'Authorization': 'Bearer invalid-token'})
    assert response.status_code == 401
    assert 'error' in json.loads(response.data)

def test_register_admin(client):
    """Test registering an admin user"""
    data = {
        "email": "admin@example.com",
        "password": "admin123",
        "role": "admin"
    }
    
    response = client.post('/auth/register',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 201
    response_data = json.loads(response.data)
    assert 'user_id' in response_data
    
    # Verify user was created with admin role
    user = User.query.filter_by(email=data['email']).first()
    assert user is not None
    assert user.role == 'admin' 