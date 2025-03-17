import api from './api';

// Event service functions for API calls
const eventService = {
  // Get all events
  getAllEvents: async (params = {}) => {
    return api.get('/events/', { params });
  },
  
  // Get events by club
  getEventsByClub: async (club) => {
    return api.get(`/events/?club=${club}`);
  },
  
  // Get events by date range
  getEventsByDateRange: async (fromDate, toDate) => {
    return api.get(`/events/?from_date=${fromDate}&to_date=${toDate}`);
  },
  
  // Get event by ID
  getEventById: async (id) => {
    return api.get(`/events/${id}/`);
  },
  
  // Get event participants
  getEventParticipants: async (id) => {
    return api.get(`/events/${id}/participants/`);
  },
  
  // Create event
  createEvent: async (eventData) => {
    return api.post('/events/', eventData);
  },
  
  // Update event
  updateEvent: async (id, eventData) => {
    return api.put(`/events/${id}/`, eventData);
  },
  
  // Delete event
  deleteEvent: async (id) => {
    return api.delete(`/events/${id}/`);
  },
  
  // Register for event
  registerForEvent: async (id) => {
    return api.post(`/events/${id}/register/`);
  },
  
  // Unregister from event
  unregisterFromEvent: async (id) => {
    return api.post(`/events/${id}/unregister/`);
  },
  
  // Get user's event participations
  getUserEvents: async () => {
    return api.get('/event-participations/my_events/');
  },
  
  // Get all event participations
  getAllEventParticipations: async () => {
    return api.get('/event-participations/');
  },
  
  // Get event participations by event
  getEventParticipationsByEvent: async (eventId) => {
    return api.get(`/event-participations/?event=${eventId}`);
  },
  
  // Get event participations by user
  getEventParticipationsByUser: async (userId) => {
    return api.get(`/event-participations/?user=${userId}`);
  },
  
  // Create event participation (admin only)
  createEventParticipation: async (participationData) => {
    return api.post('/event-participations/', participationData);
  },
  
  // Update event participation (mark as attended)
  updateEventParticipation: async (id, participationData) => {
    return api.put(`/event-participations/${id}/`, participationData);
  },
  
  // Delete event participation (admin only)
  deleteEventParticipation: async (id) => {
    return api.delete(`/event-participations/${id}/`);
  },
};

export default eventService;