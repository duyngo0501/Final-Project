import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spin, Layout } from "antd"; // For loading state

/**
 * @description Props for AdminProtectedRoute.
 * Can potentially accept children or just render Outlet.
 */
interface AdminProtectedRouteProps {
  children?: React.ReactNode; // Optional children prop
}

/**
 * @description A route guard component.
 * Checks if the user is authenticated and has an 'admin' role.
 * Renders child routes/components if authorized, otherwise redirects.
 * @param {AdminProtectedRouteProps} props Component props.
 * @returns {React.ReactElement | null} The protected route element or null.
 */
const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
}) => {
  const location = useLocation();
  const {
    isAuthenticated,
    isLoadingAuth, // Get loading state from AuthContext
    isAdmin, // Get isAdmin flag from AuthContext
  } = useAuth((state) => ({
    isAuthenticated: state.isAuthenticated,
    isLoadingAuth: state.loading, // Corrected: Use state.loading based on linter hint
    isAdmin: state.isAdmin, // Select the isAdmin flag
  }));

  // 1. Show loading indicator while auth status is being determined
  if (isLoadingAuth) {
    return (
      <Layout
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="Checking authentication..." />
      </Layout>
    );
  }

  // 2. Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log(
      "[AdminProtectedRoute] User not authenticated, redirecting to login."
    );
    // Pass the intended destination path in state so login page can redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Redirect to home if authenticated but not an admin
  if (!isAdmin) {
    console.log(
      `[AdminProtectedRoute] User is not admin (isAdmin=${isAdmin}), redirecting home.`
    );
    // Optionally show a 'Not Authorized' message before redirecting or redirect directly
    // message.error('You are not authorized to access this page.');
    return <Navigate to="/" replace />;
  }

  // 4. Render children or Outlet if authorized
  console.log("[AdminProtectedRoute] User authorized.");
  return children ? <>{children}</> : <Outlet />; // Render children if passed, otherwise Outlet
};

export default AdminProtectedRoute;
