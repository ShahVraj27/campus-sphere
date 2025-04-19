import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, Grid, Card, CardContent, 
  CardActions, Divider, Chip, Alert, Dialog, DialogTitle, DialogContent, 
  DialogContentText, DialogActions, InputAdornment } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Add as AddIcon, 
  Event as EventIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/event.service';
import clubService from '../services/club.service';

const Events = () => {
  const { user, isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    description: '',
    club_id: ''
  });
  
  // Fetch events and clubs data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsResponse, clubsResponse] = await Promise.all([
          eventService.getAllEvents(),
          clubService.getAllClubs(),
        ]);
        
        console.log('Events data:', eventsResponse.data);
        console.log('Clubs data:', clubsResponse.data);
        
        setEvents(eventsResponse.data);
        setClubs(clubsResponse.data);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle event creation (admin only)
  const handleCreateEvent = async () => {
    try {
      // Combine date and time into a single ISO string
      const dateTime = new Date(`${newEvent.date}T${newEvent.time}`);
      
      // Check if date is in the future
      const now = new Date();
      if (dateTime <= now) {
        setError('Event date and time must be in the future.');
        setTimeout(() => {
          setError(null);
        }, 3000);
        return;
      }
      
      const eventData = {
        name: newEvent.name,
        date_time: dateTime.toISOString(),
        location: newEvent.location,
        description: newEvent.description,
        club: newEvent.club_id
      };
      
      console.log('Sending event data:', eventData);  // Add this for debugging
      
      await eventService.createEvent(eventData);
      // Refresh events list
      const response = await eventService.getAllEvents();
      setEvents(response.data);
      
      setSuccess('Event created successfully!');
      setOpenAddDialog(false);
      setNewEvent({
        name: '',
        date: '',
        time: '',
        location: '',
        description: '',
        club_id: ''
      });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Event creation failed:', err.response?.data || err);
      setError(err.response?.data?.detail || 
              (err.response?.data?.date_time ? `Date error: ${err.response.data.date_time[0]}` : 'Failed to create event. Please try again.'));
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Format date for display
  const formatDateTime = (dateTimeStr) => {
    const dateTime = new Date(dateTimeStr);
    const options = { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return dateTime.toLocaleDateString(undefined, options);
  };
  
  // Filter events based on search term
  const filteredEvents = events.filter(event => {
    const eventName = (event.name || "").toLowerCase();
    const eventLocation = (event.location || "").toLowerCase();
    const eventDescription = (event.description || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return eventName.includes(term) || eventLocation.includes(term) || eventDescription.includes(term);
  });

  // Get club name by ID
  const getClubName = (clubId) => {
    if (!clubId) return 'Unknown Club';
    const club = clubs.find(club => club.name === clubId);
    return club ? club.name : 'Unknown Club';
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Events
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse upcoming events across campus
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            label="Search Events"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          {isAdmin() && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
            >
              Add Event
            </Button>
          )}
        </Box>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography>Loading events...</Typography>
        </Box>
      ) : filteredEvents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No events found</Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search criteria' : 'There are no upcoming events at this time'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <EventIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2">
                      {event.name}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDateTime(event.date_time)}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {event.location}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {event.description && event.description.length > 100
                      ? `${event.description.substring(0, 100)}...`
                      : event.description}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      Organized by:
                    </Typography>
                    <Chip 
                      label={getClubName(event.club)} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Add Event Dialog (Admin Only) */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please enter the details for the new event:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Event Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              margin="dense"
              id="date"
              label="Date"
              type="date"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            />
            <TextField
              margin="dense"
              id="time"
              label="Time"
              type="time"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            />
          </Box>
          <TextField
            margin="dense"
            id="location"
            label="Location"
            type="text"
            fullWidth
            variant="outlined"
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            id="club"
            label="Organizing Club"
            fullWidth
            variant="outlined"
            value={newEvent.club_id}
            onChange={(e) => setNewEvent({ ...newEvent, club_id: e.target.value })}
            sx={{ mb: 2 }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="" disabled>Select a club</option>
            {clubs.map((club) => (
              <option key={club.name} value={club.name}>
                {club.name}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateEvent} 
            color="primary"
            variant="contained"
            disabled={!newEvent.name || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.club_id}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Events;