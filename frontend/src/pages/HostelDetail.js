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
  Home as HomeIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import hostelService from '../services/hostel.service';

const HostelDetail = () => {
  const { hostelId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [hostel, setHostel] = useState(null);
  const [residents, setResidents] = useState([]);
  const [isAssigned, setIsAssigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dialog states
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editedHostel, setEditedHostel] = useState({
    hostel_name: '',
    location: '',
    total_rooms: 0,
    warden: '',
  });
  
  // Fetch hostel data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hostelResponse, residentsResponse, myHostelResponse] = await Promise.all([
          hostelService.getHostelById(hostelId),
          hostelService.getHostelResidents(hostelId),
          hostelService.getMyHostel(),
        ]);
        
        setHostel(hostelResponse.data);
        setResidents(residentsResponse.data.residents || []);
        
        // Check if current user is assigned to this hostel
        setIsAssigned(
          myHostelResponse.data && 
          myHostelResponse.data.hostel_id === parseInt(hostelId)
        );
        
        // Setup edit form with current data
        setEditedHostel({
          hostel_name: hostelResponse.data.hostel_name,
          location: hostelResponse.data.location,
          total_rooms: hostelResponse.data.total_rooms,
          warden: hostelResponse.data.warden,
        });
      } catch (err) {
        console.error('Error fetching hostel details:', err);
        setError('Failed to load hostel details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [hostelId]);
  
  // Handle hostel assignment
  const handleAssign = async () => {
    try {
      await hostelService.assignHostel(hostelId);
      setIsAssigned(true);
      
      // Refresh residents list
      const residentsResponse = await hostelService.getHostelResidents(hostelId);
      setResidents(residentsResponse.data.residents || []);
      
      setSuccess('Successfully assigned to the hostel.');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Assignment failed:', err);
      setError(err.response?.data?.detail || 'Failed to assign to the hostel. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle hostel unassignment
  const handleUnassign = async () => {
    try {
      await hostelService.unassignHostel();
      setIsAssigned(false);
      
      // Refresh residents list
      const residentsResponse = await hostelService.getHostelResidents(hostelId);
      setResidents(residentsResponse.data.residents || []);
      
      setSuccess('Successfully unassigned from the hostel.');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Unassignment failed:', err);
      setError(err.response?.data?.detail || 'Failed to unassign from the hostel. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle hostel update (admin only)
  const handleUpdateHostel = async () => {
    try {
      await hostelService.updateHostel(hostelId, editedHostel);
      
      // Refresh hostel data
      const hostelResponse = await hostelService.getHostelById(hostelId);
      setHostel(hostelResponse.data);
      
      setSuccess('Hostel updated successfully.');
      setOpenEditDialog(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Hostel update failed:', err);
      setError(err.response?.data?.detail || 'Failed to update hostel. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle hostel deletion (admin only)
  const handleDeleteHostel = async () => {
    try {
      await hostelService.deleteHostel(hostelId);
      setSuccess('Hostel deleted successfully.');
      
      // Redirect to hostels list after deletion
      setTimeout(() => {
        navigate('/hostels');
      }, 1500);
    } catch (err) {
      console.error('Hostel deletion failed:', err);
      setError(err.response?.data?.detail || 'Failed to delete hostel. Please try again.');
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
  
  if (!hostel && !loading) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Hostel not found
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="contained"
            onClick={() => navigate('/hostels')}
            sx={{ mt: 2 }}
          >
            Back to Hostels
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
          onClick={() => navigate('/hostels')}
          sx={{ mb: 2 }}
        >
          Back to Hostels
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
                {hostel.hostel_name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <HomeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Location: {hostel.location}
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mt: 1 }}>
                Warden: {hostel.warden}
              </Typography>
              
              <Typography variant="body1" sx={{ mt: 1 }}>
                Total Rooms: {hostel.total_rooms}
              </Typography>
              
              {isAssigned && (
                <Chip
                  label="You are assigned to this hostel"
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
                Residents ({residents.length})
              </Typography>
              
              {isAssigned ? (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<RemoveCircleIcon />}
                  onClick={handleUnassign}
                >
                  Leave Hostel
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddCircleIcon />}
                  onClick={handleAssign}
                >
                  Assign Me
                </Button>
              )}
            </Box>
            
            {residents.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                No residents assigned to this hostel yet.
              </Typography>
            ) : (
              <List>
                {residents.map((resident) => (
                  <React.Fragment key={resident.id_no}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>
                          {resident.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={resident.name}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              ID: {resident.id_no}
                            </Typography>
                            {resident.email && ` — ${resident.email}`}
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
      
      {/* Edit Hostel Dialog (Admin Only) */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Hostel</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update the hostel details:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="hostel_name"
            label="Hostel Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editedHostel.hostel_name}
            onChange={(e) => setEditedHostel({ ...editedHostel, hostel_name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="location"
            label="Location"
            type="text"
            fullWidth
            variant="outlined"
            value={editedHostel.location}
            onChange={(e) => setEditedHostel({ ...editedHostel, location: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="total_rooms"
            label="Total Rooms"
            type="number"
            fullWidth
            variant="outlined"
            value={editedHostel.total_rooms}
            onChange={(e) => setEditedHostel({ ...editedHostel, total_rooms: parseInt(e.target.value) || 0 })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="warden"
            label="Warden"
            type="text"
            fullWidth
            variant="outlined"
            value={editedHostel.warden}
            onChange={(e) => setEditedHostel({ ...editedHostel, warden: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateHostel} 
            color="primary"
            variant="contained"
            disabled={
              !editedHostel.hostel_name || 
              !editedHostel.location || 
              editedHostel.total_rooms <= 0 ||
              !editedHostel.warden
            }
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Hostel Dialog (Admin Only) */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Hostel</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this hostel? This action cannot be undone and will remove all resident assignments.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteHostel} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HostelDetail;