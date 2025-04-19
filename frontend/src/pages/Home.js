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
import logoImage from '../assets/image.png';  // Adjust path to where your image is located

// Dashboard component
const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    courses: [],
    clubs: [],
    events: [],
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
        ] = await Promise.all([
          courseService.getAllCourses(),
          clubService.getUserClubs(),
          eventService.getAllEvents({ from_date: new Date().toISOString() }),
        ]);
        
        setData({
          courses: coursesResponse.data.slice(0, 3),
          clubs: clubsResponse.data.slice(0, 3),
          events: eventsResponse.data.slice(0, 3),
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
      {/* Header with Logo and Title */}
      <Grid item xs={12} sx={{ mb: 3 }}>
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            pb: 2
          }}
        >
          {/* Logo on the left */}
          <Box 
            component="img" 
            src={logoImage}
            alt="BITS Pilani Logo"
            sx={{ 
              height: '60px',
              width: 'auto',
              position: 'absolute',
              left: 0
            }} 
          />
          
          {/* Campus Sphere title in the middle */}
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              width: '100%',
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#8B0000'
            }}
          >
            Campus Sphere
          </Typography>
        </Box>
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
            Stay connected with your campus community. Check out the latest events, manage your courses, explore new clubs.
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