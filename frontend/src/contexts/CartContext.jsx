import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage if available
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add a game to the cart
  const addToCart = (game) => {
    setCart((prevCart) => {
      // Check if game already exists in cart
      const existingItem = prevCart.find((item) => item.id === game.id);
      
      if (existingItem) {
        // If game exists, increment quantity
        return prevCart.map((item) =>
          item.id === game.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If game doesn't exist, add it with quantity 1
        return [...prevCart, { ...game, quantity: 1 }];
      }
    });
  };

  // Remove a game from the cart
  const removeFromCart = (gameId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== gameId));
  };

  // Update quantity of a game in the cart
  const updateQuantity = (gameId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(gameId);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === gameId ? { ...item, quantity } : item
      )
    );
  };

  // Clear the cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate total items in cart
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Calculate total price of cart
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext; 