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
  Autocomplete,
  IconButton,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/course.service';
import userService from '../services/user.service';

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
  const [openBulkEnrollDialog, setOpenBulkEnrollDialog] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [openBulkUnenrollDialog, setOpenBulkUnenrollDialog] = useState(false);
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const [selectedUsersToUnenroll, setSelectedUsersToUnenroll] = useState([]);
  const [unenrollmentLoading, setUnenrollmentLoading] = useState(false);
  
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
  
  // Fetch users for bulk enrollment
  useEffect(() => {
    if (openBulkEnrollDialog && isAdmin()) {
      const fetchUsers = async () => {
        try {
          const response = await userService.getAllUsers();
          setAllUsers(response.data);
        } catch (err) {
          console.error("Error fetching users:", err);
          setError("Failed to load users for enrollment.");
        }
      };
      
      fetchUsers();
    }
  }, [openBulkEnrollDialog]);

  // Fetch enrolled users for bulk unenrollment
  useEffect(() => {
    if (openBulkUnenrollDialog && isAdmin() && students.length > 0) {
      setEnrolledUsers(students);
    }
  }, [openBulkUnenrollDialog, students]);
  
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
      
      // Refresh students list
      const studentsResponse = await courseService.getCourseStudents(courseId);
      setStudents(studentsResponse.data.students || []);
      
      // Update enrollment status
      setIsEnrolled(false);
      
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
  
  // Handle bulk enrollment
  const handleBulkEnroll = async () => {
    if (!selectedUsers.length) {
      setError("Please select at least one student to enroll.");
      return;
    }
    
    setEnrollmentLoading(true);
    
    try {
      const userIds = selectedUsers.map(user => user.id_no);
      await courseService.bulkEnrollInCourse(courseId, userIds);
      
      // Refresh students list
      const studentsResponse = await courseService.getCourseStudents(courseId);
      setStudents(studentsResponse.data.students || []);
      
      setSuccess(`Successfully enrolled ${selectedUsers.length} student(s).`);
      setOpenBulkEnrollDialog(false);
      setSelectedUsers([]);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Bulk enrollment failed:", err);
      setError(err.response?.data?.detail || "Failed to enroll students. Please try again.");
    } finally {
      setEnrollmentLoading(false);
    }
  };

  // Handle bulk unenrollment
  const handleBulkUnenroll = async () => {
    if (!selectedUsersToUnenroll.length) {
      setError("Please select at least one student to unenroll.");
      return;
    }
    
    setUnenrollmentLoading(true);
    
    try {
      const userIds = selectedUsersToUnenroll.map(user => user.id_no);
      await courseService.bulkUnenrollFromCourse(courseId, userIds);
      
      // Refresh students list
      const studentsResponse = await courseService.getCourseStudents(courseId);
      setStudents(studentsResponse.data.students || []);
      
      setSuccess(`Successfully unenrolled ${selectedUsersToUnenroll.length} student(s).`);
      setOpenBulkUnenrollDialog(false);
      setSelectedUsersToUnenroll([]);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Bulk unenrollment failed:", err);
      setError(err.response?.data?.detail || "Failed to unenroll students. Please try again.");
    } finally {
      setUnenrollmentLoading(false);
    }
  };

  // Handle admin unenrolling a specific student
  const handleAdminUnenrollStudent = async (studentId) => {
    try {
      await courseService.bulkUnenrollFromCourse(courseId, [studentId]);
      
      // Refresh students list
      const studentsResponse = await courseService.getCourseStudents(courseId);
      setStudents(studentsResponse.data.students || []);
      
      setSuccess('Successfully unenrolled student from the course.');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Student unenrollment failed:', err);
      setError(err.response?.data?.detail || 'Failed to unenroll student. Please try again.');
      
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
            {isAdmin() && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddCircleIcon />}
                  onClick={() => setOpenBulkEnrollDialog(true)}
                >
                  Bulk Enroll Students
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<RemoveCircleIcon />}
                  onClick={() => setOpenBulkUnenrollDialog(true)}
                  disabled={students.length === 0}
                >
                  Bulk Unenroll Students
                </Button>
              </Box>
            )}
            
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
                      {isAdmin() && (
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            color="error"
                            onClick={() => handleAdminUnenrollStudent(student.id_no)}
                            title="Unenroll student"
                          >
                            <PersonRemoveIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
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
      
      {/* Bulk Enroll Dialog (Admin Only) */}
      <Dialog
        open={openBulkEnrollDialog}
        onClose={() => setOpenBulkEnrollDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Bulk Enroll Students</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select students to enroll in this course:
          </DialogContentText>
          
          <Autocomplete
            multiple
            id="select-students"
            options={allUsers.filter(user => !students.some(s => s.id_no === user.id_no))}
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
          <Button onClick={() => setOpenBulkEnrollDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleBulkEnroll}
            color="primary"
            variant="contained"
            disabled={enrollmentLoading || !selectedUsers.length}
          >
            {enrollmentLoading ? <CircularProgress size={24} /> : 'Enroll Selected Students'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Unenroll Dialog (Admin Only) */}
      <Dialog
        open={openBulkUnenrollDialog}
        onClose={() => setOpenBulkUnenrollDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Bulk Unenroll Students</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select students to unenroll from this course:
          </DialogContentText>
          
          <Autocomplete
            multiple
            id="select-students-unenroll"
            options={enrolledUsers}
            getOptionLabel={(option) => `${option.name} (${option.id_no})`}
            value={selectedUsersToUnenroll}
            onChange={(event, newValue) => setSelectedUsersToUnenroll(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Select Students"
                placeholder="Search enrolled students"
                fullWidth
              />
            )}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkUnenrollDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleBulkUnenroll}
            color="error"
            variant="contained"
            disabled={unenrollmentLoading || !selectedUsersToUnenroll.length}
          >
            {unenrollmentLoading ? <CircularProgress size={24} /> : 'Unenroll Selected Students'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseDetail;