import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          mt: 8,
          mb: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <SentimentDissatisfiedIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
          
          <Typography variant="h2" component="h1" gutterBottom>
            404
          </Typography>
          
          <Typography variant="h4" component="h2" gutterBottom>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500 }}>
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/"
              size="large"
            >
              Go to Homepage
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;