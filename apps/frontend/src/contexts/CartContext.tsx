import React, { createContext, ReactNode, useCallback, useMemo } from "react";
import { produce } from "immer";
import { useContextSelector } from "use-context-selector";
// Temporarily import cartAPI separately to test export issue
// import { Cart, CartItem, cartAPI } from "@/services/api";
import cartAPI from "@/services/api";
// Import types separately - needed for interface definitions
import { Cart, CartItem } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import useSWR, { mutate } from "swr";
import { Game } from "@/types/game";

// Local state ONLY for mutations, data comes from SWR
interface CartState {
  isMutating: boolean;
  mutationError: string | null;
}

// Define the context value shapewa
interface CartContextValue extends CartState {
  cart: Cart | null | undefined; // Cart data from SWR
  isLoading: boolean; // Combined Loading/Validating state from SWR
  error: any; // Error state from SWR
  totalItems: number; // Derived from SWR cart data
  // Actions
  addItem: (game: Game, quantity?: number) => Promise<void>;
  removeItem: (gameId: number) => Promise<void>;
  updateQuantity: (gameId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

// Local state initial value
const initialState: CartState = {
  isMutating: false,
  mutationError: null,
};

// Create Context with undefined default, provider will supply value
const CartContext = createContext<CartContextValue | undefined>(undefined);

// Create Provider Component
interface CartProviderProps {
  children: ReactNode;
}

const CART_SWR_KEY = "/api/cart";

/**
 * Provides cart state and actions, interacting with the (mock) cart API.
 * Uses SWR for data fetching and state management.
 * @param {CartProviderProps} props Component props.
 * @returns {JSX.Element} The provider component.
 */
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [mutationState, setMutationState] = React.useState(initialState);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  const {
    data: cartData,
    error,
    isLoading,
    isValidating,
  } = useSWR<Cart | null>(
    isAuthenticated ? CART_SWR_KEY : null,
    async (key) => {
      const res = await cartAPI.getCart();
      return res.data;
    },
    {
      revalidateOnFocus: true,
      shouldRetryOnError: true,
    }
  );

  const combinedLoading = isLoading || isValidating;

  const totalItems = useMemo(() => {
    return (
      cartData?.items?.reduce(
        (sum, item: CartItem) => sum + item.quantity,
        0
      ) || 0
    );
  }, [cartData]);

  // --- Mutation Functions --- (Optimistic UI updates)

  const addItem = useCallback(
    async (game: Game, quantity: number = 1) => {
      if (!isAuthenticated) return;

      setMutationState({ isMutating: true, mutationError: null });

      const optimisticUpdate = (
        currentCart: Cart | null | undefined
      ): Cart | null => {
        if (!currentCart) {
          // If cart doesn't exist yet, create a new one optimistically
          return {
            id: "temp-cart",
            userId: "temp-user",
            items: [{ game, quantity }],
          };
        }
        // Use Immer produce on the existing cart data
        return produce(currentCart, (draft: Cart) => {
          const existingItemIndex = draft.items.findIndex(
            (item) => item.game.id === game.id
          );
          if (existingItemIndex > -1) {
            draft.items[existingItemIndex].quantity += quantity;
          } else {
            draft.items.push({ game, quantity });
          }
          // Optimistically update total price if needed (example)
          // draft.totalPrice = draft.items.reduce(...);
        });
      };

      try {
        await mutate(CART_SWR_KEY, optimisticUpdate(cartData), {
          optimisticData: optimisticUpdate(cartData),
          revalidate: false,
        });
        const response = await cartAPI.addItem(game.id, quantity);
        // No need to manually mutate after API call if SWR key remains the same
        // SWR will revalidate automatically or you can trigger manually if needed
        // await mutate(CART_SWR_KEY); // Or use response.data if needed
        setMutationState({ isMutating: false, mutationError: null });
      } catch (err: any) {
        console.error("Add item error:", err);
        const message = err.response?.data?.error || "Failed to add item";
        setMutationState({ isMutating: false, mutationError: message });
        // Revert optimistic update by revalidating
        await mutate(CART_SWR_KEY); // Re-fetch from API to revert
      }
    },
    [isAuthenticated, cartData]
  );

  const removeItem = useCallback(
    async (gameId: number) => {
      if (!isAuthenticated || !cartData) return; // Need cart data to remove from

      setMutationState({ isMutating: true, mutationError: null });

      const optimisticUpdate = produce(cartData, (draft: Cart | null) => {
        if (!draft) return null; // If no cart, nothing to remove
        const itemIndexToRemove = draft.items.findIndex(
          (item) => item.game.id === gameId
        );
        if (itemIndexToRemove > -1) {
          draft.items.splice(itemIndexToRemove, 1);
        }
      });

      try {
        await mutate(CART_SWR_KEY, optimisticUpdate, {
          optimisticData: optimisticUpdate,
          revalidate: false,
        });
        const response = await cartAPI.removeItem(gameId);
        // await mutate(CART_SWR_KEY); // Trigger revalidation if needed
        setMutationState({ isMutating: false, mutationError: null });
      } catch (err: any) {
        console.error("Remove item error:", err);
        const message = err.response?.data?.error || "Failed to remove item";
        setMutationState({ isMutating: false, mutationError: message });
        await mutate(CART_SWR_KEY);
      }
    },
    [isAuthenticated, cartData]
  );

  const updateQuantity = useCallback(
    async (gameId: number, quantity: number) => {
      if (!isAuthenticated || !cartData) return;
      if (quantity <= 0) {
        await removeItem(gameId);
        return;
      }

      setMutationState({ isMutating: true, mutationError: null });

      const optimisticUpdate = produce(cartData, (draft: Cart | null) => {
        if (!draft) return null;
        const itemIndexToUpdate = draft.items.findIndex(
          (item) => item.game.id === gameId
        );
        if (itemIndexToUpdate > -1) {
          draft.items[itemIndexToUpdate].quantity = quantity;
        }
      });

      try {
        await mutate(CART_SWR_KEY, optimisticUpdate, {
          optimisticData: optimisticUpdate,
          revalidate: false,
        });
        const response = await cartAPI.updateItemQuantity(gameId, quantity);
        // await mutate(CART_SWR_KEY);
        setMutationState({ isMutating: false, mutationError: null });
      } catch (err: any) {
        console.error("Update quantity error:", err);
        const message =
          err.response?.data?.error || "Failed to update quantity";
        setMutationState({ isMutating: false, mutationError: message });
        await mutate(CART_SWR_KEY);
      }
    },
    [isAuthenticated, cartData, removeItem]
  );

  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !cartData) return;

