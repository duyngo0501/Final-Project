import { createContext, useContextSelector } from "use-context-selector";
import { useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { authAPI } from "@/services/api"; // Removed Credentials, UserData import
import { User } from "@/types/user"; // Import the centralized User type

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
// REMOVE the local User interface definition
// export interface User {
//   id: string;
//   username: string;
//   email: string;
//   role: "user" | "admin";
//   created_at?: string | number | Date; // Add optional created_at field
//   // Add other user properties as needed
// }
// ----------------------------------------

// Define the context value shape
// Note: AuthState interface is no longer needed
interface AuthContextValue {
  user: User | null; // Use imported User type
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  register: (userData: UserData) => Promise<User>; // Use imported User type
  login: (credentials: Credentials) => Promise<User>; // Use imported User type
  logout: () => void;
  clearError: () => void;
}

// Create the context with use-context-selector
// Default values for functions now throw errors
const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
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
 * Provides authentication state and actions to the application using useState.
 * Manages user session, login, registration, and logout.
 * @param {AuthProviderProps} props The component props.
 * @returns {JSX.Element} The provider component.
 */
export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  // Replace useReducer with individual useState hooks
  const [user, setUser] = useState<User | null>(null); // Use imported User type
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Start loading initially
  const [error, setError] = useState<string | null>(null);

  // Derived state calculated directly
  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === "admin";

  // Check authentication status on initial load
  useEffect(() => {
    let isMounted = true; // Track mount status for async operations
    const checkAuth = async () => {
      setLoading(true);
      setError(null);
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const response = await authAPI.getCurrentUser(); // Assuming getCurrentUser relies on token implicitly or uses stored token
          const currentUser = response.data;
          if (isMounted && currentUser) {
            setUser(currentUser); // No assertion needed now
            setToken(storedToken);
          } else if (isMounted) {
            // Token exists but user fetch failed or returned null
            localStorage.removeItem("token");
            setUser(null);
            setToken(null);
          }
        } catch (err) {
          console.error("Auth check failed:", err);
          localStorage.removeItem("token");
          if (isMounted) {
            setUser(null);
            setToken(null);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setLoading(false); // No token found, stop loading
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    }; // Cleanup function
  }, []);

  // Register function using useState setters
  const register = useCallback(async (userData: UserData): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(userData);
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem("token", newToken);
      setUser(newUser); // No assertion needed now
      setToken(newToken);
      setError(null);
      return newUser;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Registration failed";
      setError(errorMessage);
      setUser(null);
      setToken(null);
      throw err; // Re-throw to allow handling in components
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function using useState setters
  const login = useCallback(async (credentials: Credentials): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(credentials);
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem("token", newToken);
      setUser(newUser); // No assertion needed now
      setToken(newToken);
      setError(null);
      return newUser;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Login failed";
      setError(errorMessage);
      setUser(null);
      setToken(null);
      throw err; // Re-throw to allow handling in components
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function using useState setters
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setError(null);
    setLoading(false);
  }, []);

  // Function to clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Assemble the context value using useMemo for stability
  const value: AuthContextValue = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      isAuthenticated,
      isAdmin,
      register,
      login,
      logout,
      clearError,
    }),
    [
      user,
      token,
      loading,
      error,
      isAuthenticated,
      isAdmin,
      register,
      login,
      logout,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to consume the AuthContext selectively.
 * @template T
 * @param {(state: AuthContextValue) => T} selector - Function to select data from context.
 * @returns {T} The selected data.
 */
export const useAuth = <T,>(selector: (state: AuthContextValue) => T): T => {
  return useContextSelector(AuthContext, selector);
};
