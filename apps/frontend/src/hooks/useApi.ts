/**
 * Custom SWR hooks for interacting with the backend API using the generated Kubb client.
 */
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { mutate } from "swr"; // Import global mutate
import {
  // Import necessary types directly from gen/types
  UserReadSchema, // Assuming this is the type for the user object
} from "@/gen/types/UserReadSchema"; // Corrected path
import { AuthLoginMutationResponse } from "@/gen/types/AuthLogin"; // Corrected path and types
import {
  AuthRegisterUserMutationRequest,
  AuthRegisterUserMutationResponse,
} from "@/gen/types/AuthRegisterUser"; // Corrected path and types
import {
  // Import necessary client functions directly from gen/client
  authLogin,
  authRegisterUser,
  // FIXME: Identify the actual exported function for GET /auth/me
  // For now, assume it's handled by a client instance or needs specific setup
  // getCurrentUser, // Placeholder
  // FIXME: Identify the actual exported function for POST /auth/refresh
  // authRefresh, // Placeholder
} from "@/gen/client"; // Adjust if functions are exported differently
import { User } from "@/types/user"; // Import the app's internal User type if needed for mapping
import { axiosInstance } from "@/client"; // Assuming @/ maps to src/

// --- Define missing login request type locally --- FIX ME: Regenerate client types
interface AuthLoginMutationRequest {
  email: string;
  password: string;
}

// --- Constants for SWR Keys ---
export const AUTH_ME_KEY = "/api/v1/auth/me";
export const AUTH_LOGIN_KEY = "/api/v1/auth/login";
export const AUTH_REGISTER_KEY = "/api/v1/auth/register";
export const AUTH_REFRESH_KEY = "/api/v1/auth/refresh"; // Placeholder

// --- Helper: API Fetcher for SWR ---
// You might need a configured client instance from Kubb or Axios here
// Or, define fetchers within each hook if they need specific configs

// --- Authentication Hooks ---

/**
 * SWR hook to fetch the current authenticated user's data.
 * Handles loading, error states, and provides a mutation function.
 * @returns {{ user: UserReadSchema | null | undefined, isLoading: boolean, error: any, mutateUser: () => void }}
 */
export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR<UserReadSchema | null>(
    AUTH_ME_KEY,
    async (key) => {
      // SWR passes the key as the first argument
      const token = localStorage.getItem("token");
      if (!token) return null; // Not logged in

      try {
        // --- Use axiosInstance directly as generated function is missing ---
        // The request interceptor in client.ts will add the Authorization header
        const response = await axiosInstance.get<UserReadSchema>(key); // Use the key as the URL
        return response.data; // Return the user data from the response

        // --- Old FIXME block removed ---
        // // Example: const response = await kubbClient.auth.getCurrentUser();
        // console.warn(
        //   "FIXME: SWR fetcher needs actual getCurrentUser call from Kubb client in useApi.ts"
        // );
        // // Simulate error until fixed
        // throw new Error("getCurrentUser fetcher not implemented");
        // --- END FIXME ---

        // return response; // Assuming Kubb function returns UserReadSchema directly
      } catch (err: any) {
        // Interceptor in client.ts should handle 401 and refresh attempts
        // If it reaches here with 401, it means refresh failed or no refresh token
        if (err.response?.status === 401) {
          console.warn(
            "User fetch failed after interceptor handling (401).",
            err
          );
          // Ensure local state is cleared (interceptor might have already done this)
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          return null; // Treat as logged out
        }
        console.error("Error fetching current user:", err);
        throw err; // Re-throw other errors for SWR to handle
      }
    },
    {
      shouldRetryOnError: false, // Don't retry on auth errors
      revalidateOnFocus: true, // Revalidate when window regains focus
      // Add other SWR options as needed
    }
  );

  return {
    user: data,
    isLoading,
    error,
    mutateUser: mutate, // Function to manually re-trigger fetch
  };
}

/**
 * SWR Mutation hook for logging in a user.
 * Provides a trigger function and manages mutation state (isMutating, error).
 * @returns {{ triggerLogin: (credentials: AuthLoginRequest) => Promise<UserReadSchema | undefined>, isLoggingIn: boolean, loginError: any }}
 */
export function useLoginMutation() {
  const { trigger, isMutating, error } = useSWRMutation<
    AuthLoginMutationResponse,
    any,
    string,
    AuthLoginMutationRequest
  >(
    AUTH_LOGIN_KEY,
    async (url, { arg }) => {
      // Call the imported Kubb client function
      // The function might return the raw response or directly the data
      const response = await authLogin({ data: arg });
      // Assuming response is AuthLoginResponse which contains token and user details
      return response.data; // Assuming the actual response is wrapped in ResponseConfig
    },
    {
      throwOnError: false, // Handle error via the returned 'error' state
      onSuccess: (data) => {
        // Store tokens upon successful login
        // Adjust based on actual response structure from AuthLoginResponse
        if (data && typeof data === "object" && "access_token" in data) {
          localStorage.setItem("token", data.access_token);
          // Optionally store refresh token if present
          // if (data.refresh_token) localStorage.setItem('refreshToken', data.refresh_token);
        }
        // Trigger revalidation of the current user data
        mutate(AUTH_ME_KEY); // Using global mutate from SWRConfig or import directly
      },
      onError: (err) => {
        console.error("Login failed:", err);
        localStorage.removeItem("token"); // Clear any stale token
        localStorage.removeItem("refreshToken");
      },
    }
  );

  // We might need to import the global mutate function from SWR cache
  // import { mutate } from 'swr';

  return {
    triggerLogin: trigger,
    isLoggingIn: isMutating,
    loginError: error,
  };
}

