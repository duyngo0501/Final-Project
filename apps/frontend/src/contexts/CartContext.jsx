import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart as addToCartApi, updateCartItem, removeFromCart as removeFromCartApi } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

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

  // Add a game to the cart
  const addToCart = async (gameId, quantity = 1) => {
    try {
      const updatedCart = await addToCartApi(gameId, quantity);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setError(err.message || 'Failed to add item to cart');
      throw err;
    }
  };

  // Remove a game from the cart
  const removeFromCart = async (gameId) => {
    try {
      const updatedCart = await removeFromCartApi(gameId);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setError(err.message || 'Failed to remove item from cart');
      throw err;
    }
  };

  // Update quantity of a game in the cart
  const updateQuantity = async (gameId, quantity) => {
    try {
      if (quantity <= 0) {
        return removeFromCart(gameId);
      }
      const updatedCart = await updateCartItem(gameId, quantity);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setError(err.message || 'Failed to update quantity');
      throw err;
    }
  };

  // Calculate total items in cart
  const totalItems = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Calculate total price of cart
  const totalPrice = cart?.total_price || 0;

  const value = {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext; 