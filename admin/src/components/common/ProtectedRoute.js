import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from './Spinner';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!admin)  return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
