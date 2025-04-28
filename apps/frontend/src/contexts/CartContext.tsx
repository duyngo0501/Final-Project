import React, { ReactNode, useCallback, useMemo } from "react";
import { produce } from "immer";
import {
  createContext,
  useContextSelector,
  useContext,
} from "use-context-selector";
import { message } from "antd";
// Import generated client functions (keep for mutations for now)
import {
  // cartControllerGetCart, // Will be called by generated hook
  cartControllerAddItem,
  cartControllerUpdateItemQuantity,
  cartControllerRemoveItem,
  cartControllerClearCart,
} from "@/gen/client";
// Import generated query hook
import {
  useCartControllerGetCart,
  cartControllerGetCartQueryKey,
} from "@/gen/query/CartHooks/useCartControllerGetCart";
// Import generated mutation hooks (will use these later)
import { useCartControllerAddItem } from "@/gen/query/CartHooks/useCartControllerAddItem";
import { useCartControllerUpdateItemQuantity } from "@/gen/query/CartHooks/useCartControllerUpdateItemQuantity";
import { useCartControllerRemoveItem } from "@/gen/query/CartHooks/useCartControllerRemoveItem";
import { useCartControllerClearCart } from "@/gen/query/CartHooks/useCartControllerClearCart";
// Import types from generated client
import {
  CartResponse as Cart,
  CartItemResponse as CartItem,
  CartItemCreate as CartItemCreateSchema,
  CartItemUpdate as CartItemUpdateSchema,
} from "@/gen/types";
import { useAuth } from "@/contexts/AuthContext";
// Import SWR hook
import useSWR, { useSWRConfig } from "swr"; // Add SWR core imports
// import { Game } from "@/types/game"; // Keep using local Game type for addItem input
import { Game } from "@/gen/types"; // USE GENERATED TYPE
import useSWRMutation from "swr/mutation"; // IMPORT useSWRMutation

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
  cart: Cart | null | undefined;
  isLoading: boolean;
  error: Error | null;
  totalItems: number;
  totalPrice: number;
  addItem: (game: Game, quantity?: number) => Promise<Cart | null>;
  removeItem: (gameId: string) => Promise<Cart | null>;
  updateQuantity: (gameId: string, quantity: number) => Promise<Cart | null>;
  clearCart: () => Promise<Cart | null>;
  refetchCart: () => Promise<void>; // Renamed from fetchCart
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

