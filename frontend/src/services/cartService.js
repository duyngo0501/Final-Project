import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get user's cart
export const getCart = async () => {
  try {
    const response = await axios.get(`${API_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add game to cart
export const addToCart = async (gameId, quantity) => {
  try {
    const response = await axios.post(
      `${API_URL}/cart/add`,
      { game_id: gameId, quantity },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update game quantity in cart
export const updateCartItem = async (gameId, quantity) => {
  try {
    const response = await axios.put(
      `${API_URL}/cart/update`,
      { game_id: gameId, quantity },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Remove game from cart
export const removeFromCart = async (gameId) => {
  try {
    const response = await axios.delete(`${API_URL}/cart/remove/${gameId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 