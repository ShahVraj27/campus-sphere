import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Home as HomeIcon,
  School as SchoolIcon,
  Apartment as ApartmentIcon,
  Groups as GroupsIcon,
  Event as EventIcon,
} from '@mui/icons-material';

const navItems = [
  { path: '/', label: 'Home', icon: <HomeIcon /> },
  { path: '/courses', label: 'Courses', icon: <SchoolIcon /> },
  { path: '/hostels', label: 'Hostels', icon: <ApartmentIcon /> },
  { path: '/clubs', label: 'Clubs', icon: <GroupsIcon /> },
  { path: '/events', label: 'Events', icon: <EventIcon /> },
];

const Navbar = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Determine active tab
  const activeTab = navItems.findIndex(item => {
    if (item.path === '/') {
      // For home path, require exact match
      return location.pathname === '/';
    } else {
      // For other paths, use startsWith
      return location.pathname.startsWith(item.path);
    }
  });
  
  // For desktop: horizontal tabs
  const horizontalNav = (
    <Box sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
      <Tabs 
        value={activeTab === -1 ? 0 : activeTab} 
        variant="scrollable"
        scrollButtons="auto"
        sx={{ minHeight: 48 }}
      >
        {navItems.map((item) => (
          <Tab
            key={item.path}
            label={item.label}
            icon={item.icon}
            iconPosition="start"
            component={RouterLink}
            to={item.path}
            sx={{ minHeight: 48 }}
          />
        ))}
      </Tabs>
    </Box>
  );
  
  // For mobile: drawer
  const drawerNav = (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          top: 64, // AppBar height
          height: 'calc(100% - 64px)',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {navItems.map((item) => (
            <ListItem 
              key={item.path}
              component={RouterLink}
              to={item.path}
              button
              selected={location.pathname.startsWith(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
  
  return isMobile ? drawerNav : horizontalNav;
};

export default Navbar;