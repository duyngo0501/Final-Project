import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
}

/**
 * A wrapper component that renders its children only if the user is authenticated.
 * Shows a loading indicator while checking auth status or initiating redirect.
 * Initiates Supabase Google OAuth flow if the user is not authenticated.
 * @param {PrivateRouteProps} props The component props, containing the children to render.
 * @returns {ReactNode | JSX.Element} The children or a loading indicator.
 */
const PrivateRoute = ({
  children,
}: PrivateRouteProps): ReactNode | JSX.Element => {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const loading = useAuth((state) => state.loading);
  const signInWithProvider = useAuth((state) => state.signInWithProvider);
  const authError = useAuth((state) => state.error);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      if (!authError) {
        signInWithProvider({ provider: "google" }).catch((err) => {
          console.error(
            "Error initiating Google sign-in from PrivateRoute:",
            err
          );
        });
      }
    }
  }, [loading, isAuthenticated, signInWithProvider, authError]);

  if (loading || (!isAuthenticated && !authError)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated && authError) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-red-600">
        <p>Authentication failed:</p>
        <p>{authError}</p>
        <p>Please try again later or contact support.</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return children;
  }

  return null;
};

export default PrivateRoute;
