import api from './api';

// Friend service functions for API calls
const friendService = {
  // Get current user's friends
  getUserFriends: async () => {
    return api.get('/friends/my_friends/');
  },
  
  // Get all friendships (admin only)
  getAllFriendships: async () => {
    return api.get('/friends/');
  },
  
  // Get friendship by ID
  getFriendshipById: async (id) => {
    return api.get(`/friends/${id}/`);
  },
  
  // Create friendship (admin only)
  createFriendship: async (friendshipData) => {
    return api.post('/friends/', friendshipData);
  },
  
  // Delete friendship (admin only)
  deleteFriendship: async (id) => {
    return api.delete(`/friends/${id}/`);
  },
  
  // Get sent friend requests
  getSentFriendRequests: async () => {
    return api.get('/friend-requests/sent/');
  },
  
  // Get received friend requests
  getReceivedFriendRequests: async () => {
    return api.get('/friend-requests/received/');
  },
  
  // Get all friend requests (admin only)
  getAllFriendRequests: async () => {
    return api.get('/friend-requests/');
  },
  
  // Get friend request by ID
  getFriendRequestById: async (id) => {
    return api.get(`/friend-requests/${id}/`);
  },
  
  // Send friend request
  sendFriendRequest: async (receiverId) => {
    return api.post('/friend-requests/', { receiver_id: receiverId });
  },
  
  // Accept friend request
  acceptFriendRequest: async (id) => {
    return api.post(`/friend-requests/${id}/accept/`);
  },
  
  // Reject friend request
  rejectFriendRequest: async (id) => {
    return api.post(`/friend-requests/${id}/reject/`);
  },
  
  // Cancel friend request
  cancelFriendRequest: async (id) => {
    return api.delete(`/friend-requests/${id}/`);
  },
};

export default friendService;