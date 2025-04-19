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
  Groups as GroupsIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import clubService from '../services/club.service';

const ClubDetail = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dialog states
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editedClub, setEditedClub] = useState({
    club_name: '',
    description: '',
    category: '',
    faculty_advisor: '',
  });
  
  // Fetch club data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clubResponse, membersResponse, myClubsResponse] = await Promise.all([
          clubService.getClubById(clubId),
          clubService.getClubMembers(clubId),
          clubService.getMyClubs(),
        ]);
        
        setClub(clubResponse.data);
        setMembers(membersResponse.data.members || []);
        
        // Check if current user is a member
        const userClubs = myClubsResponse.data.map(c => c.club_id);
        setIsMember(userClubs.includes(parseInt(clubId)));
        
        // Setup edit form with current data
        setEditedClub({
          club_name: clubResponse.data.club_name,
          description: clubResponse.data.description || '',
          category: clubResponse.data.category || '',
          faculty_advisor: clubResponse.data.faculty_advisor || '',
        });
      } catch (err) {
        console.error('Error fetching club details:', err);
        setError('Failed to load club details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [clubId]);
  
  // Handle club joining
  const handleJoin = async () => {
    try {
      await clubService.joinClub(clubId);
      setIsMember(true);
      
      // Refresh members list
      const membersResponse = await clubService.getClubMembers(clubId);
      setMembers(membersResponse.data.members || []);
      
      setSuccess('Successfully joined the club.');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Join failed:', err);
      setError(err.response?.data?.detail || 'Failed to join the club. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle club leaving
  const handleLeave = async () => {
    try {
      await clubService.leaveClub(clubId);
      setIsMember(false);
      
      // Refresh members list
      const membersResponse = await clubService.getClubMembers(clubId);
      setMembers(membersResponse.data.members || []);
      
      setSuccess('Successfully left the club.');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Leave failed:', err);
      setError(err.response?.data?.detail || 'Failed to leave the club. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle club update (admin only)
  const handleUpdateClub = async () => {
    try {
      await clubService.updateClub(clubId, editedClub);
      
      // Refresh club data
      const clubResponse = await clubService.getClubById(clubId);
      setClub(clubResponse.data);
      
      setSuccess('Club updated successfully.');
      setOpenEditDialog(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Club update failed:', err);
      setError(err.response?.data?.detail || 'Failed to update club. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle club deletion (admin only)
  const handleDeleteClub = async () => {
    try {
      await clubService.deleteClub(clubId);
      setSuccess('Club deleted successfully.');
      
      // Redirect to clubs list after deletion
      setTimeout(() => {
        navigate('/clubs');
      }, 1500);
    } catch (err) {
      console.error('Club deletion failed:', err);
      setError(err.response?.data?.detail || 'Failed to delete club. Please try again.');
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
  
  if (!club && !loading) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Club not found
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="contained"
            onClick={() => navigate('/clubs')}
            sx={{ mt: 2 }}
          >
            Back to Clubs
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
          onClick={() => navigate('/clubs')}
          sx={{ mb: 2 }}
        >
          Back to Clubs
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
                {club.club_name}
              </Typography>
              
              {club.category && (
                <Chip 
                  label={club.category} 
                  color="primary" 
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              )}
              
              <Typography variant="body1" paragraph>
                {club.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Faculty Advisor: {club.faculty_advisor}
                </Typography>
              </Box>
              
              {isMember && (
                <Chip
                  label="You are a member of this club"
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
                Members ({members.length})
              </Typography>
              
              {isMember ? (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<RemoveCircleIcon />}
                  onClick={handleLeave}
                >
                  Leave Club
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddCircleIcon />}
                  onClick={handleJoin}
                >
                  Join Club
                </Button>
              )}
            </Box>
            
            {members.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                No members in this club yet.
              </Typography>
            ) : (
              <List>
                {members.map((member) => (
                  <React.Fragment key={member.id_no}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>
                          {member.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.name}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              ID: {member.id_no}
                            </Typography>
                            {member.email && ` — ${member.email}`}
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
      
      {/* Edit Club Dialog (Admin Only) */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Club</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update the club details:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="club_name"
            label="Club Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editedClub.club_name}
            onChange={(e) => setEditedClub({ ...editedClub, club_name: e.target.value })}
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
            value={editedClub.description}
            onChange={(e) => setEditedClub({ ...editedClub, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="category"
            label="Category"
            type="text"
            fullWidth
            variant="outlined"
            value={editedClub.category}
            onChange={(e) => setEditedClub({ ...editedClub, category: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="faculty_advisor"
            label="Faculty Advisor"
            type="text"
            fullWidth
            variant="outlined"
            value={editedClub.faculty_advisor}
            onChange={(e) => setEditedClub({ ...editedClub, faculty_advisor: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateClub} 
            color="primary"
            variant="contained"
            disabled={!editedClub.club_name || !editedClub.description}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Club Dialog (Admin Only) */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Club</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this club? This action cannot be undone and will remove all memberships.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteClub} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClubDetail;