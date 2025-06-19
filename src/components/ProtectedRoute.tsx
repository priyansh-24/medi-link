import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // Optional: Show spinner here if needed
  if (!user && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
