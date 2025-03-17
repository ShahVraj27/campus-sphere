import api from './api';

// Course service functions for API calls
const courseService = {
  // Get all courses
  getAllCourses: async () => {
    return api.get('/courses/');
  },
  
  // Get course by ID
  getCourseById: async (id) => {
    return api.get(`/courses/${id}/`);
  },
  
  // Get course students
  getCourseStudents: async (id) => {
    return api.get(`/courses/${id}/students/`);
  },
  
  // Create course (admin only)
  createCourse: async (courseData) => {
    return api.post('/courses/', courseData);
  },
  
  // Update course (admin only)
  updateCourse: async (id, courseData) => {
    return api.put(`/courses/${id}/`, courseData);
  },
  
  // Delete course (admin only)
  deleteCourse: async (id) => {
    return api.delete(`/courses/${id}/`);
  },
  
  // Enroll current user in course
  enrollInCourse: async (id) => {
    return api.post(`/courses/${id}/enroll/`);
  },
  
  // Unenroll current user from course
  unenrollFromCourse: async (id) => {
    return api.post(`/courses/${id}/unenroll/`);
  },
  
  // Get all enrollments
  getAllEnrollments: async () => {
    return api.get('/enrollments/');
  },
  
  // Create enrollment (admin only)
  createEnrollment: async (enrollmentData) => {
    return api.post('/enrollments/', enrollmentData);
  },
  
  // Delete enrollment (admin only)
  deleteEnrollment: async (id) => {
    return api.delete(`/enrollments/${id}/`);
  },
};

export default courseService;