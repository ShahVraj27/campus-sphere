import api from './api';

// Hostel service functions for API calls
const hostelService = {
  // Get all hostels
  getAllHostels: async () => {
    return api.get('/hostels/');
  },
  
  // Get current user's hostel
  getMyHostel: async () => {
    return api.get('/hostels/my_hostel/');
  },

  // Get hostel by ID
  getHostelById: async (id) => {
    return api.get(`/hostels/${id}/`);
  },
  
  // Get hostel rooms
  getHostelRooms: async (id) => {
    try {
      const response = await api.get(`/hostels/${id}/rooms/`);
      // Ensure we always return an array of rooms, even if empty
      return {
        data: {
          rooms: response.data.rooms || []
        }
      };
    } catch (error) {
      console.error("Error fetching hostel rooms:", error);
      // Return an empty rooms array on error
      return {
        data: {
          rooms: []
        }
      };
    }
  },

  // Get hostel residents
  getHostelResidents: async (id) => {
    return api.get(`/hostels/${id}/residents/`);
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
  
  // Assign current user to a hostel
  assignHostel: async (id) => {
    return api.post(`/hostels/${id}/assign/`);
  },
  
  // Unassign current user from hostel
  unassignHostel: async () => {
    return api.post('/hostels/unassign/');
  },
  
  // Bulk assign students to a hostel room (admin only)
  bulkAssignToHostel: async (hostelId, roomId, userIds) => {
    return api.post(`/hostels/${hostelId}/bulk_assign/`, {
      room_id: roomId,
      user_ids: userIds
    });
  },
  
  // Create multiple rooms for a hostel (admin only)
  createHostelRooms: async (hostelId, roomCount, startingNumber) => {
    return api.post(`/hostels/${hostelId}/create_rooms/`, {
      room_count: roomCount,
      starting_number: startingNumber
    });
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