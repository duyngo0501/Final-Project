from flask import Flask, request, jsonify
from models import (
    db, Game, User, GameCreate, GameResponse, GameDetail,
    UserCreate, UserLogin, UserResponse, GameUpdate
)
from flask_migrate import Migrate
from flask_jwt_extended import (
    JWTManager, create_access_token, get_jwt_identity, 
    jwt_required, create_refresh_token
)
from flask_cors import CORS
import os
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
from pydantic import ValidationError

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///games.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

# JWT configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config['SECRET_KEY'])
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Error handlers
@app.errorhandler(ValidationError)
def handle_validation_error(error):
    return jsonify({'error': str(error)}), 400

# Authentication endpoints
@app.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate input data using Pydantic
        user_data = UserCreate(**data)
        
        # Check if user already exists
        if User.query.filter_by(email=user_data.email).first():
            return jsonify({'error': 'Email already registered'}), 400
            
        if User.query.filter_by(username=user_data.username).first():
            return jsonify({'error': 'Username already taken'}), 400
            
        # Create new user
        user = User(
            email=user_data.email,
            username=user_data.username,
            role=user_data.role
        )
        user.set_password(user_data.password)
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': UserResponse(**user.to_dict()).dict()
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Validate input data using Pydantic
        login_data = UserLogin(**data)
        
        user = User.query.filter_by(email=login_data.email).first()
        
        if not user or not user.check_password(login_data.password):
            return jsonify({'error': 'Invalid email or password'}), 401
            
        # Create access and refresh tokens
        access_token = create_access_token(identity=user.id, additional_claims={'role': user.role})
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': UserResponse(**user.to_dict()).dict()
        })
        
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Get a new access token using refresh token"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    access_token = create_access_token(identity=user.id, additional_claims={'role': user.role})
    
    return jsonify({
        'access_token': access_token
    })

@app.route('/auth/me', methods=['GET'])
@jwt_required()
def get_user_info():
    """Get current user information"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify(UserResponse(**user.to_dict()).dict())

# Game endpoints with pagination
@app.route('/games', methods=['GET'])
def get_games():
    """Get all games with pagination"""
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    
    pagination = Game.query.paginate(page=page, per_page=limit, error_out=False)
    games = pagination.items
    
    return jsonify({
        'games': [game.to_dict() for game in games],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@app.route('/games/<int:game_id>', methods=['GET'])
def get_game(game_id):
    """Get a specific game by ID"""
    game = db.session.get(Game, game_id)
    if not game:
        return jsonify({'error': 'Game not found'}), 404
    
    return jsonify(game.to_dict())

@app.route('/games', methods=['POST'])
@jwt_required()
def create_game():
    """Create a new game (admin only)"""
    try:
        # Check if user is admin
        claims = get_jwt_identity()
        user = User.query.get(claims)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
            
        data = request.get_json()
        
        # Validate input data using Pydantic
        game_data = GameCreate(**data)
        
        # Create new game
        new_game = Game(
            title=game_data.title,
            description=game_data.description,
            price=game_data.price,
            image_url=game_data.image_url,
            stock=game_data.stock,
            created_by=user.id
        )
        
        db.session.add(new_game)
        db.session.commit()
        
        return jsonify({
            'message': 'Game created successfully',
            'game': GameDetail(**new_game.to_dict()).dict()
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/games/<int:game_id>', methods=['PUT'])
@jwt_required()
def update_game(game_id):
    """Update a specific game (admin only)"""
    try:
        # Check if user is admin
        claims = get_jwt_identity()
        user = User.query.get(claims)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
            
        game = db.session.get(Game, game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        data = request.get_json()
        
        # Validate input data using Pydantic
        game_data = GameUpdate(**data)
        
        # Update game fields
        if game_data.title is not None:
            game.title = game_data.title
        if game_data.description is not None:
            game.description = game_data.description
        if game_data.price is not None:
            game.price = game_data.price
        if game_data.image_url is not None:
            game.image_url = game_data.image_url
        if game_data.stock is not None:
            game.stock = game_data.stock
        
        db.session.commit()
        return jsonify({
            'message': 'Game updated successfully',
            'game': GameDetail(**game.to_dict()).dict()
        })
        
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/games/<int:game_id>', methods=['DELETE'])
@jwt_required()
def delete_game(game_id):
    """Delete a specific game (admin only)"""
    try:
        # Check if user is admin
        claims = get_jwt_identity()
        user = User.query.get(claims)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
            
        game = db.session.get(Game, game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
            
        db.session.delete(game)
        db.session.commit()
        return jsonify({'message': 'Game deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 