import { createContext, useContextSelector } from "use-context-selector";
import { useReducer, useEffect, ReactNode, useCallback, Reducer } from "react";
import { produce } from "immer";
import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem,
  removeFromCart as removeFromCartApi,
} from "@/services/cartService";
import { useAuth } from "@/contexts/AuthContext";

// --- Type Definitions ---

// Define the structure of a single item in the cart
// Export the interface
export interface CartItem {
  id: string | number;
  gameId: string | number; // Or specific game object type
  quantity: number;
  price: number; // Price per item
  // Add other item details like name, image, etc.
  [key: string]: any; // Allow other properties for now
}

// Define the structure of the Cart object
// Export the interface
export interface Cart {
  id: string | number;
  items: CartItem[];
  total_price: number;
  // Add other cart properties like userId, createdAt, etc.
  [key: string]: any; // Allow other properties for now
}

// Define the shape of the cart state
interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  totalItems: number; // Derived state
}

// Define the possible actions for the cart reducer
type CartAction =
  | { type: "CART_FETCH_START" }
  | { type: "CART_FETCH_SUCCESS"; payload: Cart | null }
  | { type: "CART_FETCH_FAILURE"; payload: string }
  | { type: "CART_UPDATE_START" } // Used for add, remove, update
  | { type: "CART_UPDATE_SUCCESS"; payload: Cart }
  | { type: "CART_UPDATE_FAILURE"; payload: string }
  | { type: "CART_CLEAR" } // Action to clear cart on logout
  | { type: "CLEAR_ERROR" };

// Initial state for the cart
const initialState: CartState = {
  cart: null,
  loading: false, // Start as false, loading triggered by auth change or fetch
  error: null,
  totalItems: 0,
};

// Helper function to calculate total items
const calculateTotalItems = (cart: Cart | null): number => {
  return cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
};

// Reducer function for cart state using Immer
const cartReducer: Reducer<CartState, CartAction> = produce(
  (draft: CartState, action: CartAction) => {
    switch (action.type) {
      case "CART_FETCH_START":
      case "CART_UPDATE_START":
        draft.loading = true;
        draft.error = null;
        break;
      case "CART_FETCH_SUCCESS":
      case "CART_UPDATE_SUCCESS":
        draft.cart = action.payload;
        draft.totalItems = calculateTotalItems(action.payload);
        draft.loading = false;
        draft.error = null;
        break;
      case "CART_FETCH_FAILURE":
      case "CART_UPDATE_FAILURE":
        draft.loading = false;
        draft.error = action.payload;
        break;
      case "CART_CLEAR":
        draft.cart = null;
        draft.totalItems = 0;
        draft.loading = false;
        draft.error = null;
        break;
      case "CLEAR_ERROR":
        draft.error = null;
        break;
      default:
        break;
    }
  }
);

// --- Context Setup ---

// Define the context value shape
interface CartContextValue extends CartState {
  addToCart: (gameId: string, quantity?: number) => Promise<Cart | undefined>;
  removeFromCart: (gameId: string) => Promise<Cart | undefined>;
  updateQuantity: (
    gameId: string,
    quantity: number
  ) => Promise<Cart | undefined>;
  refreshCart: () => Promise<void>;
  clearCartError: () => void;
}

// Create the context using use-context-selector
const CartContext = createContext<CartContextValue>({
  ...initialState,
  addToCart: async () => Promise.reject(new Error("CartProvider not found")),
  removeFromCart: async () =>
    Promise.reject(new Error("CartProvider not found")),
  updateQuantity: async () =>
    Promise.reject(new Error("CartProvider not found")),
  refreshCart: async () => {
    throw new Error("CartProvider not found");
  },
  clearCartError: () => {
    throw new Error("CartProvider not found");
  },
});

// --- Provider Component ---

interface CartProviderProps {
  children: ReactNode;
}

/**
 * Provides cart state and actions to the application.
 * Manages fetching, adding, removing, and updating cart items.
 * @param {CartProviderProps} props The component props.
 * @returns {JSX.Element} The provider component.
 */
