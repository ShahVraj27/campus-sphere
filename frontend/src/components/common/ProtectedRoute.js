import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminRequired = false }) => {
  const { user, loading, isAdmin } = useAuth();
  
  // Show loading spinner while auth state is being checked
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 120px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Redirect to home if admin access is required but user is not admin
  if (adminRequired && !isAdmin()) {
    return <Navigate to="/" />;
  }
  
  // Render children if all checks pass
  return children;
};

export default ProtectedRoute;