/**
 * SWR Mutation hook for registering a new user.
 * Provides a trigger function and manages mutation state.
 * @returns {{ triggerRegister: (userData: AuthRegisterUserRequest) => Promise<AuthRegisterUserResponse | undefined>, isRegistering: boolean, registerError: any }}
 */
export function useRegisterMutation() {
  const { trigger, isMutating, error } = useSWRMutation<
    AuthRegisterUserMutationResponse, // Response type (UserReadSchema)
    any, // Error type
    string, // Key type
    AuthRegisterUserMutationRequest // Arg type (UserCreateSchema)
  >(
    AUTH_REGISTER_KEY,
    async (url, { arg }) => {
      const response = await authRegisterUser(arg);
      // Assuming response is ResponseConfig<UserReadSchema>
      // SWR expects the data directly, not the ResponseConfig wrapper
      return response.data; // Return the actual user data
    },
    {
      throwOnError: false,
      // Optional: Automatically log in user or trigger login flow on success?
      // onSuccess: (data) => {
      //   console.log('Registration successful:', data);
      //   // Maybe trigger login or store partial data?
      // },
      onError: (err) => {
        console.error("Registration failed:", err);
      },
    }
  );

  return {
    triggerRegister: trigger,
    isRegistering: isMutating,
    registerError: error,
  };
}

/**
 * SWR Mutation hook for logging out a user.
 * Provides a trigger function.
 * FIXME: Implement the actual logout API call if one exists, or just clear local state.
 * @returns {{ triggerLogout: () => Promise<void>, isLoggingOut: boolean }}
 */
export function useLogoutMutation() {
  const { trigger, isMutating } = useSWRMutation<void, any, string>(
    "/api/v1/auth/logout", // Use a placeholder key or null if no API call
    async () => {
      // --- FIXME: Call actual logout endpoint if backend has one ---
      // await kubbAuthClient.logout();
      // --- END FIXME ---

      // Clear local storage regardless of API call success/failure
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    },
    {
      throwOnError: false,
      onSuccess: () => {
        // Clear the user cache
        mutate(AUTH_ME_KEY, null, false); // Set user data to null without revalidating
      },
      onError: (err) => {
        // Log error but still clear local data as logout intent was clear
        console.error("Logout API call failed (if implemented):", err);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        mutate(AUTH_ME_KEY, null, false);
      },
    }
  );
  // We might need to import the global mutate function from SWR cache
  // import { mutate } from 'swr';

  return {
    triggerLogout: trigger,
    isLoggingOut: isMutating,
  };
}

/**
 * SWR Mutation hook for refreshing the auth token.
 * FIXME: Implement using the actual Kubb refresh function.
 * @returns {{ triggerRefresh: (refreshToken: string) => Promise<{ access_token: string } | undefined>, isRefreshing: boolean, refreshError: any }}
 */
export function useRefreshTokenMutation() {
  const { trigger, isMutating, error } = useSWRMutation<
    { access_token: string },
    any,
    string,
    { refreshToken: string }
  >(
    AUTH_REFRESH_KEY,
    async (url, { arg }) => {
      // --- FIXME: Call actual refresh endpoint ---
      // const response = await kubbAuthRefresh(arg.refreshToken);
      console.warn(
        "FIXME: SWR trigger needs actual refreshToken call from Kubb client in useApi.ts"
      );
      throw new Error("refreshToken fetcher not implemented");
      // --- END FIXME ---
      // return response.data; // Assuming response structure
    },
    {
      throwOnError: false,
      onSuccess: (data) => {
        if (
          data &&
          typeof data === "object" &&
          "access_token" in data &&
          data.access_token
        ) {
          localStorage.setItem("token", data.access_token);
          // Maybe schedule next refresh or re-fetch user?
          mutate(AUTH_ME_KEY);
        }
      },
      onError: (err) => {
        console.error("Token refresh failed:", err);
        // Force logout if refresh fails
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        mutate(AUTH_ME_KEY, null, { revalidate: false }); // Correct mutate usage
        // TODO: Trigger global logout state
      },
    }
  );
  // We might need to import the global mutate function from SWR cache
  // import { mutate } from 'swr';

  return {
    triggerRefresh: trigger,
    isRefreshing: isMutating,
    refreshError: error,
  };
}

// --- Add hooks for Games (Products), Cart, Orders etc. following similar patterns ---
// Example:
// export function useProducts(...) { ... useSWR(...) }
// export function useAddToCartMutation(...) { ... useSWRMutation(...) }
