import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './context/AuthContext';

// Layout Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Navbar from './components/common/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Content Pages
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Hostels from './pages/Hostels';
import HostelDetail from './pages/HostelDetail';
import Clubs from './pages/Clubs';
import ClubDetail from './pages/ClubDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Friends from './pages/Friends';
import FriendRequests from './pages/FriendRequests';
import Chats from './pages/Chats';
import ChatDetail from './pages/ChatDetail';

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
          
          <Route path="/chats" element={
            <ProtectedRoute>
              <Chats />
            </ProtectedRoute>
          } />
          
          <Route path="/chats/:chatId" element={
            <ProtectedRoute>
              <ChatDetail />
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