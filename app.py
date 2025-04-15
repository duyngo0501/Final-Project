from flask import Flask, request, jsonify
from models import db, Game, GameCreate, GameResponse, GameDetail
from flask_migrate import Migrate
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///games.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)

@app.route('/games', methods=['GET'])
def get_games():
    """Get all games"""
    games = Game.query.all()
    return jsonify([{
        'game_id': game.id,
        'title': game.title,
        'description': game.description,
        'price': game.price,
        'image_url': game.image_url,
        'stock': game.stock
    } for game in games])

@app.route('/games/<int:game_id>', methods=['GET'])
def get_game(game_id):
    """Get a specific game by ID"""
    game = db.session.get(Game, game_id)
    if not game:
        return jsonify({'error': 'Game not found'}), 404
    
    return jsonify({
        'game_id': game.id,
        'title': game.title,
        'description': game.description,
        'price': game.price,
        'image_url': game.image_url,
        'stock': game.stock
    })

@app.route('/games', methods=['POST'])
def create_game():
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
            stock=stock
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
def update_game(game_id):
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
def delete_game(game_id):
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