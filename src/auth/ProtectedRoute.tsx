import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import React from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/secure-admin-login" replace />;
  }

  return children;
};

export default ProtectedRoute;