/**
 * Provides cart state and actions, interacting with the cart API via Kubb client.
 * Uses React Query generated hooks for data fetching and mutations.
 * Follows use-context-selector pattern principles.
 * @param {CartProviderProps} props Component props.
 * @returns {JSX.Element} The provider component.
 */
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [mutationState, setMutationState] =
    React.useState<CartMutationState>(initialMutationState);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const { mutate: globalMutate } = useSWRConfig(); // Get SWR global mutate for invalidation

  // --- Use the generated SWR hook for fetching cart data --- //
  // Generate SWR key - use the function exported by Kubb if available,
  // otherwise construct it based on the pattern (likely just the base path).
  // Assuming Kubb generates a key like cartControllerGetCartKey = '/api/v1/cart/';
  const cartQueryKey = isAuthenticated ? cartControllerGetCartQueryKey() : null; // Prevent fetch if not authenticated

  const {
    data: response, // Full Axios response object from SWR fetcher
    error: swrError, // Error from SWR
    isLoading, // isLoading state from SWR
    mutate: mutateCart, // Specific mutate function for this key
  } = useCartControllerGetCart(
    // SWR hook might take key directly or need it within options depending on generation
    // Let's assume it takes options object like others based on Kubb patterns
    {
      query: {
        // suspense: false, // Already default usually, can add if needed
        // enabled: isAuthenticated, // SWR handles this via conditional key (null)
        shouldRetryOnError: false, // Don't retry auth/cart fetch errors
        // Revalidate on focus/reconnect might be desirable for cart
        // revalidateOnFocus: true,
        // revalidateOnReconnect: true,
      },
    }
  );

  // --- Process API Response --- //
  // Handle potential 404s which result in error
  const is404 = swrError && (swrError as any)?.status === 404;
  const cartData = is404 ? null : (response?.data ?? undefined);
  const error = is404 ? null : swrError instanceof Error ? swrError : null; // Assign error only if not 404

  // Calculate total items based on fetched cart data
  const totalItems = useMemo(() => {
    return cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  }, [cartData]);

  // Calculate total price based on fetched cart data
  const totalPrice = useMemo(() => {
    return (
      cartData?.items?.reduce((sum, item) => {
        const price = (item as any).game?.price ?? 0; // Use 'as any' until types fixed
        return sum + price * item.quantity;
      }, 0) ?? 0
    );
  }, [cartData]);

  // Explicit function to trigger revalidation
  const refetchCart = useCallback(async () => {
    console.log("refetchCart called, triggering SWR mutate...");
    // Use the specific mutate function bound to the cart key
    await mutateCart();
  }, [mutateCart]);

  // --- Add Item Mutation (Refactored for SWR) ---
  const { trigger: addItemTrigger, isMutating: isAddingItem } = useSWRMutation(
    cartControllerGetCartQueryKey(), // Key to mutate/revalidate
    async (key, { arg }: { arg: CartItemCreateSchema }) => {
      // Updater function: calls the actual API
      const response = await cartControllerAddItem(arg);
      // Return the response data for populateCache
      return response.data; // Assuming response has { data: CartItemResponse }
    },
    {
      // SWR Mutation options - SIMPLIFIED
      rollbackOnError: true,
      revalidate: true, // Revalidate cart query on success
      onError: (error) => {
        console.error("SWR addItem Mutation Error:", error);
        setMutationState({
          isMutating: false,
          mutationError:
            error instanceof Error ? error : new Error("Failed to add item"),
        });
      },
    }
  );

  // --- Remove Item Mutation (Refactored for SWR) ---
  const { trigger: removeItemTrigger, isMutating: isRemovingItem } =
    useSWRMutation(
      // Key needs to include game_id for mutation targeting, but base key for revalidation
      // SWRMutation often uses the base key for invalidation purposes.
      // The actual ID is passed via the trigger function's argument.
      cartControllerGetCartQueryKey(),
      async (key, { arg }: { arg: { game_id: string } }) => {
        // Updater function calls the API client function
        await cartControllerRemoveItem(arg.game_id);
        // Return something to indicate success, or the ID removed for populateCache?
        // Let's return the removed ID for potential use in populateCache.
        return arg.game_id;
      },
      {
        // SWR Mutation options - SIMPLIFIED
        rollbackOnError: true,
        revalidate: true, // Revalidate cart query on success
        onError: (error) => {
          console.error("SWR removeItem Mutation Error:", error);
          setMutationState({
            isMutating: false,
            mutationError:
              error instanceof Error
                ? error
                : new Error("Failed to remove item"),
          });
        },
      }
    );

  // --- Update Quantity Mutation (Refactored for SWR) ---
  const { trigger: updateQuantityTrigger, isMutating: isUpdatingQuantity } =
    useSWRMutation(
      cartControllerGetCartQueryKey(), // Base key for revalidation
      async (
        key,
        { arg }: { arg: { game_id: string; data: CartItemUpdateSchema } }
      ) => {
        // Updater calls the API
        const response = await cartControllerUpdateItemQuantity(
          arg.game_id,
          arg.data
        );
        return response.data; // Return updated CartItem
      },
      {
        // SWR Mutation options - SIMPLIFIED
        rollbackOnError: true,
        revalidate: true, // Revalidate cart query on success
        onError: (error) => {
          console.error("SWR updateQuantity Mutation Error:", error);
          setMutationState({
            isMutating: false,
            mutationError:
              error instanceof Error
                ? error
                : new Error("Failed to update quantity"),
          });
        },
      }
    );

  // --- Clear Cart Mutation (Refactored for SWR) ---
  const { trigger: clearCartTrigger, isMutating: isClearingCart } =
    useSWRMutation(
      cartControllerGetCartQueryKey(), // Base key to revalidate
      async (key) => {
        // Updater calls the API
        await cartControllerClearCart();
        // Return null or an empty cart structure?
        // Let's return null, populateCache will handle it.
        return null;
      },
      {
        // SWR Mutation options - SIMPLIFIED
        rollbackOnError: true,
        revalidate: true, // Revalidate cart query on success (will fetch empty/updated cart)
        onError: (error) => {
          console.error("SWR clearCart Mutation Error:", error);
          setMutationState({
            isMutating: false,
            mutationError:
              error instanceof Error
                ? error
                : new Error("Failed to clear cart"),
          });
        },
      }
    );

  // Wrapper function for adding item - SIMPLIFIED (No Optimistic Update)
  const addItem = useCallback(
    async (game: Game, quantity: number = 1): Promise<Cart | null> => {
      if (!isAuthenticated) {
        console.error("User not authenticated");
        return null;
      }
      const payload: CartItemCreateSchema = {
        game_id: game.id,
        quantity: quantity,
      };

      try {
        setMutationState({ isMutating: true, mutationError: null });
        await addItemTrigger(payload);
        setMutationState({ isMutating: false, mutationError: null });
        message.success(`${game.name} added to cart!`);
        return null;
      } catch (error) {
        setMutationState((prev) => ({
          ...prev,
          isMutating: false,
          mutationError: prev.mutationError,
        }));
        message.error(`Failed to add ${game.name} to cart.`);
        return null;
      }
    },
    [isAuthenticated, addItemTrigger]
  );

  // Wrapper function for removing item - SIMPLIFIED (No Optimistic Update)
  const removeItem = useCallback(
    async (gameId: string): Promise<Cart | null> => {
      if (!isAuthenticated) {
        console.error("User not authenticated");
        return null;
      }

      try {
        setMutationState({ isMutating: true, mutationError: null });
        await removeItemTrigger({ game_id: gameId });
        setMutationState({ isMutating: false, mutationError: null });
        message.success(`Item removed from cart.`);
        return null;
      } catch (error) {
        setMutationState((prev) => ({
          ...prev,
          isMutating: false,
          mutationError: prev.mutationError,
        }));
        message.error(`Failed to remove item from cart.`);
        return null;
      }
    },
    [isAuthenticated, removeItemTrigger]
  );

  // Wrapper function for updating quantity - SIMPLIFIED (No Optimistic Update)
  const updateQuantity = useCallback(
    async (gameId: string, quantity: number): Promise<Cart | null> => {
      if (!isAuthenticated) {
        console.error("User not authenticated");
        return null;
      }
      if (quantity <= 0) {
        return removeItem(gameId);
      }

      const payload: CartItemUpdateSchema = { quantity };

      try {
        setMutationState({ isMutating: true, mutationError: null });
        await updateQuantityTrigger({ game_id: gameId, data: payload });
        setMutationState({ isMutating: false, mutationError: null });
        message.success(`Item quantity updated.`);
        return null;
      } catch (error) {
        setMutationState((prev) => ({
          ...prev,
          isMutating: false,
          mutationError: prev.mutationError,
        }));
        message.error(`Failed to update quantity.`);
        return null;
      }
    },
    [isAuthenticated, updateQuantityTrigger, removeItem]
  );

  // Wrapper function for clearing cart - SIMPLIFIED (No Optimistic Update)
  const clearCart = useCallback(async (): Promise<Cart | null> => {
    if (!isAuthenticated) {
      console.error("User not authenticated");
      return null;
    }

    try {
      setMutationState({ isMutating: true, mutationError: null });
      await clearCartTrigger();
      setMutationState({ isMutating: false, mutationError: null });
      message.success(`Cart cleared.`);
      return null;
    } catch (error) {
      setMutationState((prev) => ({
        ...prev,
        isMutating: false,
        mutationError: prev.mutationError,
      }));
      message.error(`Failed to clear cart.`);
      return null;
    }
  }, [isAuthenticated, clearCartTrigger]);

  // --- Create Context Value ---
  const value = useMemo<CartContextValue>(() => {
    // Combine fetched data state with mutation state and actions
    return {
      cart: cartData,
      isLoading: isLoading, // Use isLoading from the SWR query hook
      error: error, // Use error from the SWR query hook
      isMutating:
        mutationState.isMutating ||
        isAddingItem ||
        isRemovingItem ||
        isUpdatingQuantity ||
        isClearingCart, // Combine all mutation states
      mutationError: mutationState.mutationError,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      refetchCart, // Provide the refetch function
    };
  }, [
    cartData,
    isLoading,
    error,
    mutationState,
    isAddingItem,
    isRemovingItem,
    isUpdatingQuantity,
    isClearingCart, // Add new mutation state
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refetchCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// --- Custom Hook for Consumption ---

// Overload signatures for the custom hook
export function useCart(): CartContextValue;
export function useCart<Selected>(
  selector: (state: CartContextValue) => Selected
): Selected;

// Implementation of the custom hook
export function useCart<Selected>(
  selector?: (state: CartContextValue) => Selected
): Selected | CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return selector ? useContextSelector(CartContext, selector) : context;
}

// Example of a specific selector hook (optional, components can define their own)
// export const useCartItems = () => useCart(state => state.cart?.items);
