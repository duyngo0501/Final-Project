import pytest
from app import app
from models import db, Game, User
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

@pytest.fixture
def admin_token(client):
    """Create an admin user and return their token"""
    # Create admin user
    admin = User(email="admin@example.com", role="admin")
    admin.set_password("admin123")
    db.session.add(admin)
    db.session.commit()
    
    # Login to get token
    response = client.post('/auth/login',
                          data=json.dumps({
                              "email": "admin@example.com",
                              "password": "admin123"
                          }),
                          content_type='application/json')
    return json.loads(response.data)['token']

@pytest.fixture
def user_token(client):
    """Create a regular user and return their token"""
    # Create regular user
    user = User(email="user@example.com", role="user")
    user.set_password("user123")
    db.session.add(user)
    db.session.commit()
    
    # Login to get token
    response = client.post('/auth/login',
                          data=json.dumps({
                              "email": "user@example.com",
                              "password": "user123"
                          }),
                          content_type='application/json')
    return json.loads(response.data)['token']

@pytest.fixture
def sample_game():
    """Create a sample game"""
    game = Game(
        title="Test Game",
        description="A test game",
        price=29.99,
        stock=10,
        genre="Action",
        platform="PC"
    )
    db.session.add(game)
    db.session.commit()
    return game

def test_get_games_empty(client):
    """Test getting games when database is empty"""
    response = client.get('/games')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['total'] == 0
    assert len(data['games']) == 0

def test_get_games_pagination(client, sample_game):
    """Test getting games with pagination"""
    # Create additional games
    for i in range(15):
        game = Game(
            title=f"Game {i}",
            description=f"Description {i}",
            price=29.99,
            stock=10,
            genre="Action",
            platform="PC"
        )
        db.session.add(game)
    db.session.commit()
    
    # Test first page
    response = client.get('/games?page=1&limit=10')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['total'] == 16  # 15 new games + 1 sample game
    assert len(data['games']) == 10
    
    # Test second page
    response = client.get('/games?page=2&limit=10')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['games']) == 6

def test_get_game_by_id(client, sample_game):
    """Test getting a specific game by ID"""
    response = client.get(f'/games/{sample_game.id}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == sample_game.title
    assert data['price'] == sample_game.price

def test_get_game_not_found(client):
    """Test getting a non-existent game"""
    response = client.get('/games/999')
    assert response.status_code == 404

def test_create_game_unauthorized(client):
    """Test creating a game without authentication"""
    data = {
        "title": "New Game",
        "description": "A new game",
        "price": 29.99,
        "stock": 10,
        "genre": "Action",
        "platform": "PC"
    }
    
    response = client.post('/games',
                          data=json.dumps(data),
                          content_type='application/json')
    assert response.status_code == 401

def test_create_game_not_admin(client, user_token):
    """Test creating a game as non-admin user"""
    data = {
        "title": "New Game",
        "description": "A new game",
        "price": 29.99,
        "stock": 10,
        "genre": "Action",
        "platform": "PC"
    }
    
    response = client.post('/games',
                          data=json.dumps(data),
                          content_type='application/json',
                          headers={'Authorization': f'Bearer {user_token}'})
    assert response.status_code == 403

def test_create_game_valid_request(client, admin_token):
    """Test creating a game with valid data"""
    data = {
        "title": "New Game",
        "description": "A new game",
        "price": 29.99,
        "stock": 10,
        "genre": "Action",
        "platform": "PC"
    }
    
    response = client.post('/games',
                          data=json.dumps(data),
                          content_type='application/json',
                          headers={'Authorization': f'Bearer {admin_token}'})
    
    assert response.status_code == 201
    response_data = json.loads(response.data)
    assert response_data['title'] == data['title']
    assert response_data['price'] == data['price']

def test_update_game_unauthorized(client, sample_game):
    """Test updating a game without authentication"""
    data = {"price": 39.99}
    response = client.put(f'/games/{sample_game.id}',
                         data=json.dumps(data),
                         content_type='application/json')
    assert response.status_code == 401

def test_update_game_not_admin(client, user_token, sample_game):
    """Test updating a game as non-admin user"""
    data = {"price": 39.99}
    response = client.put(f'/games/{sample_game.id}',
                         data=json.dumps(data),
                         content_type='application/json',
                         headers={'Authorization': f'Bearer {user_token}'})
    assert response.status_code == 403

def test_update_game_valid_request(client, admin_token, sample_game):
    """Test updating a game with valid data"""
    data = {"price": 39.99}
    response = client.put(f'/games/{sample_game.id}',
                         data=json.dumps(data),
                         content_type='application/json',
                         headers={'Authorization': f'Bearer {admin_token}'})
    
    assert response.status_code == 200
    response_data = json.loads(response.data)
    assert response_data['price'] == data['price']

def test_update_game_not_found(client, admin_token):
    """Test updating a non-existent game"""
    data = {"price": 39.99}
    response = client.put('/games/999',
                         data=json.dumps(data),
                         content_type='application/json',
                         headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 404

def test_delete_game_unauthorized(client, sample_game):
    """Test deleting a game without authentication"""
    response = client.delete(f'/games/{sample_game.id}')
    assert response.status_code == 401

def test_delete_game_not_admin(client, user_token, sample_game):
    """Test deleting a game as non-admin user"""
    response = client.delete(f'/games/{sample_game.id}',
                           headers={'Authorization': f'Bearer {user_token}'})
    assert response.status_code == 403

def test_delete_game(client, admin_token, sample_game):
    """Test deleting a game"""
    response = client.delete(f'/games/{sample_game.id}',
                           headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    
    # Verify game was deleted
    game = Game.query.get(sample_game.id)
    assert game is None

def test_delete_game_not_found(client, admin_token):
    """Test deleting a non-existent game"""
    response = client.delete('/games/999',
                           headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 404 