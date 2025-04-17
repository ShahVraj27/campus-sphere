import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import {
  Event as EventIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/event.service';

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dialog states
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editedEvent, setEditedEvent] = useState({
    event_name: '',
    description: '',
    location: '',
    event_date: '',
    start_time: '',
    end_time: '',
    organizer: '',
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Fetch event data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventResponse, attendeesResponse, myEventsResponse] = await Promise.all([
          eventService.getEventById(eventId),
          eventService.getEventAttendees(eventId),
          eventService.getMyEvents(),
        ]);
        
        setEvent(eventResponse.data);
        setAttendees(attendeesResponse.data.attendees || []);
        
        // Check if current user is registered for this event
        const userEvents = myEventsResponse.data.map(e => e.event_id);
        setIsRegistered(userEvents.includes(parseInt(eventId)));
        
        // Setup edit form with current data
        setEditedEvent({
          event_name: eventResponse.data.event_name,
          description: eventResponse.data.description || '',
          location: eventResponse.data.location,
          event_date: eventResponse.data.event_date,
          start_time: eventResponse.data.start_time,
          end_time: eventResponse.data.end_time,
          organizer: eventResponse.data.organizer,
        });
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [eventId]);
  
  // Handle event registration
  const handleRegister = async () => {
    try {
      await eventService.registerForEvent(eventId);
      setIsRegistered(true);
      
      // Refresh attendees list
      const attendeesResponse = await eventService.getEventAttendees(eventId);
      setAttendees(attendeesResponse.data.attendees || []);
      
      setSuccess('Successfully registered for the event.');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.detail || 'Failed to register for the event. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle event unregistration
  const handleUnregister = async () => {
    try {
      await eventService.unregisterFromEvent(eventId);
      setIsRegistered(false);
      
      // Refresh attendees list
      const attendeesResponse = await eventService.getEventAttendees(eventId);
      setAttendees(attendeesResponse.data.attendees || []);
      
      setSuccess('Successfully unregistered from the event.');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Unregistration failed:', err);
      setError(err.response?.data?.detail || 'Failed to unregister from the event. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle event update (admin only)
  const handleUpdateEvent = async () => {
    try {
      await eventService.updateEvent(eventId, editedEvent);
      
      // Refresh event data
      const eventResponse = await eventService.getEventById(eventId);
      setEvent(eventResponse.data);
      
      setSuccess('Event updated successfully.');
      setOpenEditDialog(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Event update failed:', err);
      setError(err.response?.data?.detail || 'Failed to update event. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle event deletion (admin only)
  const handleDeleteEvent = async () => {
    try {
      await eventService.deleteEvent(eventId);
      setSuccess('Event deleted successfully.');
      
      // Redirect to events list after deletion
      setTimeout(() => {
        navigate('/events');
      }, 1500);
    } catch (err) {
      console.error('Event deletion failed:', err);
      setError(err.response?.data?.detail || 'Failed to delete event. Please try again.');
      setOpenDeleteDialog(false);
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!event && !loading) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Event not found
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="contained"
            onClick={() => navigate('/events')}
            sx={{ mt: 2 }}
          >
            Back to Events
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/events')}
          sx={{ mb: 2 }}
        >
          Back to Events
        </Button>
        
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
        
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {event.event_name}
              </Typography>
              
              <Typography variant="body1" paragraph>
                {event.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <CalendarIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {formatDate(event.event_date)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TimeIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {event.start_time} - {event.end_time}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <LocationIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {event.location}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Organizer: {event.organizer}
                </Typography>
              </Box>
              
              {isRegistered && (
                <Chip
                  label="You are registered for this event"
                  color="success"
                  variant="outlined"
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
            
            <Box>
              {isAdmin() && (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => setOpenEditDialog(true)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setOpenDeleteDialog(true)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Attendees ({attendees.length})
              </Typography>
              
              {isRegistered ? (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<RemoveCircleIcon />}
                  onClick={handleUnregister}
                >
                  Unregister
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddCircleIcon />}
                  onClick={handleRegister}
                >
                  Register
                </Button>
              )}
            </Box>
            
            {attendees.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                No attendees registered for this event yet.
              </Typography>
            ) : (
              <List>
                {attendees.map((attendee) => (
                  <React.Fragment key={attendee.id_no}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>
                          {attendee.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={attendee.name}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              ID: {attendee.id_no}
                            </Typography>
                            {attendee.email && ` — ${attendee.email}`}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </Paper>
      </Box>
      
      {/* Edit Event Dialog (Admin Only) */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update the event details:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="event_name"
            label="Event Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editedEvent.event_name}
            onChange={(e) => setEditedEvent({ ...editedEvent, event_name: e.target.value })}
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
            value={editedEvent.description}
            onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="location"
            label="Location"
            type="text"
            fullWidth
            variant="outlined"
            value={editedEvent.location}
            onChange={(e) => setEditedEvent({ ...editedEvent, location: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="event_date"
            label="Event Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={editedEvent.event_date}
            onChange={(e) => setEditedEvent({ ...editedEvent, event_date: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="start_time"
                label="Start Time"
                type="time"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={editedEvent.start_time}
                onChange={(e) => setEditedEvent({ ...editedEvent, start_time: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="end_time"
                label="End Time"
                type="time"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={editedEvent.end_time}
                onChange={(e) => setEditedEvent({ ...editedEvent, end_time: e.target.value })}
              />
            </Grid>
          </Grid>
          <TextField
            margin="dense"
            id="organizer"
            label="Organizer"
            type="text"
            fullWidth
            variant="outlined"
            value={editedEvent.organizer}
            onChange={(e) => setEditedEvent({ ...editedEvent, organizer: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateEvent} 
            color="primary"
            variant="contained"
            disabled={
              !editedEvent.event_name || 
              !editedEvent.location || 
              !editedEvent.event_date || 
              !editedEvent.start_time || 
              !editedEvent.end_time
            }
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Event Dialog (Admin Only) */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event? This action cannot be undone and will remove all registrations.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteEvent} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventDetail;