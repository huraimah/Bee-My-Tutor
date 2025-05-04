import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// MUI components
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// Icons
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const { login, isAuthenticated, error, loading, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    // If already authenticated and loading is false, redirect to dashboard
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
    
    // Clear any previous errors
    clearError();
    
    // eslint-disable-next-line
  }, [isAuthenticated, loading]);
  
  const handleGoogleSignIn = async () => {
    try {
      await login();
    } catch (err) {
      console.error('Login error:', err);
    }
  };
  
  return (
    <Container component="main" maxWidth="lg">
      <Grid container component="main" sx={{ height: '100vh' }}>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(https://source.unsplash.com/random?education)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ mt: 3, width: '100%' }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
                disabled={loading}
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5,
                  backgroundColor: '#4285F4',
                  '&:hover': {
                    backgroundColor: '#357ae8',
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign in with Google'
                )}
              </Button>
              
              <Box mt={5}>
                <Typography variant="body2" color="text.secondary" align="center">
                  {'Copyright © '}
                  EduGenius
                  {' '}
                  {new Date().getFullYear()}
                  {'.'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;