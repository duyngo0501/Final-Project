import React, { useState, useEffect } from 'react';
import { getCart, updateCartItem, removeFromCart } from '../services/cartService';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (gameId, newQuantity) => {
    try {
      if (newQuantity < 1) return;
      const updatedCart = await updateCartItem(gameId, newQuantity);
      setCart(updatedCart);
    } catch (err) {
      setError(err.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (gameId) => {
    try {
      const updatedCart = await removeFromCart(gameId);
      setCart(updatedCart);
    } catch (err) {
      setError(err.message || 'Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button
          onClick={() => navigate('/games')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Browse Games
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
          >
            <div className="flex items-center space-x-4">
              {item.game.image_url && (
                <img
                  src={item.game.image_url}
                  alt={item.game.title}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold">{item.game.title}</h3>
                <p className="text-gray-600">${item.game.price}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(item.game_id, item.quantity - 1)}
                  className="bg-gray-200 px-2 py-1 rounded"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.game_id, item.quantity + 1)}
                  className="bg-gray-200 px-2 py-1 rounded"
                >
                  +
                </button>
              </div>
              
              <button
                onClick={() => handleRemoveItem(item.game_id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Total</h2>
          <span className="text-2xl font-bold">${cart.total_price.toFixed(2)}</span>
        </div>
        
        <button
          onClick={() => navigate('/checkout')}
          className="w-full mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart; 