import React, { ReactNode, useCallback, useMemo } from "react";
import { produce } from "immer";
import {
  createContext,
  useContextSelector,
  useContext,
} from "use-context-selector";
// Import generated client functions for cart
// NOTE: Client generation failed earlier. These imports/signatures might be incorrect.
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
  CartItemCreateSchema,
  CartItemUpdateSchema,
  // GameSummarySchema, // Removed - Assume not available due to stale types
} from "@/gen/types";
import { useAuth } from "@/contexts/AuthContext";
import useSWR, { SWRConfiguration } from "swr";
// Removed manual mutate import as swrMutateCart from useSWR is used
import { Game } from "@/types/game"; // Keep using local Game type for addItem input

// --- State and Context Definition ---

// Interface for the core cart data structure from the API
// This matches the alias `Cart` for `CartResponseSchema`
// interface CartData extends Cart {}

// State managed internally by the provider (for mutations)
interface CartMutationState {
  isMutating: boolean;
  mutationError: Error | null; // Use Error type for errors
}

// Define the complete context value shape
interface CartContextValue extends CartMutationState {
  cart: Cart | null | undefined; // Cart data from SWR (CartResponseSchema)
  isLoading: boolean; // Combined Loading/Validating state from SWR
  error: Error | null; // Error state from SWR (use Error type)
  totalItems: number; // Derived total count
  totalPrice: number; // Derived total price
  // Actions - ensuring consistent return types and parameters
  // Using local Game type for addItem flexibility
  addItem: (game: Game, quantity?: number) => Promise<Cart | null>;
  removeItem: (gameId: string) => Promise<Cart | null>;
  updateQuantity: (gameId: string, quantity: number) => Promise<Cart | null>;
  clearCart: () => Promise<Cart | null>;
  fetchCart: () => Promise<void>; // Explicit fetch/revalidation trigger
}

// Initial state for mutation tracking
const initialMutationState: CartMutationState = {
  isMutating: false,
  mutationError: null,
};

// Create Context with undefined default
// Type assertion needed as default is undefined, but hook expects CartContextValue
export const CartContext = createContext<CartContextValue>(
  undefined as unknown as CartContextValue
);

// --- Provider Component ---

interface CartProviderProps {
  children: ReactNode;
}

const CART_SWR_KEY = "/api/cart";

