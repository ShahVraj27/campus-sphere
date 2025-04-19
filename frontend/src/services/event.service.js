import api from './api';

const eventService = {
  // Get all events
  getAllEvents: async () => {
    return api.get('/events/');
  },
  
  // Get event by ID
  getEventById: async (id) => {
    return api.get(`/events/${id}/`);
  },
  
  // Create event (admin only)
  createEvent: async (eventData) => {
    return api.post('/events/', eventData);
  },
  
  // Update event (admin only)
  updateEvent: async (id, eventData) => {
    return api.put(`/events/${id}/`, eventData);
  },
  
  // Delete event (admin only)
  deleteEvent: async (id) => {
    return api.delete(`/events/${id}/`);
  },
  
  // Get events by club
  getEventsByClub: async (clubId) => {
    return api.get(`/events/?club_id=${clubId}`);
  },
};

export default eventService;