import api from './api';

// Club service functions for API calls
const clubService = {
  // Get all clubs
  getAllClubs: async () => {
    return api.get('/clubs/');
  },
  
  // Get club by name
  getClubByName: async (name) => {
    return api.get(`/clubs/${name}/`);
  },
  
  // Get club members
  getClubMembers: async (name) => {
    return api.get(`/clubs/${name}/members/`);
  },
  
  // Create club (admin only)
  createClub: async (clubData) => {
    return api.post('/clubs/', clubData);
  },
  
  // Update club
  updateClub: async (name, clubData) => {
    return api.put(`/clubs/${name}/`, clubData);
  },
  
  // Delete club (admin only)
  deleteClub: async (name) => {
    return api.delete(`/clubs/${name}/`);
  },
  
  // Join a club
  joinClub: async (name) => {
    return api.post(`/clubs/${name}/join/`);
  },
  
  // Leave a club
  leaveClub: async (name) => {
    return api.post(`/clubs/${name}/leave/`);
  },
  
  // Get user's club memberships
  getUserClubs: async () => {
    return api.get('/club-memberships/my_clubs/');
  },
  
  // Get all club memberships
  getAllClubMemberships: async () => {
    return api.get('/club-memberships/');
  },
  
  // Get club memberships by club
  getClubMembershipsByClub: async (club) => {
    return api.get(`/club-memberships/?club=${club}`);
  },
  
  // Get club memberships by user
  getClubMembershipsByUser: async (userId) => {
    return api.get(`/club-memberships/?user=${userId}`);
  },
  
  // Create club membership (admin only)
  createClubMembership: async (membershipData) => {
    return api.post('/club-memberships/', membershipData);
  },
  
  // Update club membership (admin or club leader)
  updateClubMembership: async (id, membershipData) => {
    return api.put(`/club-memberships/${id}/`, membershipData);
  },
  
  // Delete club membership (admin only)
  deleteClubMembership: async (id) => {
    return api.delete(`/club-memberships/${id}/`);
  },
};

export default clubService;