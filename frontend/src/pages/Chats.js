import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chat.service';
import friendService from '../services/friend.service';

const Chats = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Polling interval for new messages (in milliseconds)
  const POLLING_INTERVAL = 5000;
  
  // Setup polling for new messages
  useEffect(() => {
    let interval;
    
    if (selectedChat) {
      // Initial fetch
      fetchMessages(selectedChat.chat_id);
      
      // Set up polling
      interval = setInterval(() => {
        fetchMessages(selectedChat.chat_id, true);
      }, POLLING_INTERVAL);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedChat]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Fetch initial data: friends and conversations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [friendsResponse, conversationsResponse] = await Promise.all([
          friendService.getFriends(),
          chatService.getConversations(),
        ]);
        
        setFriends(friendsResponse.data);
        setConversations(conversationsResponse.data);
        
        // Auto-select first conversation if available
        if (conversationsResponse.data.length > 0) {
          setSelectedChat(conversationsResponse.data[0]);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load chat data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Fetch messages for a chat
  const fetchMessages = async (chatId, silent = false) => {
    if (!silent) setMessageLoading(true);
    
    try {
      const response = await chatService.getMessages(chatId);
      setMessages(response.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (!silent) {
        setError('Failed to load messages. Please try again.');
        
        // Reset error message after 3 seconds
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    } finally {
      if (!silent) setMessageLoading(false);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedChat) return;
    
    try {
      await chatService.sendMessage(selectedChat.chat_id, { content: message });
      
      // Refresh messages
      await fetchMessages(selectedChat.chat_id);
      
      // Clear input
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Start a new conversation
  const startConversation = async (friendId) => {
    try {
      const response = await chatService.createConversation(friendId);
      
      // Refresh conversations list
      const conversationsResponse = await chatService.getConversations();
      setConversations(conversationsResponse.data);
      
      // Select the new conversation
      const newChat = conversationsResponse.data.find(
        chat => chat.chat_id === response.data.chat_id
      );
      if (newChat) setSelectedChat(newChat);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle menu open/close
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle deleting a conversation
  const handleDeleteConversation = async () => {
    if (!selectedChat) return;
    
    try {
      await chatService.deleteConversation(selectedChat.chat_id);
      
      // Refresh conversations list
      const conversationsResponse = await chatService.getConversations();
      setConversations(conversationsResponse.data);
      
      // Clear selected chat and messages
      setSelectedChat(null);
      setMessages([]);
      
      handleMenuClose();
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Find friends who don't have a conversation yet
  const getFriendsWithoutConversation = () => {
    return friends.filter(friend => 
      !conversations.some(conv => 
        conv.participants.some(p => p.id_no === friend.id_no)
      )
    );
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
          Chats
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect with your friends through messaging
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
        <Grid container>
          {/* Conversations List Sidebar */}
          <Grid item xs={12} md={4} sx={{ borderRight: '1px solid #e0e0e0' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
              <Typography variant="h6">Conversations</Typography>
            </Box>
            
            {conversations.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No conversations yet.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start a conversation with a friend from the list below.
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {conversations.map((chat) => {
                  // Find the other participant (not the current user)
                  const otherParticipant = chat.participants.find(
                    p => p.id_no !== user.id_no
                  );
                  
                  return (
                    <ListItem
                      key={chat.chat_id}
                      button
                      onClick={() => setSelectedChat(chat)}
                      selected={selectedChat?.chat_id === chat.chat_id}
                      sx={{
                        backgroundColor: selectedChat?.chat_id === chat.chat_id 
                          ? 'rgba(0, 0, 0, 0.04)' 
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          {otherParticipant.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={otherParticipant.name} 
                        secondary={
                          chat.last_message 
                            ? `${chat.last_message.content.substring(0, 30)}${chat.last_message.content.length > 30 ? '...' : ''}` 
                            : 'No messages yet'
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
            
            {/* Friends without conversations */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
              <Typography variant="subtitle1" gutterBottom>
                Start a new conversation
              </Typography>
              
              {getFriendsWithoutConversation().length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  You have conversations with all your friends.
                </Typography>
              ) : (
                <List dense>
                  {getFriendsWithoutConversation().map((friend) => (
                    <ListItem
                      key={friend.id_no}
                      button
                      onClick={() => startConversation(friend.id_no)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {friend.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={friend.name} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Grid>
          
          {/* Chat window */}
          <Grid item xs={12} md={8}>
            {selectedChat ? (
              <>
                {/* Chat header */}
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid #e0e0e0', 
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 1 }}>
                      {selectedChat.participants.find(p => p.id_no !== user.id_no).name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6">
                      {selectedChat.participants.find(p => p.id_no !== user.id_no).name}
                    </Typography>
                  </Box>
                  
                  <IconButton onClick={handleMenuClick}>
                    <MoreVertIcon />
                  </IconButton>
                  
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={handleDeleteConversation}>
                      <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                      Delete Conversation
                    </MenuItem>
                  </Menu>
                </Box>
                
                {/* Messages area */}
                <Box sx={{ 
                  p: 2, 
                  height: 'calc(70vh - 128px)', 
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {messageLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
                      <CircularProgress />
                    </Box>
                  ) : messages.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
                      <Typography variant="body1" color="text.secondary">
                        No messages yet. Start the conversation!
                      </Typography>
                    </Box>
                  ) : (
                    messages.map((msg, index) => {
                      const isCurrentUser = msg.sender.id_no === user.id_no;
                      
                      return (
                        <Box
                          key={msg.message_id}
                          sx={{
                            display: 'flex',
                            justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                            mb: 1,
                          }}
                        >
                          <Box
                            sx={{
                              backgroundColor: isCurrentUser ? '#1976d2' : '#f1f1f1',
                              color: isCurrentUser ? 'white' : 'inherit',
                              borderRadius: 2,
                              px: 2,
                              py: 1,
                              maxWidth: '70%',
                            }}
                          >
                            <Typography variant="body1">{msg.content}</Typography>
                            <Typography variant="caption" display="block" sx={{ textAlign: 'right', opacity: 0.8 }}>
                              {formatTimestamp(msg.timestamp)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </Box>
                
                {/* Message input */}
                <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                  <form onSubmit={handleSendMessage}>
                    <Grid container spacing={1}>
                      <Grid item xs>
                        <TextField
                          fullWidth
                          placeholder="Type a message"
                          variant="outlined"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                      </Grid>
                      <Grid item>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          endIcon={<SendIcon />}
                          disabled={!message.trim()}
                        >
                          Send
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Box>
              </>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="70vh"
              >
                <Typography variant="h6" gutterBottom>
                  Select a conversation
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Choose a conversation from the list or start a new one.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Chats;