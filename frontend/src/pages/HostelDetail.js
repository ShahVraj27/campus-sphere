import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import hostelService from '../services/hostel.service';
import userService from '../services/user.service';

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
  const [openBulkAssignDialog, setOpenBulkAssignDialog] = useState(false);
  const [openCreateRoomsDialog, setOpenCreateRoomsDialog] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [rooms, setRooms] = useState([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [roomCreationData, setRoomCreationData] = useState({
    room_count: 1,
    starting_number: 1,
  });
  const [roomCreationLoading, setRoomCreationLoading] = useState(false);
  
  // Fetch hostel data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hostelResponse, residentsResponse] = await Promise.all([
          hostelService.getHostelById(hostelId),
          hostelService.getHostelResidents(hostelId),
        ]);
    
        setHostel(hostelResponse.data);
        
        // Ensure residents data is properly formatted
        const validResidents = (residentsResponse.data || [])
          .filter(resident => resident) // Remove null/undefined entries
          .map(resident => ({
            // Ensure all required fields exist
            id_no: resident.id_no || resident.user_id || 'unknown',
            name: resident.name || 'Unknown User',
            email: resident.email || '',
            room_number: resident.room_number || 'Not specified'
          }));
        
        setResidents(validResidents);
    
        // Pre-fill edit form
        setEditedHostel({
          hostel_name: hostelResponse.data.hostel_name || '',
          location: hostelResponse.data.location || '',
          total_rooms: hostelResponse.data.total_rooms || 0,
          warden: hostelResponse.data.warden || '',
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

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await hostelService.getHostelRooms(hostelId);
        setRooms(response.data.rooms || []);
      } catch (err) {
        console.error('Error fetching rooms:', err);
      }
    };
    
    if (hostelId) {
      fetchRooms();
    }
  }, [hostelId]);

  useEffect(() => {
    if (openBulkAssignDialog && isAdmin()) {
      const fetchData = async () => {
        try {
          const usersResponse = await userService.getAllUsers();
          setAllUsers(usersResponse.data);
        } catch (err) {
          console.error("Error fetching users for assignment:", err);
          setError("Failed to load users for assignment.");
        }
      };
      
      fetchData();
    }
  }, [openBulkAssignDialog]);
  
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

  // Admin - handle bulk assignment to hostel
  const handleBulkAssign = async () => {
    if (!selectedUsers.length) {
      setError("Please select at least one student to assign.");
      return;
    }
    
    setAssignmentLoading(true);
    
    try {
      // If no rooms exist, create a default room first
      let roomId = selectedRoomId;
      
      if (!roomId && (!rooms || rooms.length === 0)) {
        // Create a default room
        const createRoomResponse = await hostelService.createRoom({
          hostel: hostelId,
          room_number: "101"
        });
        roomId = createRoomResponse.data.id;
        
        // Update the rooms list
        const roomsResponse = await hostelService.getHostelRooms(hostelId);
        setRooms(roomsResponse.data.rooms || []);
      } else if (!roomId && rooms.length > 0) {
        // Use the first available room
        roomId = rooms[0].id;
      }
      
      const userIds = selectedUsers.map(user => user.id_no);
      await hostelService.bulkAssignToHostel(hostelId, roomId, userIds);
      
      // Refresh residents list
      const residentsResponse = await hostelService.getHostelResidents(hostelId);
      setResidents(residentsResponse.data || []);
      
      setSuccess(`Successfully assigned ${selectedUsers.length} student(s) to the hostel.`);
      setOpenBulkAssignDialog(false);
      setSelectedUsers([]);
      setSelectedRoomId('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Bulk assignment failed:", err);
      setError(err.response?.data?.detail || "Failed to assign students. Please try again.");
    } finally {
      setAssignmentLoading(false);
    }
  };
  
  // Admin - handle room creation
  const handleCreateRooms = async () => {
    if (roomCreationData.room_count <= 0) {
      setError("Room count must be greater than 0");
      return;
    }
    
    setRoomCreationLoading(true);
    
    try {
      await hostelService.createHostelRooms(
        hostelId, 
        roomCreationData.room_count, 
        roomCreationData.starting_number
      );
      
      // Refresh rooms
      const roomsResponse = await hostelService.getHostelRooms(hostelId);
      setRooms(roomsResponse.data.rooms || []);
      
      setSuccess(`Successfully created ${roomCreationData.room_count} rooms.`);
      setOpenCreateRoomsDialog(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Room creation failed:", err);
      setError(err.response?.data?.detail || "Failed to create rooms. Please try again.");
    } finally {
      setRoomCreationLoading(false);
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
    <Container maxWidth="lg">
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
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
            {isAdmin() && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleIcon />}
                onClick={() => setOpenBulkAssignDialog(true)}
              >
                Assign Students
              </Button>
            )}
          </Box>
          
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
                          {resident.name ? resident.name.charAt(0).toUpperCase() : 'U'}
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

      {/* Bulk Assign Dialog (Admin Only) */}
      <Dialog
        open={openBulkAssignDialog}
        onClose={() => setOpenBulkAssignDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Assign Students to Hostel</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select students and a room to assign them to this hostel:
          </DialogContentText>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="room-select-label">Room</InputLabel>
            <Select
              labelId="room-select-label"
              id="room-select"
              value={selectedRoomId}
              label="Room"
              onChange={(e) => setSelectedRoomId(e.target.value)}
            >
              {rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  Room {room.room_number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Autocomplete
            multiple
            id="select-students"
            options={allUsers}
            getOptionLabel={(option) => `${option.name} (${option.id_no})`}
            value={selectedUsers}
            onChange={(event, newValue) => setSelectedUsers(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Select Students"
                placeholder="Search students"
                fullWidth
              />
            )}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkAssignDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleBulkAssign}
            color="primary"
            variant="contained"
            disabled={assignmentLoading || !selectedUsers.length || !selectedRoomId}
          >
            {assignmentLoading ? <CircularProgress size={24} /> : 'Assign Selected Students'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Create Rooms Dialog (Admin Only) */}
      <Dialog
        open={openCreateRoomsDialog}
        onClose={() => setOpenCreateRoomsDialog(false)}
      >
        <DialogTitle>Create Rooms</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Create multiple rooms for this hostel at once:
          </DialogContentText>
          <TextField
            margin="dense"
            id="room_count"
            label="Number of Rooms to Create"
            type="number"
            fullWidth
            variant="outlined"
            value={roomCreationData.room_count}
            onChange={(e) => setRoomCreationData({ 
              ...roomCreationData, 
              room_count: parseInt(e.target.value) || 0 
            })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="starting_number"
            label="Starting Room Number"
            type="number"
            fullWidth
            variant="outlined"
            value={roomCreationData.starting_number}
            onChange={(e) => setRoomCreationData({ 
              ...roomCreationData, 
              starting_number: parseInt(e.target.value) || 1 
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateRoomsDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateRooms} 
            color="primary"
            variant="contained"
            disabled={roomCreationLoading || roomCreationData.room_count <= 0}
          >
            {roomCreationLoading ? <CircularProgress size={24} /> : 'Create Rooms'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HostelDetail;