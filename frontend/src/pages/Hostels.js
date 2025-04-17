import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Box,
  Chip,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Search as SearchIcon,
  Home as HomeIcon,
  Add as AddIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import hostelService from '../services/hostel.service';

const Hostels = () => {
  const { user, isAdmin } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [assignedHostel, setAssignedHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newHostel, setNewHostel] = useState({
    hostel_name: '',
    location: '',
    total_rooms: 0,
    warden: '',
  });
  
  // Fetch hostels data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allHostelsResponse, myHostelResponse] = await Promise.all([
          hostelService.getAllHostels(),
          hostelService.getMyHostel(),
        ]);
        
        setHostels(allHostelsResponse.data);
        
        if (myHostelResponse.data && myHostelResponse.data.hostel_id) {
          setAssignedHostel(myHostelResponse.data.hostel_id);
        }
      } catch (err) {
        console.error('Error fetching hostels:', err);
        setError('Failed to load hostels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle hostel assignment
  const handleAssign = async (hostelId) => {
    try {
      await hostelService.assignHostel(hostelId);
      setAssignedHostel(hostelId);
      setSuccess(`Successfully assigned to hostel.`);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Hostel assignment failed:', err);
      setError(err.response?.data?.detail || 'Failed to assign hostel. Please try again.');
      
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
      setAssignedHostel(null);
      setSuccess(`Successfully unassigned from hostel.`);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Hostel unassignment failed:', err);
      setError(err.response?.data?.detail || 'Failed to unassign hostel. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle hostel creation (admin only)
  const handleCreateHostel = async () => {
    try {
      await hostelService.createHostel(newHostel);
      // Refresh hostel list
      const response = await hostelService.getAllHostels();
      setHostels(response.data);
      
      setSuccess('Hostel created successfully!');
      setOpenAddDialog(false);
      setNewHostel({ hostel_name: '', location: '', total_rooms: 0, warden: '' });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Hostel creation failed:', err);
      setError(err.response?.data?.detail || 'Failed to create hostel. Please try again.');
      
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
  
  // Filter hostels based on search term
  const filteredHostels = hostels.filter(hostel => 
    hostel.hostel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hostel.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Check if user is assigned to a hostel
  const isAssigned = (hostelId) => {
    return assignedHostel === hostelId;
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Hostels
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and manage your hostel assignments
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
            label="Search Hostels"
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
              Add Hostel
            </Button>
          )}
        </Box>
      </Paper>
      
      {filteredHostels.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No hostels found</Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredHostels.map((hostel) => (
            <Grid item xs={12} sm={6} md={4} key={hostel.hostel_id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <HomeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2">
                      {hostel.hostel_name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" gutterBottom>
                    Location: {hostel.location}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      Rooms:
                    </Typography>
                    <Chip 
                      label={hostel.total_rooms} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" mt={1}>
                    Warden: {hostel.warden}
                  </Typography>
                  
                  {isAssigned(hostel.hostel_id) && (
                    <Chip
                      label="Your Hostel"
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to={`/hostels/${hostel.hostel_id}`}
                  >
                    View Details
                  </Button>
                  
                  {isAssigned(hostel.hostel_id) ? (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<RemoveCircleIcon />}
                      onClick={handleUnassign}
                      sx={{ ml: 'auto' }}
                    >
                      Leave Hostel
                    </Button>
                  ) : (
                    assignedHostel ? (
                      <Button
                        size="small"
                        color="primary"
                        disabled
                        sx={{ ml: 'auto' }}
                      >
                        Already Assigned
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        color="primary"
                        startIcon={<AddCircleIcon />}
                        onClick={() => handleAssign(hostel.hostel_id)}
                        sx={{ ml: 'auto' }}
                      >
                        Assign Me
                      </Button>
                    )
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Add Hostel Dialog (Admin Only) */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Hostel</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please enter the details for the new hostel:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="hostel_name"
            label="Hostel Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newHostel.hostel_name}
            onChange={(e) => setNewHostel({ ...newHostel, hostel_name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="location"
            label="Location"
            type="text"
            fullWidth
            variant="outlined"
            value={newHostel.location}
            onChange={(e) => setNewHostel({ ...newHostel, location: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="total_rooms"
            label="Total Rooms"
            type="number"
            fullWidth
            variant="outlined"
            value={newHostel.total_rooms}
            onChange={(e) => setNewHostel({ ...newHostel, total_rooms: parseInt(e.target.value) || 0 })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="warden"
            label="Warden Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newHostel.warden}
            onChange={(e) => setNewHostel({ ...newHostel, warden: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateHostel} 
            color="primary"
            variant="contained"
            disabled={!newHostel.hostel_name || !newHostel.location || newHostel.total_rooms <= 0}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Hostels;