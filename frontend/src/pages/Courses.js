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
  School as SchoolIcon,
  Add as AddIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/course.service';

const Courses = () => {
  const { user, isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newCourse, setNewCourse] = useState({
    course_id: '',
    course_name: '',
  });
  
  // Fetch courses data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allCoursesResponse, enrollmentsResponse] = await Promise.all([
          courseService.getAllCourses(),
          courseService.getAllEnrollments(),
        ]);
        
        setCourses(allCoursesResponse.data);
        
        // Extract IDs of enrolled courses
        const enrolledCourseIds = enrollmentsResponse.data.map(enrollment => enrollment.course.course_id);
        setEnrolledCourses(enrolledCourseIds);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle course enrollment
  const handleEnroll = async (courseId) => {
    try {
      await courseService.enrollInCourse(courseId);
      setEnrolledCourses([...enrolledCourses, courseId]);
      setSuccess(`Successfully enrolled in the course.`);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Enrollment failed:', err);
      setError(err.response?.data?.detail || 'Failed to enroll in the course. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle course unenrollment
  const handleUnenroll = async (courseId) => {
    try {
      await courseService.unenrollFromCourse(courseId);
      setEnrolledCourses(enrolledCourses.filter(id => id !== courseId));
      setSuccess(`Successfully unenrolled from the course.`);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Unenrollment failed:', err);
      setError(err.response?.data?.detail || 'Failed to unenroll from the course. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle course creation (admin only)
  const handleCreateCourse = async () => {
    try {
      await courseService.createCourse(newCourse);
      // Refresh course list
      const response = await courseService.getAllCourses();
      setCourses(response.data);
      
      setSuccess('Course created successfully!');
      setOpenAddDialog(false);
      setNewCourse({ course_id: '', course_name: '' });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Course creation failed:', err);
      setError(err.response?.data?.detail || 'Failed to create course. Please try again.');
      
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
  
  // Filter courses based on search term
  const filteredCourses = courses.filter(course => 
    course.course_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.department.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Check if user is enrolled in a course
  const isEnrolled = (courseId) => {
    return enrolledCourses.includes(courseId);
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
          Courses
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and manage your course enrollments
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
            label="Search Courses"
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
              Add Course
            </Button>
          )}
        </Box>
      </Paper>
      
      {filteredCourses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No courses found</Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredCourses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.course_id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2">
                      {course.course_id}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" gutterBottom>
                    {course.course_name}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      Department:
                    </Typography>
                    <Chip 
                      label={course.department} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  {isEnrolled(course.course_id) && (
                    <Chip
                      label="Enrolled"
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
                    to={`/courses/${course.course_id}`}
                  >
                    View Details
                  </Button>
                  
                  {isEnrolled(course.course_id) ? (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<RemoveCircleIcon />}
                      onClick={() => handleUnenroll(course.course_id)}
                      sx={{ ml: 'auto' }}
                    >
                      Unenroll
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<AddCircleIcon />}
                      onClick={() => handleEnroll(course.course_id)}
                      sx={{ ml: 'auto' }}
                    >
                      Enroll
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Add Course Dialog (Admin Only) */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Course</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please enter the details for the new course:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="course_id"
            label="Course ID"
            type="text"
            fullWidth
            variant="outlined"
            value={newCourse.course_id}
            onChange={(e) => setNewCourse({ ...newCourse, course_id: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="course_name"
            label="Course Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newCourse.course_name}
            onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCourse} 
            color="primary"
            variant="contained"
            disabled={!newCourse.course_id || !newCourse.course_name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Courses;