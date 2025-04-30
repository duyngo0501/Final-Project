import { createContext, useContextSelector } from "use-context-selector";
import { useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import {
  User as SupabaseUser,
  Session as SupabaseSession,
} from "@supabase/supabase-js"; // Use Supabase User type directly
import type { Provider } from "@supabase/supabase-js"; // Import Session type
import { message } from "antd";

// Export the User type
export type User = SupabaseUser & {
  // Add any custom fields you might attach later
  username?: string; // Add username if it's part of your user concept
  role?: string;
};

/**
 * @description Defines the shape of the authentication context value.
 * Uses Supabase Session and User types.
 */
interface AuthContextValue {
  session: SupabaseSession | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean; // Derived from session
  isAdmin: boolean; // Derived from user roles (needs adjustment based on your role setup)
  signUp: (params: {
    email: string;
    password: string;
    options?: any;
  }) => Promise<any>; // Use Supabase types/params
  signInWithPassword: (params: {
    email: string;
    password: string;
  }) => Promise<any>; // Use Supabase types/params
  signInWithProvider: (params: { provider: Provider }) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  logout: () => Promise<void>;
}

// --- Update default context values ---
const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  isAdmin: false, // Default to false
  signUp: async () => Promise.reject(new Error("AuthProvider not found")),
  signInWithPassword: async () =>
    Promise.reject(new Error("AuthProvider not found")),
  signInWithProvider: async () =>
    Promise.reject(new Error("AuthProvider not found")),
  signOut: async () => Promise.reject(new Error("AuthProvider not found")),
  clearError: () => {
    throw new Error("AuthProvider not found");
  },
  logout: async () => Promise.reject(new Error("AuthProvider not found")),
});

// Define props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * @description Provides Supabase authentication state and actions to the application.
 * Manages Supabase session using onAuthStateChange.
 * @param {AuthProviderProps} props The component props.
 * @returns {JSX.Element} The provider component.
 */
export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Get Admin Email from Environment Variables ---
  // Ensure VITE_ADMIN_EMAIL is set in your .env file and exposed by Vite
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn(
      "VITE_ADMIN_EMAIL environment variable is not set. Admin checks will not work."
    );
  }

  // Derived state
  const isAuthenticated = !!session && !!user;
  // --- Implement isAdmin logic using Environment Variable ---
  const isAdmin = useMemo(() => {
    console.log("[AuthContext] Checking isAdmin:");
    console.log("[AuthContext] User:", user);
    console.log("[AuthContext] User Email:", user?.email);
    console.log("[AuthContext] Admin Email Env:", adminEmail);

    if (!user || !adminEmail) {
      console.log("[AuthContext] isAdmin: false (No user or adminEmail)");
      return false; // Not admin if no user or no admin email configured
    }
    // Compare user's email with the configured admin email
    // Ensure case-insensitive comparison
    const isMatch = user.email?.toLowerCase() === adminEmail.toLowerCase();
    console.log("[AuthContext] Email Match Result:", isMatch);
    return isMatch;
  }, [user, adminEmail]); // Add adminEmail to dependency array

  // --- Setup onAuthStateChange listener ---
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error getting initial session:", err);
        setError("Failed to load session.");
        setLoading(false);
      });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // No need to set loading here, session update is reactive
      setError(null); // Clear error on successful auth change
    });

    // Cleanup listener on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // --- Supabase Sign Up ---
  const signUp = useCallback(
    async (params: { email: string; password: string; options?: any }) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: signUpError } = await supabase.auth.signUp(params);
        if (signUpError) throw signUpError;
        // User might need email confirmation, session/user state will update via onAuthStateChange
        // Return the response data which might contain the user object (even if confirmation needed)
        return data;
      } catch (err: any) {
        console.error("Supabase sign up error:", err);
        setError(err.message || "Sign up failed");
        throw err; // Re-throw for component handling
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Supabase Sign In with Password ---
  const signInWithPassword = useCallback(
    async (params: { email: string; password: string }) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword(params);
        if (signInError) throw signInError;
        // Session/user state will update via onAuthStateChange
        return data;
      } catch (err: any) {
        console.error("Supabase sign in error:", err);
        setError(err.message || "Invalid login credentials");
        throw err; // Re-throw for component handling
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Supabase Sign In with OAuth (Redirect Flow) ---
  const signInWithProvider = useCallback(
    async (params: { provider: Provider }) => {
      setLoading(true);
      setError(null);
      try {
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: params.provider,
          options: {
            redirectTo: window.location.origin, // Redirect back to the app root after OAuth
            // Add scopes if needed, e.g., 'profile email'
          },
        });
        if (oauthError) throw oauthError;
        // Redirect happens automatically, no need to return anything here
        // Loading will stop when the page redirects or if there's an error
      } catch (err: any) {
        console.error("Supabase OAuth error:", err);
        setError(err.message || `Failed to sign in with ${params.provider}`);
        setLoading(false); // Stop loading on error
        // No need to throw here as page won't redirect on error
      }
      // Note: setLoading(false) is not called on success because the browser will navigate away
    },
    []
  );

  // --- Supabase Sign Out ---
  const signOut = useCallback(async () => {
    setLoading(true); // Indicate loading during sign out
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      // State updates (session=null, user=null) happen via onAuthStateChange
    } catch (err: any) {
      console.error("Supabase sign out error:", err);
      setError(err.message || "Sign out failed");
      // Still update state locally in case listener fails? Redundant usually.
      // setSession(null);
      // setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Logout Action
  const logout = useCallback(async () => {
    setLoading(true); // Indicate loading during sign out
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setLoading(false);
      setSession(null);
      setUser(null);
      message.success("Logged out successfully.");
      // Clear other potentially sensitive caches/state here if needed
      // e.g., manually clear React Query cache for user-specific data
    } catch (error: any) {
      console.error("Logout error:", error);
      message.error(error.message || "Failed to log out.");
      // Even on error, try to clear local state
      setLoading(false);
      setSession(null);
      setUser(null);
    }
  }, [supabase.auth]);

  // --- Memoized Context Value ---
  const value: AuthContextValue = useMemo(
    () => ({
      session,
      user,
      loading,
      error,
      isAuthenticated,
      isAdmin,
      signUp,
      signInWithPassword,
      signInWithProvider,
      signOut,
      clearError,
      logout,
    }),
    [
      session,
      user,
      loading,
      error,
      isAuthenticated,
      isAdmin,
      signUp,
      signInWithPassword,
      signInWithProvider,
      signOut,
      clearError,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Update useAuth hook's type signature ---
/**
 * @description Custom hook to consume the AuthContext selectively using use-context-selector.
 * @template T
 * @param {(state: AuthContextValue) => T} selector - Function to select data from context.
 * @returns {T} The selected data.
 */
export const useAuth = <T,>(selector: (state: AuthContextValue) => T): T => {
  return useContextSelector(AuthContext, selector);
};
