import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const location = useLocation();
  const { isLoggedIn, isAdmin, loading } = useAuth();

  // Still reading from localStorage
  if (loading) {
    return <LoadingSpinner size="lg" fullScreen text="Authenticating..." />;
  }

  // Not logged in at all
  if (!isLoggedIn) {
    return (
      <Navigate
        to={requireAdmin ? "/admin/login" : "/login"}
        state={{ from: location }}
        replace
      />
    );
  }

  // Logged in but not admin, and admin is required
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;