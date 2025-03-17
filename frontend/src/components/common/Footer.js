import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1" color="text.secondary" align="center">
          &copy; {new Date().getFullYear()} Campus Sphere - Connect with your campus
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          <Link color="inherit" href="/">
            Home
          </Link>{' | '}
          <Link color="inherit" href="/about">
            About
          </Link>{' | '}
          <Link color="inherit" href="/privacy">
            Privacy Policy
          </Link>{' | '}
          <Link color="inherit" href="/terms">
            Terms of Service
          </Link>
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 1 }}
        >
          Developed by: Arnav Adivi, Siddhant Kedia, Jayant Choudhary, Vraj Shah, Tejas Singh Sodhi, Swayam Lakhotia
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;