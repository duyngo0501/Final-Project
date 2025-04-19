# Game Store Project

A full-stack web application for a game store, built with React frontend and Flask backend.

## Prerequisites

- Python 3.8 or higher
- Node.js 14.0 or higher
- npm (Node Package Manager)
- PostgreSQL database

## Project Structure

```
Final-Project/
├── app.py              # Flask backend server
├── models.py           # Database models
├── init_db.py          # Database initialization script
├── frontend/           # React frontend application
│   ├── src/           # Source files
│   ├── public/        # Public assets
│   └── package.json   # Frontend dependencies
├── requirements.txt    # Python dependencies
├── .env.example       # Environment variables template
└── tests/             # Test files
```

## Setup Instructions

### Backend Setup

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up the database:
- Create a PostgreSQL database:
```bash
psql -U postgres
CREATE DATABASE game_store;
\q
```
- Copy the `.env.example` file to `.env` and update the database connection settings:
```bash
cp .env.example .env
# Edit .env file with your database credentials
```

4. Initialize the database:
```bash
python init_db.py
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install npm dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory with the following content:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

### Start the Backend Server

1. Make sure you're in the project root directory
2. Activate the virtual environment if not already activated:
```bash
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

3. Start the Flask server:
```bash
python app.py
```

The backend server will run on `http://localhost:5000`

### Start the Frontend Server

1. Open a new terminal
2. Navigate to the frontend directory:
```bash
cd frontend
```

3. Start the development server:
```bash
npm start
```

The frontend application will run on `http://localhost:3000`

## Database Schema

The application uses PostgreSQL with the following models:

- **User**: Stores user information with UUID primary keys
- **Game**: Stores game information with UUID primary keys
- **Cart**: Represents a user's shopping cart
- **CartItem**: Items in a user's cart
- **Order**: Represents a user's order
- **OrderItem**: Items in a user's order

All models use UUIDs as primary keys and include timestamp fields for tracking creation and updates.

## Environment Variables

### Backend (.env file in root directory)
```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://username:password@localhost:5432/game_store
JWT_SECRET_KEY=your_jwt_secret_key
```

### Frontend (.env file in frontend directory)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user

### Games
- GET `/api/games` - Get all games
- GET `/api/games/<id>` - Get game by ID
- POST `/api/games` - Add new game (admin only)
- PUT `/api/games/<id>` - Update game (admin only)
- DELETE `/api/games/<id>` - Delete game (admin only)

### Cart
- GET `/api/cart` - Get user's cart
- POST `/api/cart/add` - Add item to cart
- PUT `/api/cart/update` - Update cart item
- DELETE `/api/cart/remove` - Remove item from cart

### Orders
- GET `/api/orders` - Get user's orders
- POST `/api/orders` - Create a new order
- GET `/api/orders/<id>` - Get order details

## Testing

To run the tests:
```bash
python -m pytest tests/
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Make sure PostgreSQL is running
   - Check your database credentials in the `.env` file
   - Ensure the database exists

2. **Frontend API Connection Error**
   - Verify the backend server is running
   - Check the `REACT_APP_API_URL` in the frontend `.env` file

3. **CORS Issues**
   - The backend is configured to allow CORS from the frontend
   - If you're still having issues, check the CORS configuration in `app.py`

## Contributing

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:
```bash
git add .
git commit -m "Description of your changes"
```

3. Push your branch and create a pull request:
```bash
git push origin feature/your-feature-name
```

## License

This project is licensed under the MIT License. 