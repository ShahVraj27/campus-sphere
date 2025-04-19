import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token exists in localStorage on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!accessToken || !refreshToken) {
          setLoading(false);
          return;
        }
        
        // Check if access token is expired
        const decodedToken = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token is expired, try to refresh
          await refreshAccessToken();
        } else {
          // Token is valid, set user
          setUser({
            id_no: decodedToken.user_id,
            user_type: decodedToken.user_type || 'user'
          });
          
          // Update user data
          await fetchUserData();
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Session expired. Please login again.');
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await api.get('/users/me/');
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };
  
  // Refresh access token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/token/refresh/', {
        refresh: refreshToken
      });
      
      localStorage.setItem('accessToken', response.data.access);
      
      // Update user state with decoded token
      const decodedToken = jwtDecode(response.data.access);
      setUser({
        id_no: decodedToken.user_id,
        user_type: decodedToken.user_type || 'user'
      });
      
      // Update user data
      await fetchUserData();
      
      return response.data.access;
    } catch (err) {
      console.error('Token refresh error:', err);
      logout();
      throw err;
    }
  };
  
  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await api.post('/auth/token/', credentials);
      
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      // Set user from token
      const decodedToken = jwtDecode(response.data.access);
      setUser({
        id_no: decodedToken.user_id,
        user_type: decodedToken.user_type || 'user'
      });
      
      // Fetch complete user data
      await fetchUserData();
      
      return response.data;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      throw err;
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/auth/register/', userData);
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.detail || 
        Object.values(err.response?.data || {})[0]?.[0] || 
        'Registration failed. Please try again.'
      );
      throw err;
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };
  
  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await api.put('/users/update_me/', userData);
      setUser(response.data);
      return response.data;
    } catch (err) {
      console.error('Profile update error:', err);
      setError(
        err.response?.data?.detail || 
        Object.values(err.response?.data || {})[0]?.[0] || 
        'Profile update failed. Please try again.'
      );
      throw err;
    }
  };
  
  // Check if user is admin
  const isAdmin = () => {
    return user?.user_type === 'developer' || user?.user_type === 'maintainer';
  };
  
  // Check if user is developer
  const isDeveloper = () => {
    return user?.user_type === 'developer';
  };
  
  // Context value
  const value = {
    user,
    loading,
    error,
    setError,
    login,
    register,
    logout,
    updateProfile,
    refreshAccessToken,
    isAdmin,
    isDeveloper
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};