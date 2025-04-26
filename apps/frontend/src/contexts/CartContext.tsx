import React, { createContext, ReactNode, useCallback, useMemo } from "react";
import { produce } from "immer";
// import { useContextSelector } from "use-context-selector"; // Keep if needed later
// Remove mock API import
// import cartAPI from "@/services/api";
// Import generated client functions for cart
// Linter confirms NO 'use' prefix
import {
  cartControllerGetCart,
  cartControllerAddItem,
  cartControllerUpdateItemQuantity,
  cartControllerRemoveItem,
  cartControllerClearCart,
} from "@/gen/client";
// Import types from generated client
import {
  CartResponseSchema as Cart,
  CartItemResponseSchema as CartItem,
  CartItemCreateSchema, // Import schema for add item payload
  CartItemUpdateSchema, // Import schema for update item payload
} from "@/gen/types";
import { useAuth } from "@/contexts/AuthContext";
import useSWR, { mutate, SWRConfiguration } from "swr";
// No need for useSWRMutation if we revert to manual mutate
// import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation';
import { Game } from "@/types/game";

// Local state ONLY for mutations, data comes from SWR
interface CartState {
  isMutating: boolean;
  mutationError: string | null;
}

// Define the context value shape
interface CartContextValue extends CartState {
  cart: Cart | null | undefined; // Cart data from SWR
  isLoading: boolean; // Combined Loading/Validating state from SWR
  error: any; // Error state from SWR
  totalItems: number; // Derived total count
  // Actions
  addItem: (game: Game, quantity?: number) => Promise<void>; // Reverted to Game type
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
export const CartContext = createContext<CartContextValue | undefined>(
  undefined
);

// Create Provider Component
interface CartProviderProps {
  children: ReactNode;
}

const CART_SWR_KEY = "/api/cart";

/**
 * Provides cart state and actions, interacting with the actual cart API via Kubb client.
 * Uses SWR for data fetching and state management.
 * @param {CartProviderProps} props Component props.
 * @returns {JSX.Element} The provider component.
 */
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [mutationState, setMutationState] = React.useState(initialState);
  // Revert to selector pattern if direct access causes issues
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  // --- SWR Hooks for API interactions ---
  const {
    data: cartData,
    error,
    isLoading: isSWRLoading,
    isValidating,
    mutate: swrMutateCart,
  } = useSWR<Cart | null>(
    isAuthenticated ? CART_SWR_KEY : null,
    // Fetcher function that calls the generated client function
    // Assumes cartControllerGetCart returns Promise<{ data: Cart }>
    // UPDATE: Confirmed return type is Promise<CartResponseSchema> (aliased as Cart)
    // UPDATE 2: Linter confirms return is Promise<ResponseConfig<CartResponseSchema>>, so .data access IS needed.
    async () => {
      try {
        const response = await cartControllerGetCart();
        // Access the .data property from ResponseConfig
        return response.data as Cart;
      } catch (err) {
        // Handle potential errors during fetch (e.g., 404 if cart doesn't exist)
        // SWR can handle errors, but we might want specific logic here
        console.error("SWR Fetcher Error:", err);
        // Return null or throw, depending on desired SWR error handling
        return null; // Treat fetch error as empty/null cart for simplicity
      }
    },
    {
      revalidateOnFocus: true,
      shouldRetryOnError: true,
    } as SWRConfiguration<Cart | null> // Type assertion if needed
  );

  const combinedLoading = isSWRLoading || isValidating;

  const totalItems = useMemo(() => {
    return cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  }, [cartData]);

  // --- Context Action Implementations (Reverting to manual mutate) ---

  const addItem = useCallback(
    async (game: Game, quantity: number = 1) => {
      if (!isAuthenticated) return;

      // Basic optimistic update (can be enhanced)
      const optimisticCart = produce(
        cartData ?? { items: [] },
        (draft: any) => {
          // Adjust this logic based on the actual CartItemResponseSchema structure
          if (!draft?.items) draft.items = []; // Ensure items array exists
          // Compare IDs as strings to handle potential type mismatch (number vs string/uuid)
          const existingItemIndex = draft.items.findIndex(
            (item: CartItem) => String(item.game_id) === String(game.id)
          ); // Use game_id, compare as string
          if (existingItemIndex > -1) {
            draft.items[existingItemIndex].quantity += quantity;
          } else {
            // Construct a basic item optimistically. Might need more fields.
            // This assumes CartItemResponseSchema has at least these fields.
            const newItem = {
              game_id: game.id, // Assume game_id is the key
              quantity: quantity,
              // Add other known/required fields from CartItemResponseSchema if possible
              // Potentially add minimal game info if needed for display before revalidation
              // game: { id: game.id, name: game.name, thumbnail: game.thumbnail } // Example, if schema expects nested game
            };
            draft.items.push(newItem);
          }
        }
      );

      // Type assertion to ensure compatibility with SWR mutation
      swrMutateCart(optimisticCart as Cart, false); // Optimistic update without revalidation

      setMutationState({ isMutating: true, mutationError: null });
      try {
        // Call the generated client function directly
        // Assuming it expects an object matching CartItemCreateSchema
        const payload: CartItemCreateSchema = {
          game_id: String(game.id),
          quantity,
        };
        const response = await cartControllerAddItem(payload);

        // Manually update SWR cache with response data after success
        // Assuming response structure is { data: Cart }
        // This depends heavily on the actual return type of useCartControllerAddItem
        // For now, we'll just revalidate
        await swrMutateCart();
        setMutationState({ isMutating: false, mutationError: null });
      } catch (err) {
        // onError handles state update and reverts optimistic change
        // We might still want to log it here or perform additional actions
        console.error("Caught error during addItem trigger:", err);
        const message = (err as Error).message || "Failed to add item";
        setMutationState({ isMutating: false, mutationError: message });
        await swrMutateCart(); // Revalidate to revert optimistic update
      }
    },
    [isAuthenticated, cartData, swrMutateCart]
  );

