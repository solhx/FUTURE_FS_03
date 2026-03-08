import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = authService.getToken();
  const user = authService.getStoredUser();

  if (!token || !user || user.role !== "admin") {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;