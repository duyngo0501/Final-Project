from flask import Flask, request, jsonify
from models import (
    db, Game, User, GameCreate, GameResponse, GameDetail,
    UserCreate, UserLogin, GameUpdate, token_required, admin_required
)
from flask_migrate import Migrate
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///games.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)

# Authentication endpoints
@app.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
            
        # Create new user
        user = User(email=data['email'], role=data.get('role', 'user'))
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user_id': user.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
            
        token = user.generate_token()
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/me', methods=['GET'])
@token_required
def get_user_info(current_user):
    return jsonify({
        'id': current_user.id,
        'email': current_user.email,
        'role': current_user.role
    })

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
@admin_required
def create_game(current_user):
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400
        if 'price' not in data:
            return jsonify({'error': 'Price is required'}), 400
        if 'stock' not in data:
            return jsonify({'error': 'Stock is required'}), 400
            
        # Validate price is positive
        try:
            price = float(data['price'])
            if price <= 0:
                return jsonify({'error': 'Price must be a positive number'}), 400
        except ValueError:
            return jsonify({'error': 'Price must be a valid number'}), 400
            
        # Validate stock is non-negative integer
        try:
            stock = int(data['stock'])
            if stock < 0:
                return jsonify({'error': 'Stock must be a non-negative integer'}), 400
        except ValueError:
            return jsonify({'error': 'Stock must be a valid integer'}), 400
            
        # Create new game
        new_game = Game(
            title=data['title'],
            description=data.get('description'),
            price=price,
            image_url=data.get('image_url'),
            stock=stock,
            created_by=current_user.id
        )
        
        db.session.add(new_game)
        db.session.commit()
        
        return jsonify({
            'message': 'Game created successfully',
            'game_id': new_game.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/games/<int:game_id>', methods=['PUT'])
@admin_required
def update_game(current_user, game_id):
    """Update a specific game"""
    try:
        game = db.session.get(Game, game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        data = request.get_json()
        
        # Validate price if provided
        if 'price' in data:
            try:
                price = float(data['price'])
                if price <= 0:
                    return jsonify({'error': 'Price must be a positive number'}), 400
                game.price = price
            except ValueError:
                return jsonify({'error': 'Price must be a valid number'}), 400
        
        # Validate stock if provided
        if 'stock' in data:
            try:
                stock = int(data['stock'])
                if stock < 0:
                    return jsonify({'error': 'Stock must be a non-negative integer'}), 400
                game.stock = stock
            except ValueError:
                return jsonify({'error': 'Stock must be a valid integer'}), 400
        
        # Update other fields
        if 'title' in data:
            game.title = data['title']
        if 'description' in data:
            game.description = data['description']
        if 'image_url' in data:
            game.image_url = data['image_url']
        
        db.session.commit()
        return jsonify({'message': 'Game updated successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/games/<int:game_id>', methods=['DELETE'])
@admin_required
def delete_game(current_user, game_id):
    """Delete a specific game"""
    try:
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