  const removeItem = useCallback(
    async (gameId: number) => {
      if (!isAuthenticated || !cartData) return;

      // Optimistic update
      const optimisticCart = produce(cartData, (draft: Cart | null) => {
        if (!draft?.items) return; // Check items array exists
        // Compare IDs as strings
        draft.items = draft.items.filter(
          (item) => String(item.game_id) !== String(gameId)
        );
      });
      swrMutateCart(optimisticCart as Cart, false); // Optimistic update

      setMutationState({ isMutating: true, mutationError: null });
      try {
        // Call generated function, assuming it takes gameId directly or in an options object
        // Need to confirm exact signature of useCartControllerRemoveItem
        await cartControllerRemoveItem(String(gameId));

        // Revalidate SWR cache on success
        await swrMutateCart();
        setMutationState({ isMutating: false, mutationError: null });
      } catch (err) {
        // onError handles state update and revert
        console.error("Caught error during removeItem trigger:", err);
        const message = (err as Error).message || "Failed to remove item";
        setMutationState({ isMutating: false, mutationError: message });
        await swrMutateCart(); // Revalidate to revert
      }
    },
    [isAuthenticated, cartData, swrMutateCart]
  );

  const updateQuantity = useCallback(
    async (gameId: number, quantity: number) => {
      if (!isAuthenticated || !cartData) return;
      if (quantity <= 0) {
        await removeItem(gameId); // Use existing remove logic for quantity <= 0
        return;
      }

      // Optimistic update
      const optimisticCart = produce(cartData, (draft: Cart | null) => {
        if (!draft?.items) return; // Check items array exists
        // Compare IDs as strings
        const itemIndex = draft.items.findIndex(
          (item) => String(item.game_id) === String(gameId)
        );
        if (itemIndex > -1) {
          draft.items[itemIndex].quantity = quantity;
        }
      });
      swrMutateCart(optimisticCart as Cart, false); // Optimistic update

      setMutationState({ isMutating: true, mutationError: null });
      try {
        // Call generated function, assuming it needs gameId and payload
        // Need to confirm exact signature of useCartControllerUpdateItemQuantity
        const payload: CartItemUpdateSchema = { quantity };
        await cartControllerUpdateItemQuantity(String(gameId), payload);

        // Revalidate SWR cache on success
        await swrMutateCart();
        setMutationState({ isMutating: false, mutationError: null });
      } catch (err) {
        // onError handles state update and revert
        console.error("Caught error during updateQuantity trigger:", err);
        const message = (err as Error).message || "Failed to update quantity";
        setMutationState({ isMutating: false, mutationError: message });
        await swrMutateCart(); // Revalidate to revert
      }
    },
    [isAuthenticated, cartData, removeItem, swrMutateCart]
  );

  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !cartData) return;

    // Optimistic update
    const optimisticCart = produce(cartData, (draft: Cart | null) => {
      if (!draft) return null;
      draft.items = [];
      // Reset total price if it's part of the cart state
      // draft.totalPrice = 0;
    });
    swrMutateCart(optimisticCart as Cart, false); // Optimistic update

    setMutationState({ isMutating: true, mutationError: null });
    try {
      // Call generated function
      // Need to confirm signature of useCartControllerClearCart
      await cartControllerClearCart();

      // Revalidate SWR cache on success
      await swrMutateCart();
      setMutationState({ isMutating: false, mutationError: null });
    } catch (err) {
      // onError handles state update and revert
      console.error("Caught error during clearCart trigger:", err);
      const message = (err as Error).message || "Failed to clear cart";
      setMutationState({ isMutating: false, mutationError: message });
      await swrMutateCart(); // Revalidate to revert
    }
  }, [isAuthenticated, cartData, swrMutateCart]);

  // --- Combine Mutating States --- Resetting this as we removed specific mutation hooks
  const combinedMutating = mutationState.isMutating; // Only rely on local mutation state now

  // Assemble the context value - THIS MUST MATCH CartContextValue
  const value: CartContextValue = useMemo(
    () => ({
      cart: cartData,
      isLoading: combinedLoading,
      error,
      totalItems,
      isMutating: combinedMutating, // Use combined state
      mutationError: mutationState.mutationError, // Keep separate mutation error
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
      combinedMutating, // Dependency on combined state
      mutationState.mutationError,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    ]
  );

  // Provide the calculated value
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook for consuming the context
/**
 * @description Hook to access the Cart context.
 * Provides cart data, loading/error states, and cart manipulation actions.
 * Throws an error if used outside of CartProvider.
 * @returns {CartContextValue} The cart context value.
 */
export const useCart = (): CartContextValue => {
  // Using direct useContext:
  const context = React.useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
