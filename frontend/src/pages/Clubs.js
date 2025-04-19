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
  Groups as GroupsIcon,
  Add as AddIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import clubService from '../services/club.service';

const Clubs = () => {
  const { user, isAdmin } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newClub, setNewClub] = useState({
    club_name: '',
    description: '',
    category: '',
    faculty_advisor: '',
  });
  
  // Fetch clubs data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allClubsResponse, myClubsResponse] = await Promise.all([
          clubService.getAllClubs(),
          clubService.getMyClubs(),
        ]);
        
        setClubs(allClubsResponse.data);
        
        // Extract IDs of joined clubs
        const joinedClubIds = myClubsResponse.data.map(club => club.club_id);
        setJoinedClubs(joinedClubIds);
      } catch (err) {
        console.error('Error fetching clubs:', err);
        setError('Failed to load clubs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle club joining
  const handleJoin = async (clubId) => {
    try {
      await clubService.joinClub(clubId);
      setJoinedClubs([...joinedClubs, clubId]);
      setSuccess(`Successfully joined the club.`);
      
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
  const handleLeave = async (clubId) => {
    try {
      await clubService.leaveClub(clubId);
      setJoinedClubs(joinedClubs.filter(id => id !== clubId));
      setSuccess(`Successfully left the club.`);
      
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
  
  // Handle club creation (admin only)
  const handleCreateClub = async () => {
    try {
      await clubService.createClub(newClub);
      // Refresh club list
      const response = await clubService.getAllClubs();
      setClubs(response.data);
      
      setSuccess('Club created successfully!');
      setOpenAddDialog(false);
      setNewClub({ club_name: '', description: '', category: '', faculty_advisor: '' });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Club creation failed:', err);
      setError(err.response?.data?.detail || 'Failed to create club. Please try again.');
      
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
  
  // Filter clubs based on search term
  const filteredClubs = clubs.filter(club => 
    club.club_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (club.category && club.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Check if user is a member of a club
  const isMember = (clubId) => {
    return joinedClubs.includes(clubId);
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
          Clubs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Join and explore campus clubs and organizations
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
            label="Search Clubs"
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
              Add Club
            </Button>
          )}
        </Box>
      </Paper>
      
      {filteredClubs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No clubs found</Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredClubs.map((club) => (
            <Grid item xs={12} sm={6} md={4} key={club.club_id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <GroupsIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2">
                      {club.club_name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {club.description && club.description.length > 100
                      ? `${club.description.substring(0, 100)}...`
                      : club.description}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      Category:
                    </Typography>
                    <Chip 
                      label={club.category || 'General'} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" mt={1}>
                    Faculty Advisor: {club.faculty_advisor}
                  </Typography>
                  
                  {isMember(club.club_id) && (
                    <Chip
                      label="Member"
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
                    to={`/clubs/${club.club_id}`}
                  >
                    View Details
                  </Button>
                  
                  {isMember(club.club_id) ? (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<RemoveCircleIcon />}
                      onClick={() => handleLeave(club.club_id)}
                      sx={{ ml: 'auto' }}
                    >
                      Leave
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<AddCircleIcon />}
                      onClick={() => handleJoin(club.club_id)}
                      sx={{ ml: 'auto' }}
                    >
                      Join
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Add Club Dialog (Admin Only) */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Club</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please enter the details for the new club:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="club_name"
            label="Club Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newClub.club_name}
            onChange={(e) => setNewClub({ ...newClub, club_name: e.target.value })}
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
            value={newClub.description}
            onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="category"
            label="Category"
            type="text"
            fullWidth
            variant="outlined"
            value={newClub.category}
            onChange={(e) => setNewClub({ ...newClub, category: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="faculty_advisor"
            label="Faculty Advisor"
            type="text"
            fullWidth
            variant="outlined"
            value={newClub.faculty_advisor}
            onChange={(e) => setNewClub({ ...newClub, faculty_advisor: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateClub} 
            color="primary"
            variant="contained"
            disabled={!newClub.club_name || !newClub.description}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Clubs;