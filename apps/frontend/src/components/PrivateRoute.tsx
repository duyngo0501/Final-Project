import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
}

/**
 * A wrapper component that renders its children only if the user is authenticated.
 * Shows a loading indicator while checking auth status.
 * Redirects to the login page if the user is not authenticated.
 * @param {PrivateRouteProps} props The component props, containing the children to render.
 * @returns {ReactNode | JSX.Element} The children, a loading indicator, or a Redirect component.
 */
const PrivateRoute = ({
  children,
}: PrivateRouteProps): ReactNode | JSX.Element => {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const loading = useAuth((state) => state.loading);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
