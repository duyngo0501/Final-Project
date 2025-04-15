import pytest
from app import app
from models import db, Game
import json

@pytest.fixture
def client():
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()

@pytest.fixture
def sample_game(client):
    """Create a sample game for testing"""
    game = Game(
        title="Test Game",
        description="A test game",
        price=29.99,
        image_url="http://example.com/image.jpg",
        stock=100
    )
    db.session.add(game)
    db.session.commit()
    return game

def test_get_games_empty(client):
    """Test getting games when database is empty"""
    response = client.get('/games')
    assert response.status_code == 200
    assert json.loads(response.data) == []

def test_get_games(client, sample_game):
    """Test getting all games"""
    response = client.get('/games')
    assert response.status_code == 200
    games = json.loads(response.data)
    assert len(games) == 1
    assert games[0]['title'] == 'Test Game'
    assert games[0]['price'] == 29.99
    assert games[0]['stock'] == 100

def test_get_game_by_id(client, sample_game):
    """Test getting a specific game by ID"""
    response = client.get(f'/games/{sample_game.id}')
    assert response.status_code == 200
    game = json.loads(response.data)
    assert game['title'] == 'Test Game'
    assert game['price'] == 29.99
    assert game['stock'] == 100

def test_get_game_not_found(client):
    """Test getting a non-existent game"""
    response = client.get('/games/999')
    assert response.status_code == 404
    assert 'error' in json.loads(response.data)

def test_create_game_valid_request(client):
    """Test creating a game with valid data"""
    data = {
        "title": "Test Game",
        "description": "A test game",
        "price": 29.99,
        "image_url": "http://example.com/image.jpg",
        "stock": 100
    }
    
    response = client.post('/games', 
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 201
    response_data = json.loads(response.data)
    assert response_data['message'] == 'Game created successfully'
    assert 'game_id' in response_data
    
    # Verify game was created in database
    game = db.session.get(Game, response_data['game_id'])
    assert game is not None
    assert game.title == data['title']
    assert game.price == data['price']
    assert game.stock == data['stock']

def test_update_game_valid_request(client, sample_game):
    """Test updating a game with valid data"""
    data = {
        "title": "Updated Game",
        "description": "An updated game",
        "price": 39.99,
        "stock": 200
    }
    
    response = client.put(f'/games/{sample_game.id}',
                         data=json.dumps(data),
                         content_type='application/json')
    
    assert response.status_code == 200
    assert json.loads(response.data)['message'] == 'Game updated successfully'
    
    # Verify game was updated in database
    game = db.session.get(Game, sample_game.id)
    assert game.title == data['title']
    assert game.description == data['description']
    assert game.price == data['price']
    assert game.stock == data['stock']

def test_update_game_not_found(client):
    """Test updating a non-existent game"""
    data = {"title": "Updated Game"}
    response = client.put('/games/999',
                         data=json.dumps(data),
                         content_type='application/json')
    assert response.status_code == 404
    assert 'error' in json.loads(response.data)

def test_update_game_invalid_price(client, sample_game):
    """Test updating a game with invalid price"""
    data = {"price": -10}
    response = client.put(f'/games/{sample_game.id}',
                         data=json.dumps(data),
                         content_type='application/json')
    assert response.status_code == 400
    assert 'error' in json.loads(response.data)

def test_update_game_invalid_stock(client, sample_game):
    """Test updating a game with invalid stock"""
    data = {"stock": -10}
    response = client.put(f'/games/{sample_game.id}',
                         data=json.dumps(data),
                         content_type='application/json')
    assert response.status_code == 400
    assert 'error' in json.loads(response.data)

def test_delete_game(client, sample_game):
    """Test deleting a game"""
    response = client.delete(f'/games/{sample_game.id}')
    assert response.status_code == 200
    assert json.loads(response.data)['message'] == 'Game deleted successfully'
    
    # Verify game was deleted from database
    game = db.session.get(Game, sample_game.id)
    assert game is None

def test_delete_game_not_found(client):
    """Test deleting a non-existent game"""
    response = client.delete('/games/999')
    assert response.status_code == 404
    assert 'error' in json.loads(response.data)

def test_create_game_missing_title(client):
    """Test creating a game without title"""
    data = {
        "description": "A test game",
        "price": 29.99,
        "stock": 100
    }
    
    response = client.post('/games',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 400
    response_data = json.loads(response.data)
    assert 'error' in response_data
    assert 'Title is required' in response_data['error']

def test_create_game_missing_price(client):
    """Test creating a game without price"""
    data = {
        "title": "Test Game",
        "description": "A test game",
        "stock": 100
    }
    
    response = client.post('/games',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 400
    response_data = json.loads(response.data)
    assert 'error' in response_data
    assert 'Price is required' in response_data['error']

def test_create_game_negative_price(client):
    """Test creating a game with negative price"""
    data = {
        "title": "Test Game",
        "description": "A test game",
        "price": -29.99,
        "stock": 100
    }
    
    response = client.post('/games',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 400
    response_data = json.loads(response.data)
    assert 'error' in response_data
    assert 'Price must be a positive number' in response_data['error']

def test_create_game_zero_price(client):
    """Test creating a game with zero price"""
    data = {
        "title": "Test Game",
        "description": "A test game",
        "price": 0,
        "stock": 100
    }
    
    response = client.post('/games',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 400
    response_data = json.loads(response.data)
    assert 'error' in response_data
    assert 'Price must be a positive number' in response_data['error']

def test_create_game_negative_stock(client):
    """Test creating a game with negative stock"""
    data = {
        "title": "Test Game",
        "description": "A test game",
        "price": 29.99,
        "stock": -10
    }
    
    response = client.post('/games',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 400
    response_data = json.loads(response.data)
    assert 'error' in response_data
    assert 'Stock must be a non-negative integer' in response_data['error']

def test_create_game_invalid_price_type(client):
    """Test creating a game with invalid price type"""
    data = {
        "title": "Test Game",
        "description": "A test game",
        "price": "not a number",
        "stock": 100
    }
    
    response = client.post('/games',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 400
    response_data = json.loads(response.data)
    assert 'error' in response_data
    assert 'Price must be a valid number' in response_data['error']

def test_create_game_invalid_stock_type(client):
    """Test creating a game with invalid stock type"""
    data = {
        "title": "Test Game",
        "description": "A test game",
        "price": 29.99,
        "stock": "not a number"
    }
    
    response = client.post('/games',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 400
    response_data = json.loads(response.data)
    assert 'error' in response_data
    assert 'Stock must be a valid integer' in response_data['error'] 