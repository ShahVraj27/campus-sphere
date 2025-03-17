import api from './api';

// Hostel service functions for API calls
const hostelService = {
  // Get all hostels
  getAllHostels: async () => {
    return api.get('/hostels/');
  },
  
  // Get hostel by ID
  getHostelById: async (id) => {
    return api.get(`/hostels/${id}/`);
  },
  
  // Get hostel rooms
  getHostelRooms: async (id) => {
    return api.get(`/hostels/${id}/rooms/`);
  },
  
  // Create hostel (admin only)
  createHostel: async (hostelData) => {
    return api.post('/hostels/', hostelData);
  },
  
  // Update hostel (admin only)
  updateHostel: async (id, hostelData) => {
    return api.put(`/hostels/${id}/`, hostelData);
  },
  
  // Delete hostel (admin only)
  deleteHostel: async (id) => {
    return api.delete(`/hostels/${id}/`);
  },
  
  // Get all rooms
  getAllRooms: async () => {
    return api.get('/rooms/');
  },
  
  // Get rooms by hostel
  getRoomsByHostel: async (hostelId) => {
    return api.get(`/rooms/?hostel=${hostelId}`);
  },
  
  // Get room by ID
  getRoomById: async (id) => {
    return api.get(`/rooms/${id}/`);
  },
  
  // Get room occupants
  getRoomOccupants: async (id) => {
    return api.get(`/rooms/${id}/occupants/`);
  },
  
  // Create room (admin only)
  createRoom: async (roomData) => {
    return api.post('/rooms/', roomData);
  },
  
  // Update room (admin only)
  updateRoom: async (id, roomData) => {
    return api.put(`/rooms/${id}/`, roomData);
  },
  
  // Delete room (admin only)
  deleteRoom: async (id) => {
    return api.delete(`/rooms/${id}/`);
  },
  
  // Get current user's occupancy
  getCurrentUserOccupancy: async () => {
    return api.get('/occupancies/');
  },
  
  // Get all occupancies (admin only)
  getAllOccupancies: async () => {
    return api.get('/occupancies/');
  },
  
  // Create occupancy (admin only)
  createOccupancy: async (occupancyData) => {
    return api.post('/occupancies/', occupancyData);
  },
  
  // Update occupancy (admin only)
  updateOccupancy: async (id, occupancyData) => {
    return api.put(`/occupancies/${id}/`, occupancyData);
  },
  
  // Delete occupancy (admin only)
  deleteOccupancy: async (id) => {
    return api.delete(`/occupancies/${id}/`);
  },
};

export default hostelService;