import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// MUI components
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import SchoolIcon from '@mui/icons-material/School';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import EventNoteIcon from '@mui/icons-material/EventNote';
import QuizIcon from '@mui/icons-material/Quiz';
import InsightsIcon from '@mui/icons-material/Insights';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
    handleCloseUserMenu();
  };
  
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  const drawerList = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem component={RouterLink} to="/" sx={{ color: 'inherit', textDecoration: 'none' }}>
          <ListItemIcon>
            <SchoolIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="EduGenius" primaryTypographyProps={{ variant: 'h6' }} />
        </ListItem>
      </List>
      <Divider />
      
      {isAuthenticated ? (
        <>
          <List>
            <ListItem button component={RouterLink} to="/dashboard">
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            
            <ListItem button component={RouterLink} to="/learning-style">
              <ListItemIcon>
                <PsychologyIcon />
              </ListItemIcon>
              <ListItemText primary="Learning Style" />
            </ListItem>
            
            <ListItem button component={RouterLink} to="/materials">
              <ListItemIcon>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText primary="Study Materials" />
            </ListItem>
            
            <ListItem button component={RouterLink} to="/study-plans">
              <ListItemIcon>
                <EventNoteIcon />
              </ListItemIcon>
              <ListItemText primary="Study Plans" />
            </ListItem>
            
            <ListItem button component={RouterLink} to="/quizzes">
              <ListItemIcon>
                <QuizIcon />
              </ListItemIcon>
              <ListItemText primary="Quizzes" />
            </ListItem>
            
            <ListItem button component={RouterLink} to="/grade-prediction">
              <ListItemIcon>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Grade Prediction" />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </>
      ) : (
        <List>
          <ListItem button component={RouterLink} to="/login">
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary="Login" />
          </ListItem>
          
          <ListItem button component={RouterLink} to="/register">
            <ListItemIcon>
              <PersonAddIcon />
            </ListItemIcon>
            <ListItemText primary="Register" />
          </ListItem>
        </List>
      )}
    </Box>
  );
  
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile menu icon */}
          <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={toggleDrawer(true)}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              {drawerList()}
            </Drawer>
          </Box>
          
          {/* Logo for mobile */}
          <SchoolIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            EduGenius
          </Typography>
          
          {/* Logo for desktop */}
          <SchoolIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            EduGenius
          </Typography>
          
          {/* Desktop navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {isAuthenticated && (
              <>
                <Button
                  component={RouterLink}
                  to="/dashboard"
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  Dashboard
                </Button>
                <Button
                  component={RouterLink}
                  to="/materials"
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  Study Materials
                </Button>
                <Button
                  component={RouterLink}
                  to="/study-plans"
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  Study Plans
                </Button>
                <Button
                  component={RouterLink}
                  to="/quizzes"
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  Quizzes
                </Button>
              </>
            )}
          </Box>
          
          {/* User menu */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user?.name || 'User'} src="/static/images/avatar/2.jpg" />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem component={RouterLink} to="/dashboard" onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">Dashboard</Typography>
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/learning-style" onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">Learning Style</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex' }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  sx={{ mr: 1 }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  color="inherit"
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;