export const CartProvider = ({ children }: CartProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer<Reducer<CartState, CartAction>>(
    cartReducer,
    initialState
  );
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  // Fetch cart logic
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    dispatch({ type: "CART_FETCH_START" });
    try {
      // FIXME: Use the actual type returned by getCart if known, otherwise Cart | null is a guess
      const data: Cart | null = await getCart();
      dispatch({ type: "CART_FETCH_SUCCESS", payload: data });
    } catch (err: any) {
      const message = err.message || "Failed to fetch cart";
      console.error("Fetch cart error:", err);
      dispatch({ type: "CART_FETCH_FAILURE", payload: message });
    }
  }, [isAuthenticated]);

  // Effect to fetch cart when auth status changes or on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Clear cart when user logs out
      dispatch({ type: "CART_CLEAR" });
    }
  }, [isAuthenticated, fetchCart]);

  // --- Cart Action Functions ---

  const addToCart = useCallback(
    async (gameId: string, quantity: number = 1): Promise<Cart | undefined> => {
      dispatch({ type: "CART_UPDATE_START" });
      try {
        // FIXME: Use the actual type returned by addToCartApi
        const updatedCart: Cart = await addToCartApi(gameId, quantity);
        dispatch({ type: "CART_UPDATE_SUCCESS", payload: updatedCart });
        return updatedCart;
      } catch (err: any) {
        const message = err.message || "Failed to add item to cart";
        console.error("Add to cart error:", err);
        dispatch({ type: "CART_UPDATE_FAILURE", payload: message });
        // Don't re-throw here, let components check the error state if needed
      }
    },
    []
  );

  const removeFromCart = useCallback(
    async (gameId: string): Promise<Cart | undefined> => {
      dispatch({ type: "CART_UPDATE_START" });
      try {
        // FIXME: Use the actual type returned by removeFromCartApi
        const updatedCart: Cart = await removeFromCartApi(gameId);
        dispatch({ type: "CART_UPDATE_SUCCESS", payload: updatedCart });
        return updatedCart;
      } catch (err: any) {
        const message = err.message || "Failed to remove item from cart";
        console.error("Remove from cart error:", err);
        dispatch({ type: "CART_UPDATE_FAILURE", payload: message });
      }
    },
    []
  );

  const updateQuantity = useCallback(
    async (gameId: string, quantity: number): Promise<Cart | undefined> => {
      if (quantity <= 0) {
        return removeFromCart(gameId); // Delegate to remove if quantity is zero or less
      }
      dispatch({ type: "CART_UPDATE_START" });
      try {
        // FIXME: Use the actual type returned by updateCartItem
        const updatedCart: Cart = await updateCartItem(gameId, quantity);
        dispatch({ type: "CART_UPDATE_SUCCESS", payload: updatedCart });
        return updatedCart;
      } catch (err: any) {
        const message = err.message || "Failed to update quantity";
        console.error("Update quantity error:", err);
        dispatch({ type: "CART_UPDATE_FAILURE", payload: message });
      }
    },
    [removeFromCart]
  ); // Add removeFromCart as dependency

  const clearCartError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // Assemble context value
  const value: CartContextValue = {
    ...state,
    // Provide actions
    addToCart,
    removeFromCart,
    updateQuantity,
    refreshCart: fetchCart, // Expose fetchCart as refreshCart
    clearCartError,
    // Note: totalPrice is now directly available in state.cart.total_price
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// --- Hook and Selectors ---

/**
 * Hook to access the Cart context.
 * Uses useContextSelector for performance optimization.
 * @template T The type of the selected state slice.
 * @param {(state: CartContextValue) => T} selector Function to select a slice of the context state.
 * @returns {T} The selected state slice.
 * @example
 * const cartItems = useCart(state => state.cart?.items ?? []);
 * const { addToCart } = useCart(state => ({ addToCart: state.addToCart }));
 */
export const useCart = <T,>(selector: (state: CartContextValue) => T): T => {
  return useContextSelector(CartContext, selector);
};
