import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// MUI components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StudyPlans = () => {
  const { user } = useContext(AuthContext);
  const [studyPlans, setStudyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('deadline');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudyPlans = async () => {
      try {
        const res = await axios.get('/api/study/plans');
        setStudyPlans(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching study plans:', err);
        setError('Failed to load study plans. Please try again later.');
        setLoading(false);
      }
    };

    fetchStudyPlans();
  }, []);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleFilterSelect = (status) => {
    setSelectedStatus(status);
    handleFilterClose();
  };

  const handleSortSelect = (sortOption) => {
    setSortBy(sortOption);
    handleSortClose();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('Are you sure you want to delete this study plan?')) {
      try {
        await axios.delete(`/api/study/plans/${id}`);
        setStudyPlans(studyPlans.filter(plan => plan._id !== id));
      } catch (err) {
        console.error('Error deleting study plan:', err);
        setError('Failed to delete study plan. Please try again later.');
      }
    }
  };

  // Calculate progress percentage
  const calculateProgress = (plan) => {
    if (!plan.sessions || plan.sessions.length === 0) return 0;
    const completedSessions = plan.sessions.filter(session => session.completed).length;
    return Math.round((completedSessions / plan.sessions.length) * 100);
  };

  // Get plan status
  const getPlanStatus = (plan) => {
    const progress = calculateProgress(plan);
    const deadline = new Date(plan.examDate);
    const today = new Date();
    
    if (progress === 100) return 'Completed';
    if (deadline < today) return 'Overdue';
    
    // Check if deadline is within 7 days
    const diffTime = Math.abs(deadline - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'Urgent';
    return 'In Progress';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Overdue':
        return 'error';
      case 'Urgent':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Filter and sort study plans
  const filteredPlans = studyPlans
    .filter(plan => {
      // Filter by status
      if (selectedStatus !== 'All') {
        const planStatus = getPlanStatus(plan);
        if (planStatus !== selectedStatus) return false;
      }
      
      // Filter by search term
      return (
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        plan.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.examDate) - new Date(b.examDate);
      } else if (sortBy === 'progress') {
        return calculateProgress(b) - calculateProgress(a);
      } else if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'created') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Study Plans
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/study-plans/create"
        >
          Create Plan
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Search plans..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Box>
            <Button
              startIcon={<FilterListIcon />}
              onClick={handleFilterClick}
              variant="outlined"
              size="medium"
              sx={{ mr: 1 }}
            >
              Filter
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
            >
              <MenuItem
                onClick={() => handleFilterSelect('All')}
                selected={selectedStatus === 'All'}
              >
                All
              </MenuItem>
              <MenuItem
                onClick={() => handleFilterSelect('In Progress')}
                selected={selectedStatus === 'In Progress'}
              >
                In Progress
              </MenuItem>
              <MenuItem
                onClick={() => handleFilterSelect('Urgent')}
                selected={selectedStatus === 'Urgent'}
              >
                Urgent
              </MenuItem>
              <MenuItem
                onClick={() => handleFilterSelect('Overdue')}
                selected={selectedStatus === 'Overdue'}
              >
                Overdue
              </MenuItem>
              <MenuItem
                onClick={() => handleFilterSelect('Completed')}
                selected={selectedStatus === 'Completed'}
              >
                Completed
              </MenuItem>
            </Menu>
            
            <Button
              startIcon={<SortIcon />}
              onClick={handleSortClick}
              variant="outlined"
              size="medium"
            >
              Sort
            </Button>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
            >
              <MenuItem
                onClick={() => handleSortSelect('deadline')}
                selected={sortBy === 'deadline'}
              >
                Deadline (Soonest First)
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect('progress')}
                selected={sortBy === 'progress'}
              >
                Progress (Highest First)
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect('created')}
                selected={sortBy === 'created'}
              >
                Recently Created
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect('alphabetical')}
                selected={sortBy === 'alphabetical'}
              >
                Alphabetical
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {selectedStatus !== 'All' && (
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`Status: ${selectedStatus}`} 
              onDelete={() => setSelectedStatus('All')} 
              color={getStatusColor(selectedStatus)} 
              variant="outlined" 
            />
          </Box>
        )}
      </Paper>

      {filteredPlans.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <EventNoteIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No study plans found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {studyPlans.length === 0 
              ? "You haven't created any study plans yet." 
              : "No plans match your search criteria."}
          </Typography>
          {studyPlans.length === 0 && (
            <Button
              variant="contained"
              component={RouterLink}
              to="/study-plans/create"
              startIcon={<AddIcon />}
            >
              Create Your First Plan
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredPlans.map((plan) => {
            const progress = calculateProgress(plan);
            const status = getPlanStatus(plan);
            const statusColor = getStatusColor(status);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={plan._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {plan.title}
                      </Typography>
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={plan.subject} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ mr: 1 }} 
                      />
                      <Chip 
                        label={status} 
                        size="small" 
                        color={statusColor}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {plan.description.length > 80 
                        ? `${plan.description.substring(0, 80)}...` 
                        : plan.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        color={statusColor}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Exam Date: {new Date(plan.examDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {plan.sessions?.length || 0} Study Sessions
                        </Typography>
                      </Box>
                      {status === 'Completed' && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="success.main">
                            Completed
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      size="small" 
                      component={RouterLink} 
                      to={`/study-plans/${plan._id}`}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeletePlan(plan._id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default StudyPlans;