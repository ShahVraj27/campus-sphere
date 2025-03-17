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
  School as SchoolIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/course.service';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dialog states
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editedCourse, setEditedCourse] = useState({
    course_id: '',
    course_name: '',
  });
  
  // Fetch course data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseResponse, studentsResponse, enrollmentsResponse] = await Promise.all([
          courseService.getCourseById(courseId),
          courseService.getCourseStudents(courseId),
          courseService.getAllEnrollments(),
        ]);
        
        setCourse(courseResponse.data);
        setStudents(studentsResponse.data.students || []);
        
        // Check if current user is enrolled
        const userEnrollments = enrollmentsResponse.data.map(e => e.course.course_id);
        setIsEnrolled(userEnrollments.includes(courseId));
        
        // Setup edit form with current data
        setEditedCourse({
          course_id: courseResponse.data.course_id,
          course_name: courseResponse.data.course_name,
        });
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId]);
  
  // Handle course enrollment
  const handleEnroll = async () => {
    try {
      await courseService.enrollInCourse(courseId);
      setIsEnrolled(true);
      
      // Refresh students list
      const studentsResponse = await courseService.getCourseStudents(courseId);
      setStudents(studentsResponse.data.students || []);
      
      setSuccess('Successfully enrolled in the course.');
      
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
  const handleUnenroll = async () => {
    try {
      await courseService.unenrollFromCourse(courseId);
      setIsEnrolled(false);
      
      // Refresh students list
      const studentsResponse = await courseService.getCourseStudents(courseId);
      setStudents(studentsResponse.data.students || []);
      
      setSuccess('Successfully unenrolled from the course.');
      
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
  
  // Handle course update (admin only)
  const handleUpdateCourse = async () => {
    try {
      await courseService.updateCourse(courseId, editedCourse);
      
      // Refresh course data
      const courseResponse = await courseService.getCourseById(courseId);
      setCourse(courseResponse.data);
      
      setSuccess('Course updated successfully.');
      setOpenEditDialog(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Course update failed:', err);
      setError(err.response?.data?.detail || 'Failed to update course. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  // Handle course deletion (admin only)
  const handleDeleteCourse = async () => {
    try {
      await courseService.deleteCourse(courseId);
      setSuccess('Course deleted successfully.');
      
      // Redirect to courses list after deletion
      setTimeout(() => {
        navigate('/courses');
      }, 1500);
    } catch (err) {
      console.error('Course deletion failed:', err);
      setError(err.response?.data?.detail || 'Failed to delete course. Please try again.');
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
  
  if (!course && !loading) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Course not found
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="contained"
            onClick={() => navigate('/courses')}
            sx={{ mt: 2 }}
          >
            Back to Courses
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
          onClick={() => navigate('/courses')}
          sx={{ mb: 2 }}
        >
          Back to Courses
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
                {course.course_name}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {course.course_id}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Department: {course.department}
                </Typography>
              </Box>
              
              {isEnrolled && (
                <Chip
                  label="You are enrolled in this course"
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
                Students ({students.length})
              </Typography>
              
              {isEnrolled ? (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<RemoveCircleIcon />}
                  onClick={handleUnenroll}
                >
                  Unenroll
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddCircleIcon />}
                  onClick={handleEnroll}
                >
                  Enroll
                </Button>
              )}
            </Box>
            
            {students.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                No students enrolled in this course yet.
              </Typography>
            ) : (
              <List>
                {students.map((student) => (
                  <React.Fragment key={student.id_no}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>
                          {student.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={student.name}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              ID: {student.id_no}
                            </Typography>
                            {student.email && ` — ${student.email}`}
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
      
      {/* Edit Course Dialog (Admin Only) */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Course</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update the course details:
          </DialogContentText>
          <TextField
            margin="dense"
            id="course_id"
            label="Course ID"
            type="text"
            fullWidth
            variant="outlined"
            value={editedCourse.course_id}
            onChange={(e) => setEditedCourse({ ...editedCourse, course_id: e.target.value })}
            disabled  // Course ID cannot be changed
            sx={{ mb: 2 }}
          />
          <TextField
            autoFocus
            margin="dense"
            id="course_name"
            label="Course Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editedCourse.course_name}
            onChange={(e) => setEditedCourse({ ...editedCourse, course_name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateCourse} 
            color="primary"
            variant="contained"
            disabled={!editedCourse.course_name}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Course Dialog (Admin Only) */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this course? This action cannot be undone and will remove all enrollments.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteCourse} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseDetail;