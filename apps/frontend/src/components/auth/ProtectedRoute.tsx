import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spin } from "antd"; // Or your preferred loading component

/**
 * @description A component that wraps LAYOUT routes requiring authentication.
 * It checks the user's authentication status from AuthContext.
 * If the user is authenticated, it renders the child routes via <Outlet />.
 * If the user is not authenticated, it redirects to the login page.
 * If authentication status is loading, it displays a loading indicator.
 * Use this for route elements that contain nested routes themselves.
 * @returns {React.ReactElement} The Outlet, a redirect, or a loading indicator.
 */
const AuthLayoutRoute: React.FC = () => {
  // Select only the necessary state to minimize re-renders
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const isLoading = useAuth((state) => state.isUserLoading);

  if (isLoading) {
    // Show loading indicator while checking auth status
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    // Pass the current location to redirect back after login (optional)
    // return <Navigate to="/login" state={{ from: location }} replace />;
    return <Navigate to="/login" replace />;
  }

  // Render the nested child route components if authenticated
  return <Outlet />;
};

export default AuthLayoutRoute;
