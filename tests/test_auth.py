import pytest
from app import app
from models import db, User
import json

@pytest.fixture
def client():
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test-secret-key'
    app.config['JWT_SECRET_KEY'] = 'test-jwt-secret-key'
    
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
        "username": "testuser",
        "password": "password123",
        "role": "user"
    }
    
    response = client.post('/auth/register',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 201
    response_data = json.loads(response.data)
    assert 'message' in response_data
    assert 'user' in response_data
    assert response_data['user']['email'] == data['email']
    assert response_data['user']['username'] == data['username']
    assert response_data['user']['role'] == 'user'
    
    # Verify user was created in database
    user = User.query.filter_by(email=data['email']).first()
    assert user is not None
    assert user.username == data['username']
    assert user.role == 'user'

def test_register_duplicate_email(client):
    """Test registering with duplicate email"""
    # Create first user
    data = {
        "email": "test@example.com",
        "username": "testuser",
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

def test_register_duplicate_username(client):
    """Test registering with duplicate username"""
    # Create first user
    data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "password123"
    }
    client.post('/auth/register',
                data=json.dumps(data),
                content_type='application/json')
    
    # Try to register with same username
    data['email'] = 'another@example.com'
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
        "username": "testuser",
        "password": "password123"
    }
    client.post('/auth/register',
                data=json.dumps(data),
                content_type='application/json')
    
    # Try to login
    login_data = {
        "email": data['email'],
        "password": data['password']
    }
    response = client.post('/auth/login',
                          data=json.dumps(login_data),
                          content_type='application/json')
    
    assert response.status_code == 200
    response_data = json.loads(response.data)
    assert 'access_token' in response_data
    assert 'refresh_token' in response_data
    assert 'user' in response_data
    assert response_data['user']['email'] == data['email']
    assert response_data['user']['username'] == data['username']

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

def test_refresh_token(client):
    """Test refreshing access token"""
    # Register and login first
    data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "password123"
    }
    client.post('/auth/register',
                data=json.dumps(data),
                content_type='application/json')
    
    login_response = client.post('/auth/login',
                               data=json.dumps({
                                   "email": data['email'],
                                   "password": data['password']
                               }),
                               content_type='application/json')
    refresh_token = json.loads(login_response.data)['refresh_token']
    
    # Refresh token
    response = client.post('/auth/refresh',
                          headers={'Authorization': f'Bearer {refresh_token}'})
    
    assert response.status_code == 200
    response_data = json.loads(response.data)
    assert 'access_token' in response_data

def test_get_user_info(client):
    """Test getting user info with valid token"""
    # Register and login first
    data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "password123"
    }
    client.post('/auth/register',
                data=json.dumps(data),
                content_type='application/json')
    
    login_response = client.post('/auth/login',
                               data=json.dumps({
                                   "email": data['email'],
                                   "password": data['password']
                               }),
                               content_type='application/json')
    access_token = json.loads(login_response.data)['access_token']
    
    # Get user info
    response = client.get('/auth/me',
                         headers={'Authorization': f'Bearer {access_token}'})
    
    assert response.status_code == 200
    response_data = json.loads(response.data)
    assert response_data['email'] == data['email']
    assert response_data['username'] == data['username']

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
        "username": "adminuser",
        "password": "admin123",
        "role": "admin"
    }
    
    response = client.post('/auth/register',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 201
    response_data = json.loads(response.data)
    assert 'user' in response_data
    
    # Verify user was created with admin role
    user = User.query.filter_by(email=data['email']).first()
    assert user is not None
    assert user.username == data['username']
    assert user.role == 'admin' 