import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
  Box,
  Button,
  TextField,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  Group as GroupIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, error, setError } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    current_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate form for password change
    if (formData.new_password && formData.new_password !== formData.new_password_confirm) {
      setError("New passwords don't match");
      setLoading(false);
      return;
    }
    
    // Prepare update data
    const updateData = {
      name: formData.name,
      email: formData.email,
    };
    
    // Add password data if changing password
    if (formData.new_password && formData.current_password) {
      updateData.current_password = formData.current_password;
      updateData.new_password = formData.new_password;
      updateData.new_password_confirm = formData.new_password_confirm;
    }
    
    try {
      await updateProfile(updateData);
      setSuccess(true);
      setIsEditing(false);
      // Clear password fields
      setFormData({
        ...formData,
        current_password: '',
        new_password: '',
        new_password_confirm: '',
      });
    } catch (err) {
      // Error handling is done in the auth context
      console.error('Profile update failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      current_password: '',
      new_password: '',
      new_password_confirm: '',
    });
    if (error) setError(null);
    if (success) setSuccess(false);
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Profile updated successfully!
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                fontSize: '2.5rem',
                mr: 3,
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            
            <Box>
              <Typography variant="h5" gutterBottom>
                {user?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ID: {user?.id_no}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  icon={<SchoolIcon />}
                  label={`Branch: ${user?.branch || 'N/A'}`}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip
                  icon={<SchoolIcon />}
                  label={`Year: ${user?.year || 'N/A'}`}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip
                  icon={user?.user_type === 'developer' ? <GroupIcon /> : <HomeIcon />}
                  label={`Role: ${user?.user_type}`}
                  color={user?.user_type === 'developer' ? 'secondary' : 'primary'}
                  size="small"
                  sx={{ mb: 1 }}
                />
              </Box>
            </Box>
            
            <Box sx={{ ml: 'auto' }}>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          {/* Profile Form */}
          <Grid item xs={12}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing || loading}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing || loading}
                    required
                  />
                </Grid>
                
                {isEditing && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Change Password
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Leave these fields blank if you don't want to change your password
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        name="current_password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.current_password}
                        onChange={handleChange}
                        disabled={loading}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={toggleShowPassword}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="New Password"
                        name="new_password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.new_password}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="new_password_confirm"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.new_password_confirm}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </Grid>
                  </>
                )}
                
                {isEditing && (
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={loading}
                    >
                      Save Changes
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;