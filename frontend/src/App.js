import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './context/AuthContext.js';

// Layout Components
import Header from './components/common/Header.js';
import Footer from './components/common/Footer.js';
import Navbar from './components/common/Navbar.js';

// Pages
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Profile from './pages/Profile.js';
import NotFound from './pages/NotFound.js';

// Content Pages
import Courses from './pages/Courses.js';
import CourseDetail from './pages/CourseDetail.js';
import Hostels from './pages/Hostels.js';
import HostelDetail from './pages/HostelDetail.js';
import Clubs from './pages/Clubs.js';
import ClubDetail from './pages/ClubDetail.js';
import Events from './pages/Events.js';
import EventDetail from './pages/EventDetail.js';
import Friends from './pages/Friends.js';
import FriendRequests from './pages/FriendRequests.js';

console.log({
  Header,
  Footer,
  Navbar,
  Home,
  Login,
  Register,
  Profile,
  NotFound,
  Courses,
  CourseDetail,
  Hostels,
  HostelDetail,
  Clubs,
  ClubDetail,
  Events,
  EventDetail,
  Friends,
  FriendRequests,
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show nothing while authentication status is being checked
  if (loading) {
    return null;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  const { user } = useAuth();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      {user && <Navbar />}
      
      <Box component="main" sx={{ flexGrow: 1, py: 3, px: { xs: 2, md: 4 } }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/courses" element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          } />
          
          <Route path="/courses/:courseId" element={
            <ProtectedRoute>
              <CourseDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/hostels" element={
            <ProtectedRoute>
              <Hostels />
            </ProtectedRoute>
          } />
          
          <Route path="/hostels/:hostelId" element={
            <ProtectedRoute>
              <HostelDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/clubs" element={
            <ProtectedRoute>
              <Clubs />
            </ProtectedRoute>
          } />
          
          <Route path="/clubs/:clubName" element={
            <ProtectedRoute>
              <ClubDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/events" element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          } />
          
          <Route path="/events/:eventId" element={
            <ProtectedRoute>
              <EventDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/friends" element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          } />
          
          <Route path="/friend-requests" element={
            <ProtectedRoute>
              <FriendRequests />
            </ProtectedRoute>
          } />
          
          {/* Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      
      <Footer />
    </Box>
  );
}

export default App;