/**
 * Provides cart state and actions, interacting with the cart API via Kubb client.
 * Uses SWR for data fetching and internal state for mutation status.
 * Follows use-context-selector pattern principles.
 * @param {CartProviderProps} props Component props.
 * @returns {JSX.Element} The provider component.
 */
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [mutationState, setMutationState] =
    React.useState<CartMutationState>(initialMutationState);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  // SWR hook for fetching cart data
  const {
    data: cartData, // This is CartResponseSchema | null | undefined
    error: swrError, // SWR error object
    isLoading: isSWRLoading, // Initial loading state
    isValidating, // Revalidation state
    mutate: swrMutateCart, // SWR mutation function
  } = useSWR<Cart | null>(
    // Only fetch if authenticated
    isAuthenticated ? CART_SWR_KEY : null,
    // --- SWR Fetcher Function ---
    async () => {
      // NOTE: Assuming cartControllerGetCart exists and returns the cart data directly or wrapped.
      // The actual return type is uncertain until client generation is fixed.
      try {
        console.log("SWR: Fetching cart...");
        // Remove ResponseConfig type annotation
        const response = await cartControllerGetCart();
        console.log("SWR: Cart fetched successfully", response);
        // Assuming the actual cart data is directly in response or response.data
        // Adjust access based on actual structure if possible, else return response directly
        return (response as any)?.data ?? response; // Safely access .data or return response
      } catch (err) {
        console.error("SWR Fetcher Error:", err);
        // Propagate error or return null based on desired handling
        // Returning null to represent an empty/non-existent cart on fetch error
        if (err instanceof Error && (err as any).status === 404) {
          console.log("SWR: Cart not found (404), returning null.");
          return null; // Treat 404 as cart not existing yet
        }
        // Re-throw other errors for SWR to handle
        throw err;
      }
    },
    // --- SWR Configuration ---
    {
      revalidateOnFocus: true,
      shouldRetryOnError: true,
      // Add error handling directly in SWR config
      onError: (err) => {
        console.error("SWR onError:", err);
        // Optionally update mutationError state here too, though swrError is available
        // setMutationState(prev => ({...prev, mutationError: err instanceof Error ? err : new Error('SWR fetch failed')}));
      },
    } as SWRConfiguration<Cart | null>
  );

  // Combine SWR loading states
  const isLoading = isSWRLoading || isValidating;
  // Expose SWR error as the primary error state, cast to Error type
  const error = swrError instanceof Error ? swrError : null;

  // Calculate total items based on fetched cart data
  const totalItems = useMemo(() => {
    return cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  }, [cartData]);

  // --- Calculate total price based on fetched cart data ---
  const totalPrice = useMemo(() => {
    return (
      cartData?.items?.reduce((sum, item) => {
        // Assuming item has a 'game' object with 'price'
        // Use optional chaining and provide a default of 0 if price is missing
        // @ts-expect-error - Stale type: CartItemResponseSchema doesn't have 'game' yet.
        const price = item.game?.price ?? 0;
        return sum + price * item.quantity;
      }, 0) ?? 0
    );
  }, [cartData]);

  // --- Context Action Implementations ---

  // Explicit function to trigger revalidation
  const fetchCart = useCallback(async () => {
    console.log("fetchCart called, triggering SWR mutation...");
    await swrMutateCart();
  }, [swrMutateCart]);

  // Add Item Action
  const addItem = useCallback(
    async (game: Game, quantity: number = 1): Promise<Cart | null> => {
      if (!isAuthenticated) {
        setMutationState({
          isMutating: false,
          mutationError: new Error("User not authenticated"),
        });
        return cartData ?? null;
      }

      // NOTE: Optimistic update structure remains similar,
      // but relies on the CartItem structure potentially having game_id
      const optimisticCart = produce(
        cartData ?? { id: "", user_id: "", items: [] },
        (draft) => {
          if (!draft?.items) draft.items = [];
          const existingItemIndex = draft.items.findIndex(
            (item: CartItem) => String(item.game_id) === String(game.id) // Ensure comparison is robust
          );
          if (existingItemIndex > -1) {
            draft.items[existingItemIndex].quantity += quantity;
          } else {
            // Create a temporary CartItem-like structure for optimistic update
            // This might differ from the actual CartItemResponseSchema
            const newItem: Partial<CartItem> & {
              game_id: string | number;
              quantity: number;
              // Add partial game details for optimistic display if possible
              // @ts-expect-error - Stale type: CartItemResponseSchema doesn't have 'game' yet.
              game?: Partial<GameSummarySchema>;
            } = {
              // id: uuidv4(), // Generate temporary client-side ID? Risky.
              // cart_id: draft.id, // Need cart ID if available
              game_id: game.id,
              quantity: quantity,
              // Add partial game details here - might need adjustment based on Game type
              // @ts-expect-error - Stale type: CartItemResponseSchema doesn't have 'game' yet.
              game: {
                id: game.id,
                title: game.title,
                price: game.price,
                thumbnailUrl: game.thumbnail, // Use thumbnail from Game type
              },
              // Cannot add full 'game' object unless CartItemResponseSchema includes it
            };
            draft.items.push(newItem as CartItem); // Assert type carefully
          }
        }
      );

      // Apply optimistic update BEFORE the API call
      swrMutateCart(optimisticCart as Cart, false);
      setMutationState({ isMutating: true, mutationError: null });

      try {
        // NOTE: Assuming cartControllerAddItem exists and expects CartItemCreateSchema.
        // This will likely fail until client generation is fixed.
        const payload: CartItemCreateSchema = {
          // Ensure game_id is sent as the expected type (string/uuid?).
          // Assuming game.id is now string and matches expected type
          game_id: game.id,
          quantity,
        };
        console.log("Adding item with payload:", payload);
        // Remove ResponseConfig type annotation
        const response = await cartControllerAddItem(payload);
        console.log("Item added successfully, response:", response);
        // On success, revalidate SWR to get the true state from the server
        // The response *might* contain the updated cart, allowing direct mutation:
        // swrMutateCart(response.data, false); // <-- Less network traffic if API returns full cart
        await swrMutateCart(); // Revalidate to be safe
        setMutationState({ isMutating: false, mutationError: null });
        return (response as any)?.data ?? response ?? null; // Return updated cart from response if available
      } catch (err) {
        console.error("addItem Error:", err);
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setMutationState({ isMutating: false, mutationError: errorObj });
        // Revert optimistic update on error by revalidating
        await swrMutateCart();
        throw errorObj; // Re-throw for component-level handling if needed
      }
    },
    [isAuthenticated, cartData, swrMutateCart]
  );

  // Remove Item Action
  const removeItem = useCallback(
    async (gameId: string): Promise<Cart | null> => {
      if (!isAuthenticated || !cartData) {
        setMutationState({
          isMutating: false,
          mutationError: new Error("User not authenticated or cart not loaded"),
        });
        return cartData ?? null;
      }

      // Optimistic update
      const optimisticCart = produce(cartData, (draft) => {
        if (!draft?.items) return;
        // @ts-expect-error - Stale type: CartItemResponseSchema doesn't have 'game' yet.
        const removedItemTitle = draft.items.find(
          (item) => String(item.game_id) === String(gameId)
        )?.game?.title;
        draft.items = draft.items.filter(
          (item) => String(item.game_id) !== String(gameId)
        );
        // Optionally store title for message later
      });
      swrMutateCart(optimisticCart, false);
      setMutationState({ isMutating: true, mutationError: null });

      try {
        // NOTE: Assuming cartControllerRemoveItem exists and expects game_id (as string).
        // Add `@ts-expect-error` if necessary due to stale types
        await cartControllerRemoveItem(gameId);
        // Revalidate on success
        await swrMutateCart();
        setMutationState({ isMutating: false, mutationError: null });
        // Need to fetch cart again to return it, or adjust return type
        return cartData; // Returning current data for now
      } catch (err) {
        console.error("removeItem Error:", err);
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setMutationState({ isMutating: false, mutationError: errorObj });
        // Revert optimistic update on error
        await swrMutateCart();
        throw errorObj;
      }
    },
    [isAuthenticated, cartData, swrMutateCart]
  );

  // Update Item Quantity Action
  const updateQuantity = useCallback(
    async (gameId: string, quantity: number): Promise<Cart | null> => {
      if (!isAuthenticated || !cartData) {
        setMutationState({
          isMutating: false,
          mutationError: new Error("User not authenticated or cart not loaded"),
        });
        return cartData ?? null;
      }
      if (quantity <= 0) {
        // Delegate to removeItem if quantity is 0 or less
        return removeItem(gameId);
      }

      // Optimistic update
      const optimisticCart = produce(cartData, (draft) => {
        const item = draft?.items?.find(
          (item) => String(item.game_id) === String(gameId)
        );
        if (item) {
          item.quantity = quantity;
        }
      });
      swrMutateCart(optimisticCart, false);
      setMutationState({ isMutating: true, mutationError: null });

      try {
        // NOTE: Assuming cartControllerUpdateItemQuantity exists and expects gameId and payload.
        const payload: CartItemUpdateSchema = { quantity };
        // Add `@ts-expect-error` if necessary due to stale types
        await cartControllerUpdateItemQuantity(gameId, payload);
        // Revalidate on success
        await swrMutateCart();
        setMutationState({ isMutating: false, mutationError: null });
        return cartData; // Returning current data for now
      } catch (err) {
        console.error("updateQuantity Error:", err);
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setMutationState({ isMutating: false, mutationError: errorObj });
        // Revert optimistic update on error
        await swrMutateCart();
        throw errorObj;
      }
    },
    [isAuthenticated, cartData, swrMutateCart, removeItem] // Added removeItem dependency
  );

  // Clear Cart Action
  const clearCart = useCallback(async (): Promise<Cart | null> => {
    if (!isAuthenticated || !cartData) {
      setMutationState({
        isMutating: false,
        mutationError: new Error("User not authenticated or cart not loaded"),
      });
      return cartData ?? null;
    }

    // Optimistic update
    const optimisticCart = produce(cartData, (draft) => {
      draft.items = [];
    });
    swrMutateCart(optimisticCart, false);
    setMutationState({ isMutating: true, mutationError: null });

    try {
      await cartControllerClearCart();
      // Revalidate on success
      await swrMutateCart();
      setMutationState({ isMutating: false, mutationError: null });
      return cartData; // Returning current data for now
    } catch (err) {
      console.error("clearCart Error:", err);
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setMutationState({ isMutating: false, mutationError: errorObj });
      // Revert optimistic update on error
      await swrMutateCart();
      throw errorObj;
    }
  }, [isAuthenticated, cartData, swrMutateCart]);

  // --- Memoize Context Value ---

  const contextValue = useMemo<CartContextValue>(
    () => ({
      cart: cartData,
      ...mutationState,
      isLoading,
      error,
      totalItems,
      totalPrice, // Include totalPrice in the context value
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      fetchCart,
    }),
    [
      cartData,
      mutationState,
      isLoading,
      error,
      totalItems,
      totalPrice, // Add totalPrice dependency
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      fetchCart,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

// --- Custom Hook for Consumption ---

/**
 * Custom hook to consume CartContext using useContextSelector for performance.
 * Allows selecting specific parts of the context state.
 * Throws error if used outside CartProvider.
 * @template Selected The type of the selected state slice.
 * @param {(state: CartContextValue) => Selected} [selector] Optional selector function.
 * @returns {Selected | CartContextValue} The selected state slice or the full context value.
 */
// Simplified return type when selector is undefined
export function useCart(): CartContextValue;
export function useCart<Selected>(
  selector: (state: CartContextValue) => Selected
): Selected;
export function useCart<Selected>(
  selector?: (state: CartContextValue) => Selected
): Selected | CartContextValue {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  if (selector) {
    return useContextSelector(CartContext, selector);
  }

  // If no selector, return the whole context
  return context;
}

// Example of a specific selector hook (optional, components can define their own)
// export const useCartItems = () => useCart(state => state.cart?.items);
