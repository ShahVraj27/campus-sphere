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
  Box,
  Divider,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Event as EventIcon,
  PersonAdd as PersonAddIcon,
  Message as MessageIcon,
  School as SchoolIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/course.service';
import clubService from '../services/club.service';
import eventService from '../services/event.service';
import friendService from '../services/friend.service';

// Dashboard component
const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    courses: [],
    clubs: [],
    events: [],
    friendRequests: [],
    loading: true,
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data in parallel
        const [
          coursesResponse,
          clubsResponse,
          eventsResponse,
          friendRequestsResponse,
        ] = await Promise.all([
          courseService.getAllCourses(),
          clubService.getUserClubs(),
          eventService.getAllEvents({ from_date: new Date().toISOString() }),
          friendService.getReceivedFriendRequests(),
        ]);
        
        setData({
          courses: coursesResponse.data.slice(0, 3),
          clubs: clubsResponse.data.slice(0, 3),
          events: eventsResponse.data.slice(0, 3),
          friendRequests: friendRequestsResponse.data.filter(req => req.status === 'pending'),
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (data.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Grid container spacing={3}>
      {/* BITS Pilani Logo */}
      <Grid item xs={12} sx={{ textAlign: 'left', mb: 2 }}>
        <Box component="img" 
             src="C:\Vraj\Academics\2-2\DBMS\trial\bits.png"
             alt="BITS Pilani Logo"
             sx={{ 
               height: '80px', 
               maxWidth: '100%',
               mb: 2
             }} 
        />
      </Grid>
      
      {/* Welcome Card */}
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#8B0000',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.name || 'User'}!
          </Typography>
          <Typography variant="body1">
            Stay connected with your campus community. Check out the latest events, manage your courses, and connect with friends.
          </Typography>
        </Paper>
      </Grid>
      
      {/* Upcoming Events */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <EventIcon sx={{ mr: 1, color: '#8B0000' }} />
              <Typography variant="h6" component="h2">
                Upcoming Events
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {data.events.length > 0 ? (
              data.events.map((event) => (
                <Box key={event.id} mb={2}>
                  <Typography variant="subtitle1" component="h3">
                    {event.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {new Date(event.date_time).toLocaleString()} | {event.club_name}
                  </Typography>
                  <Typography variant="body2" noWrap>
                    {event.location}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body1" color="text.secondary">
                No upcoming events found.
              </Typography>
            )}
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              component={RouterLink} 
              to="/events"
              endIcon={<EventIcon />}
              sx={{ color: '#8B0000' }}
            >
              View All Events
            </Button>
          </CardActions>
        </Card>
      </Grid>
      
      {/* Friend Requests */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <PersonAddIcon sx={{ mr: 1, color: '#8B0000' }} />
              <Typography variant="h6" component="h2">
                Friend Requests
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {data.friendRequests.length > 0 ? (
              data.friendRequests.map((request) => (
                <Box key={request.id} mb={2}>
                  <Typography variant="subtitle1" component="h3">
                    {request.sender.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ID: {request.sender.id_no}
                  </Typography>
                  <Box>
                    <Button 
                      size="small" 
                      variant="contained" 
                      sx={{ mr: 1, bgcolor: '#8B0000', '&:hover': { bgcolor: '#A52A2A' } }}
                      onClick={() => friendService.acceptFriendRequest(request.id)}
                    >
                      Accept
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="error"
                      onClick={() => friendService.rejectFriendRequest(request.id)}
                    >
                      Decline
                    </Button>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body1" color="text.secondary">
                No pending friend requests.
              </Typography>
            )}
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              component={RouterLink} 
              to="/friend-requests"
              endIcon={<PersonAddIcon />}
              sx={{ color: '#8B0000' }}
            >
              View All Requests
            </Button>
          </CardActions>
        </Card>
      </Grid>
      
      {/* My Courses */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <SchoolIcon sx={{ mr: 1, color: '#8B0000' }} />
              <Typography variant="h6" component="h2">
                My Courses
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {data.courses.length > 0 ? (
              data.courses.map((course) => (
                <Box key={course.course_id} mb={2}>
                  <Typography variant="subtitle1" component="h3">
                    {course.course_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.course_id} | {course.department}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body1" color="text.secondary">
                You are not enrolled in any courses.
              </Typography>
            )}
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              component={RouterLink} 
              to="/courses"
              endIcon={<SchoolIcon />}
              sx={{ color: '#8B0000' }}
            >
              View All Courses
            </Button>
          </CardActions>
        </Card>
      </Grid>
      
      {/* My Clubs */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <GroupsIcon sx={{ mr: 1, color: '#8B0000' }} />
              <Typography variant="h6" component="h2">
                My Clubs
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {data.clubs.length > 0 ? (
              data.clubs.map((clubMembership) => (
                <Box key={clubMembership.id} mb={2}>
                  <Typography variant="subtitle1" component="h3">
                    {clubMembership.club.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {clubMembership.club.type} | Role: {clubMembership.role}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body1" color="text.secondary">
                You are not a member of any clubs.
              </Typography>
            )}
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              component={RouterLink} 
              to="/clubs"
              endIcon={<GroupsIcon />}
              sx={{ color: '#8B0000' }}
            >
              View All Clubs
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
};

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Dashboard />
    </Container>
  );
};

export default Home;