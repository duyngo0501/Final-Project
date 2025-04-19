import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gamesAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const GameDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await gamesAPI.getGameById(id);
        setGame(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching game:', err);
        setError('Failed to load game details. Please try again later.');
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(game.id, quantity);
      navigate('/cart');
    } catch (err) {
      setError(err.message || 'Failed to add game to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(game.stock, value));
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center p-4">
        <h2 className="text-2xl font-bold mb-4">Game Not Found</h2>
        <p className="mb-4">The game you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/games')} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Games
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img 
              src={game.image_url || 'https://via.placeholder.com/600x400?text=Game+Image'} 
              alt={game.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 md:w-1/2">
            <h1 className="text-3xl font-bold mb-4">{game.title}</h1>
            <p className="text-gray-600 mb-6">{game.description}</p>
            
            <div className="mb-6">
              <span className="text-2xl font-bold text-blue-600">
                ${game.price.toFixed(2)}
              </span>
              {game.stock > 0 ? (
                <span className="ml-2 text-green-500">In Stock ({game.stock} available)</span>
              ) : (
                <span className="ml-2 text-red-500">Out of Stock</span>
              )}
            </div>

            {game.stock > 0 && (
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="bg-gray-200 px-3 py-1 rounded"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={game.stock}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-20 text-center border rounded py-1"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="bg-gray-200 px-3 py-1 rounded"
                    disabled={quantity >= game.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            
            <button
              onClick={handleAddToCart}
              disabled={game.stock <= 0 || addingToCart}
              className={`w-full py-3 px-4 rounded-lg font-semibold ${
                game.stock > 0 && !addingToCart
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {addingToCart ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding to Cart...
                </span>
              ) : game.stock > 0 ? (
                'Add to Cart'
              ) : (
                'Out of Stock'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailPage; 