import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Tab,
  Tabs,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import friendService from '../services/friend.service';

const Friends = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  
  // Fetch friends data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [friendsResponse, requestsResponse] = await Promise.all([
          friendService.getFriends(),
          friendService.getFriendRequests(),
        ]);
        
        setFriends(friendsResponse.data);
        setRequests(requestsResponse.data);
      } catch (err) {
        console.error('Error fetching friends data:', err);
        setError('Failed to load friends data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle search submission
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearching(true);
    try {
      const response = await friendService.searchUsers(searchTerm);
      setSearchResults(response.data.filter(user => 
        // Filter out current user and existing friends
        user.id_no !== user.id_no && 
        !friends.some(friend => friend.id_no === user.id_no) &&
        !requests.some(req => req.sender.id_no === user.id_no || req.receiver.id_no === user.id_no)
      ));
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to search for users. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setSearching(false);
    }
  };
  
  // Handle friend request
  const handleSendRequest = async (userId) => {
    try {
      await friendService.sendFriendRequest(userId);
      
      // Update search results to reflect the sent request
      setSearchResults(searchResults.filter(user => user.id_no !== userId));
      
      setSuccess('Friend request sent successfully.');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to send friend request:', err);
      setError(err.response?.data?.detail || 'Failed to send friend request. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle accepting friend request
  const handleAcceptRequest = async (requestId) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      
      // Refresh both friends and requests lists
      const [friendsResponse, requestsResponse] = await Promise.all([
        friendService.getFriends(),
        friendService.getFriendRequests(),
      ]);
      
      setFriends(friendsResponse.data);
      setRequests(requestsResponse.data);
      
      setSuccess('Friend request accepted.');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to accept friend request:', err);
      setError(err.response?.data?.detail || 'Failed to accept friend request. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle rejecting friend request
  const handleRejectRequest = async (requestId) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      
      // Refresh requests list
      const requestsResponse = await friendService.getFriendRequests();
      setRequests(requestsResponse.data);
      
      setSuccess('Friend request rejected.');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to reject friend request:', err);
      setError(err.response?.data?.detail || 'Failed to reject friend request. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle removing friend
  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;
    
    try {
      await friendService.removeFriend(friendToRemove.id_no);
      
      // Refresh friends list
      const friendsResponse = await friendService.getFriends();
      setFriends(friendsResponse.data);
      
      setSuccess('Friend removed successfully.');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to remove friend:', err);
      setError(err.response?.data?.detail || 'Failed to remove friend. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setOpenConfirmDialog(false);
      setFriendToRemove(null);
    }
  };
  
  // Open confirm dialog for friend removal
  const openRemoveConfirmation = (friend) => {
    setFriendToRemove(friend);
    setOpenConfirmDialog(true);
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Friends
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect with your campus community
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="friends tabs"
          >
            <Tab label={`My Friends (${friends.length})`} id="tab-0" />
            <Tab label={`Friend Requests (${requests.length})`} id="tab-1" />
            <Tab label="Find Friends" id="tab-2" />
          </Tabs>
        </Box>
        
        {/* My Friends Tab */}
        <Box role="tabpanel" hidden={tabValue !== 0} id="tabpanel-0" sx={{ py: 2 }}>
          {friends.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              You don't have any friends yet. Find friends in the "Find Friends" tab.
            </Typography>
          ) : (
            <List>
              {friends.map((friend) => (
                <React.Fragment key={friend.id_no}>
                  <ListItem
                    secondaryAction={
                      <Button
                        edge="end"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => openRemoveConfirmation(friend)}
                      >
                        Remove
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {friend.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={friend.name}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            ID: {friend.id_no}
                          </Typography>
                          {friend.email && ` — ${friend.email}`}
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
        
        {/* Friend Requests Tab */}
        <Box role="tabpanel" hidden={tabValue !== 1} id="tabpanel-1" sx={{ py: 2 }}>
          {requests.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              You don't have any pending friend requests.
            </Typography>
          ) : (
            <List>
              {requests.map((request) => {
                const isSender = request.sender.id_no === user.id_no;
                const otherUser = isSender ? request.receiver : request.sender;
                
                return (
                  <React.Fragment key={request.request_id}>
                    <ListItem
                      secondaryAction={
                        isSender ? (
                          <Typography variant="body2" color="text.secondary">
                            Pending
                          </Typography>
                        ) : (
                          <>
                            <Button
                              edge="end"
                              color="success"
                              startIcon={<CheckIcon />}
                              onClick={() => handleAcceptRequest(request.request_id)}
                              sx={{ mr: 1 }}
                            >
                              Accept
                            </Button>
                            <Button
                              edge="end"
                              color="error"
                              startIcon={<CloseIcon />}
                              onClick={() => handleRejectRequest(request.request_id)}
                            >
                              Reject
                            </Button>
                          </>
                        )
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          {otherUser.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={otherUser.name}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              ID: {otherUser.id_no}
                            </Typography>
                            {otherUser.email && ` — ${otherUser.email}`}
                            <br />
                            {isSender ? "You sent a friend request" : "Sent you a friend request"}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Box>
        
        {/* Find Friends Tab */}
        <Box role="tabpanel" hidden={tabValue !== 2} id="tabpanel-2" sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', mb: 3 }}>
            <TextField
              fullWidth
              label="Search for users"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={!searchTerm.trim() || searching}
              sx={{ ml: 1 }}
            >
              {searching ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Box>
          
          {searchResults.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              {searchTerm.trim() 
                ? "No users found matching your search criteria." 
                : "Search for users by name or ID to send friend requests."}
            </Typography>
          ) : (
            <List>
              {searchResults.map((user) => (
                <React.Fragment key={user.id_no}>
                  <ListItem
                    secondaryAction={
                      <Button
                        edge="end"
                        color="primary"
                        startIcon={<PersonAddIcon />}
                        onClick={() => handleSendRequest(user.id_no)}
                      >
                        Add Friend
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            ID: {user.id_no}
                          </Typography>
                          {user.email && ` — ${user.email}`}
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
      
      {/* Confirm Friend Removal Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Remove Friend</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {friendToRemove?.name} from your friends list?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRemoveFriend} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Friends;