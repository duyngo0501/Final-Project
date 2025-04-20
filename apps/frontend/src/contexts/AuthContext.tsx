import { createContext, useContextSelector } from "use-context-selector";
import { useReducer, useEffect, ReactNode, useCallback, Reducer } from "react";
import { produce } from "immer";
import { authAPI } from "@/services/api"; // Removed Credentials, UserData import

// FIXME: Replace with actual type definitions, ideally imported
// Export the placeholder interface
export interface Credentials {
  email: string;
  password: string;
  [key: string]: any;
}
// Export the placeholder interface
export interface UserData {
  username: string;
  email: string;
  password: string;
  [key: string]: any;
}

// Define the User type (adjust based on actual user data structure)
// Export the User interface if it might be needed elsewhere
export interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  created_at?: string | number | Date; // Add optional created_at field
  // Add other user properties as needed
}

// Define the shape of the authentication state
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean; // Derived state, kept for convenience
  isAdmin: boolean; // Derived state, kept for convenience
}

// Define the possible actions
type AuthAction =
  | { type: "AUTH_INIT_START" }
  | {
      type: "AUTH_INIT_SUCCESS";
      payload: { user: User | null; token: string | null };
    }
  | { type: "AUTH_INIT_FAILURE" }
  | { type: "AUTH_REQUEST" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; token: string } }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  loading: true, // Start loading initially to check auth status
  error: null,
  isAuthenticated: false,
  isAdmin: false,
};

// Reducer function using Immer
// Explicitly type the reducer function itself
const authReducer: Reducer<AuthState, AuthAction> = produce(
  (draft: AuthState, action: AuthAction) => {
    switch (action.type) {
      case "AUTH_INIT_START":
        draft.loading = true;
        draft.error = null;
        break;
      case "AUTH_INIT_SUCCESS":
        draft.user = action.payload.user;
        draft.token = action.payload.token;
        draft.isAuthenticated = !!action.payload.user;
        draft.isAdmin = action.payload.user?.role === "admin";
        draft.loading = false;
        break;
      case "AUTH_INIT_FAILURE":
        draft.user = null;
        draft.token = null;
        draft.isAuthenticated = false;
        draft.isAdmin = false;
        draft.loading = false;
        break;
      case "AUTH_REQUEST":
        draft.loading = true;
        draft.error = null;
        break;
      case "AUTH_SUCCESS":
        draft.user = action.payload.user;
        draft.token = action.payload.token;
        draft.isAuthenticated = true;
        draft.isAdmin = action.payload.user.role === "admin";
        draft.loading = false;
        draft.error = null;
        break;
      case "AUTH_FAILURE":
        draft.error = action.payload;
        draft.user = null;
        draft.token = null;
        draft.isAuthenticated = false;
        draft.isAdmin = false;
        draft.loading = false;
        break;
      case "LOGOUT":
        draft.user = null;
        draft.token = null;
        draft.isAuthenticated = false;
        draft.isAdmin = false;
        draft.error = null;
        draft.loading = false;
        break;
      case "CLEAR_ERROR":
        draft.error = null;
        break;
      default:
        break;
    }
  }
);

// Define the context value shape
interface AuthContextValue extends AuthState {
  register: (userData: UserData) => Promise<User>;
  login: (credentials: Credentials) => Promise<User>;
  logout: () => void;
  clearError: () => void;
}

// Create the context with use-context-selector
// Provide a default value matching the context shape, although it should not be used directly
const AuthContext = createContext<AuthContextValue>({
  ...initialState,
  register: async () => Promise.reject(new Error("AuthProvider not found")),
  login: async () => Promise.reject(new Error("AuthProvider not found")),
  logout: () => {
    throw new Error("AuthProvider not found");
  },
  clearError: () => {
    throw new Error("AuthProvider not found");
  },
});

// Define props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provides authentication state and actions to the application.
 * Manages user session, login, registration, and logout.
 * @param {AuthProviderProps} props The component props.
 * @returns {JSX.Element} The provider component.
 */
export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  // Explicitly type useReducer with the reducer's type
  const [state, dispatch] = useReducer<Reducer<AuthState, AuthAction>>(
    authReducer,
    initialState
  );

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      dispatch({ type: "AUTH_INIT_START" });
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          const currentUser = response.data;
          if (!currentUser) {
            throw new Error("Invalid user data in auth check response");
          }
          dispatch({
            type: "AUTH_INIT_SUCCESS",
            payload: { user: currentUser as User, token },
          });
        } catch (err) {
          console.error("Auth check failed:", err);
          localStorage.removeItem("token");
          dispatch({ type: "AUTH_INIT_FAILURE" });
        }
      } else {
        dispatch({ type: "AUTH_INIT_FAILURE" }); // No token found
      }
    };

    checkAuth();
  }, []);

  // Register function
  const register = useCallback(async (userData: UserData): Promise<User> => {
    dispatch({ type: "AUTH_REQUEST" });
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data; // Adjust based on actual API response
      localStorage.setItem("token", token);
      dispatch({ type: "AUTH_SUCCESS", payload: { user, token } });
      return user;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Registration failed";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw err; // Re-throw to allow handling in components
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: Credentials): Promise<User> => {
    dispatch({ type: "AUTH_REQUEST" });
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data; // Adjust based on actual API response
      localStorage.setItem("token", token);
      dispatch({ type: "AUTH_SUCCESS", payload: { user, token } });
      return user;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Login failed";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw err; // Re-throw to allow handling in components
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  }, []);

  // Function to clear errors
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // Assemble the context value
  const value: AuthContextValue = {
    ...state,
    register,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access the Authentication context.
 * Uses useContextSelector for performance optimization.
 * @template T The type of the selected state slice.
 * @param {(state: AuthContextValue) => T} selector Function to select a slice of the context state.
 * @returns {T} The selected state slice.
 * @throws Will throw an error if used outside of an AuthProvider.
 * @example
 * const user = useAuth(state => state.user);
 * const isAuthenticated = useAuth(state => state.isAuthenticated);
 * const { login, logout } = useAuth(state => ({ login: state.login, logout: state.logout }));
 */
export const useAuth = <T,>(selector: (state: AuthContextValue) => T): T => {
  const context = useContextSelector(AuthContext, selector);
  // Default value in createContext handles the error case if used outside provider.
  return context;
};