    setMutationState({ isMutating: true, mutationError: null });

    const optimisticUpdate = produce(cartData, (draft: Cart | null) => {
      if (!draft) return null;
      draft.items = [];
      draft.totalPrice = 0; // Reset total price optimistically if used
    });

    try {
      await mutate(CART_SWR_KEY, optimisticUpdate, {
        optimisticData: optimisticUpdate,
        revalidate: false,
      });
      const response = await cartAPI.clearCart();
      // await mutate(CART_SWR_KEY);
      setMutationState({ isMutating: false, mutationError: null });
    } catch (err: any) {
      console.error("Clear cart error:", err);
      const message = err.response?.data?.error || "Failed to clear cart";
      setMutationState({ isMutating: false, mutationError: message });
      await mutate(CART_SWR_KEY);
    }
  }, [isAuthenticated, cartData]);

  // Assemble the context value - THIS MUST MATCH CartContextValue
  const value: CartContextValue = useMemo(
    () => ({
      cart: cartData,
      isLoading: combinedLoading,
      error,
      totalItems,
      ...mutationState,
      // Actions
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [
      cartData,
      combinedLoading,
      error,
      totalItems,
      mutationState,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    ]
  );

  // Provide the calculated value
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Hook to access the Cart context.
 * Throws error if used outside of CartProvider.
 * Uses useContextSelector for performance optimization.
 * @template T The type of the selected state slice.
 * @param {(state: CartContextValue) => T} selector Function to select a slice of the context state.
 * @returns {T} The selected state slice.
 */
export const useCart = <T,>(selector: (state: CartContextValue) => T): T => {
  // Context type here should be CartContextValue | undefined
  const context = useContextSelector(CartContext, (context) => {
    // Check if context is undefined (meaning not within provider)
    if (context === undefined) {
      throw new Error("useCart must be used within a CartProvider");
    }
    // If context exists, apply the selector
    return selector(context);
  });
  // The selector is applied inside, so the result T is returned
  return context;
};

/**
 * Hook to get only the total number of items in the cart.
 */
export const useCartTotalItems = (): number => {
  // Select totalItems from the CartContextValue
  return useCart((state) => state.totalItems);
};

/**
 * Hook to get only the array of items in the cart.
 */
export const useCartItems = (): CartItem[] => {
  // Select items from the cart property within CartContextValue
  return useCart((state) => state.cart?.items || []);
};

/**
 * Hook to get the cart loading state from SWR.
 */
export const useCartIsLoading = (): boolean => {
  return useCart((state) => state.isLoading);
};

/**
 * Hook to get the cart mutation state.
 */
export const useCartMutationState = (): {
  isMutating: boolean;
  mutationError: string | null;
} => {
  return useCart((state) => ({
    isMutating: state.isMutating,
    mutationError: state.mutationError,
  }));
};
