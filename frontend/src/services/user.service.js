import api from './api';

// User service functions for API calls
const userService = {
  // Get current user profile
  getCurrentUser: async () => {
    return api.get('/users/me/');
  },
  
  // Update current user profile
  updateProfile: async (userData) => {
    return api.put('/users/update_me/', userData);
  },
  
  // Get all users (admin only)
  getAllUsers: async () => {
    return api.get('/users/');
  },
  
  // Get user by ID
  getUserById: async (id) => {
    return api.get(`/users/${id}/`);
  },
  
  // Create user (admin only)
  createUser: async (userData) => {
    return api.post('/users/', userData);
  },
  
  // Update user (admin only)
  updateUser: async (id, userData) => {
    return api.put(`/users/${id}/`, userData);
  },
  
  // Delete user (admin only)
  deleteUser: async (id) => {
    return api.delete(`/users/${id}/`);
  },
};

export default userService;