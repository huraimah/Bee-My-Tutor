import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../api.js';
import { AuthContext } from '../context/AuthContext';

// MUI components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// Icons
import EventNoteIcon from '@mui/icons-material/EventNote';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TodayIcon from '@mui/icons-material/Today';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`study-plan-tabpanel-${index}`}
      aria-labelledby={`study-plan-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StudyPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Session dialog state
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionFormData, setSessionFormData] = useState({
    title: '',
    description: '',
    date: '',
    duration: 60,
    completed: false
  });
  const [sessionFormErrors, setSessionFormErrors] = useState({});
  const [editingSessionId, setEditingSessionId] = useState(null);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  
  useEffect(() => {
    const fetchStudyPlan = async () => {
      try {
        const res = await api.get(`/api/study/plans/${id}`);
        setStudyPlan(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching study plan:', err);
        setError('Failed to load study plan. Please try again later.');
        setLoading(false);
      }
    };

    fetchStudyPlan();
  }, [id]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!studyPlan?.sessions || studyPlan.sessions.length === 0) return 0;
    const completedSessions = studyPlan.sessions.filter(session => session.completed).length;
    return Math.round((completedSessions / studyPlan.sessions.length) * 100);
  };
  
  // Get plan status
  const getPlanStatus = () => {
    if (!studyPlan) return 'Loading...';
    
    const progress = calculateProgress();
    const deadline = new Date(studyPlan.examDate);
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
  
  // Format duration in hours and minutes
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
  };
  
  // Handle session dialog open
  const handleOpenSessionDialog = (session = null) => {
    if (session) {
      // Edit existing session
      setSessionFormData({
        title: session.title,
        description: session.description || '',
        date: new Date(session.date).toISOString().split('T')[0],
        duration: session.duration,
        completed: session.completed
      });
      setEditingSessionId(session._id);
    } else {
      // Create new session
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setSessionFormData({
        title: '',
        description: '',
        date: tomorrow.toISOString().split('T')[0],
        duration: 60,
        completed: false
      });
      setEditingSessionId(null);
    }
    
    setSessionFormErrors({});
    setSessionDialogOpen(true);
  };
  
  // Handle session dialog close
  const handleCloseSessionDialog = () => {
    setSessionDialogOpen(false);
  };
  
  // Handle session form change
  const handleSessionFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    setSessionFormData({
      ...sessionFormData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear field-specific error when user starts typing
    if (sessionFormErrors[name]) {
      setSessionFormErrors({
        ...sessionFormErrors,
        [name]: ''
      });
    }
  };
  
  // Validate session form
  const validateSessionForm = () => {
    const errors = {};
    
    if (!sessionFormData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!sessionFormData.date) {
      errors.date = 'Date is required';
    }
    
    if (!sessionFormData.duration || sessionFormData.duration <= 0) {
      errors.duration = 'Duration must be greater than 0';
    }
    
    setSessionFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle session form submit
  const handleSessionFormSubmit = async (e) => {
    e.preventDefault();
    
    if (validateSessionForm()) {
      try {
        if (editingSessionId) {
          // Update existing session
          await api.put(`/api/study/plans/${id}/sessions/${editingSessionId}`, sessionFormData);
          
          // Update local state
          setStudyPlan({
            ...studyPlan,
            sessions: studyPlan.sessions.map(session => 
              session._id === editingSessionId 
                ? { ...session, ...sessionFormData } 
                : session
            )
          });
        } else {
          // Create new session
          const res = await api.post(`/api/study/plans/${id}/sessions`, sessionFormData);
          
          // Update local state
          setStudyPlan({
            ...studyPlan,
            sessions: [...studyPlan.sessions, res.data]
          });
        }
        
        handleCloseSessionDialog();
      } catch (err) {
        console.error('Error saving study session:', err);
        setError('Failed to save study session. Please try again later.');
      }
    }
  };
  
  // Handle delete session dialog open
  const handleOpenDeleteDialog = (sessionId) => {
    setDeletingSessionId(sessionId);
    setDeleteDialogOpen(true);
  };
  
  // Handle delete session dialog close
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingSessionId(null);
  };
  
  // Handle delete session
  const handleDeleteSession = async () => {
    try {
      await api.delete(`/api/study/plans/${id}/sessions/${deletingSessionId}`);
      
      // Update local state
      setStudyPlan({
        ...studyPlan,
        sessions: studyPlan.sessions.filter(session => session._id !== deletingSessionId)
      });
      
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting study session:', err);
      setError('Failed to delete study session. Please try again later.');
      handleCloseDeleteDialog();
    }
  };
  
  // Handle toggle session completion
  const handleToggleSessionCompletion = async (sessionId, completed) => {
    try {
      await api.patch(`/api/study/plans/${id}/sessions/${sessionId}`, { completed });
      
      // Update local state
      setStudyPlan({
        ...studyPlan,
        sessions: studyPlan.sessions.map(session => 
          session._id === sessionId 
            ? { ...session, completed } 
            : session
        )
      });
    } catch (err) {
      console.error('Error updating session completion:', err);
      setError('Failed to update session completion. Please try again later.');
    }
  };
  
  // Get upcoming sessions
  const getUpcomingSessions = () => {
    if (!studyPlan?.sessions) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return studyPlan.sessions
      .filter(session => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);
        return !session.completed && sessionDate >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  // Get past sessions
  const getPastSessions = () => {
    if (!studyPlan?.sessions) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return studyPlan.sessions
      .filter(session => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);
        return session.completed || sessionDate < today;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };
  
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
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/study-plans"
        >
          Back to Study Plans
        </Button>
      </Container>
    );
  }
  
  if (!studyPlan) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Study plan not found.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/study-plans"
        >
          Back to Study Plans
        </Button>
      </Container>
    );
  }
  
  const status = getPlanStatus();
  const statusColor = getStatusColor(status);
  const progress = calculateProgress();
  const upcomingSessions = getUpcomingSessions();
  const pastSessions = getPastSessions();
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/study-plans"
          sx={{ mb: 2 }}
        >
          Back to Study Plans
        </Button>
        
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EventNoteIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h4" component="h1">
                {studyPlan.title}
              </Typography>
            </Box>
            <Box>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
                component={RouterLink}
                to={`/study-plans/${id}/edit`}
              >
                Edit Plan
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip 
              label={studyPlan.subject} 
              color="primary" 
              variant="outlined" 
              sx={{ mr: 1 }} 
            />
            <Chip 
              label={status} 
              color={statusColor}
            />
          </Box>
          
          <Typography variant="body1" paragraph>
            {studyPlan.description}
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  <strong>Exam Date:</strong> {new Date(studyPlan.examDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  <strong>Total Sessions:</strong> {studyPlan.sessions.length}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  <strong>Completed Sessions:</strong> {studyPlan.sessions.filter(s => s.completed).length}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Progress: {progress}%</strong>
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color={statusColor}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
        </Paper>
      </Box>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="study plan tabs">
            <Tab label="Upcoming Sessions" icon={<TodayIcon />} iconPosition="start" />
            <Tab label="Past Sessions" icon={<AssessmentIcon />} iconPosition="start" />
            <Tab label="Study Materials" icon={<DescriptionIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Upcoming Study Sessions
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenSessionDialog()}
            >
              Add Session
            </Button>
          </Box>
          
          {upcomingSessions.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" paragraph>
                No upcoming study sessions scheduled.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenSessionDialog()}
              >
                Schedule a Session
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {upcomingSessions.map((session) => (
                <Grid item xs={12} md={6} key={session._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="h3">
                          {session.title}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={session.completed}
                              onChange={(e) => handleToggleSessionCompletion(session._id, e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Completed"
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(session.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDuration(session.duration)}
                        </Typography>
                      </Box>
                      
                      {session.description && (
                        <Typography variant="body2" paragraph>
                          {session.description}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenSessionDialog(session)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        startIcon={<DeleteIcon />}
                        onClick={() => handleOpenDeleteDialog(session._id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Past Study Sessions
          </Typography>
          
          {pastSessions.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No past study sessions found.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {pastSessions.map((session) => (
                <Grid item xs={12} md={6} key={session._id}>
                  <Card sx={{ opacity: session.completed ? 1 : 0.7 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="h3" sx={{ 
                          textDecoration: session.completed ? 'none' : 'line-through' 
                        }}>
                          {session.title}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={session.completed}
                              onChange={(e) => handleToggleSessionCompletion(session._id, e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Completed"
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(session.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDuration(session.duration)}
                        </Typography>
                      </Box>
                      
                      {session.description && (
                        <Typography variant="body2" paragraph>
                          {session.description}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenSessionDialog(session)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        startIcon={<DeleteIcon />}
                        onClick={() => handleOpenDeleteDialog(session._id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Related Study Materials
          </Typography>
          
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" paragraph>
              You can link study materials to this plan.
            </Typography>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/materials"
            >
              Browse Study Materials
            </Button>
          </Paper>
        </TabPanel>
      </Box>
      
      {/* Add/Edit Session Dialog */}
      <Dialog open={sessionDialogOpen} onClose={handleCloseSessionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSessionId ? 'Edit Study Session' : 'Add Study Session'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSessionFormSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Session Title"
              name="title"
              value={sessionFormData.title}
              onChange={handleSessionFormChange}
              error={!!sessionFormErrors.title}
              helperText={sessionFormErrors.title}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Description (Optional)"
              name="description"
              multiline
              rows={3}
              value={sessionFormData.description}
              onChange={handleSessionFormChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="date"
              label="Date"
              name="date"
              type="date"
              value={sessionFormData.date}
              onChange={handleSessionFormChange}
              error={!!sessionFormErrors.date}
              helperText={sessionFormErrors.date}
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="duration"
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={sessionFormData.duration}
              onChange={handleSessionFormChange}
              error={!!sessionFormErrors.duration}
              helperText={sessionFormErrors.duration}
              inputProps={{ min: 1 }}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  name="completed"
                  checked={sessionFormData.completed}
                  onChange={handleSessionFormChange}
                  color="primary"
                />
              }
              label="Mark as completed"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSessionDialog}>Cancel</Button>
          <Button onClick={handleSessionFormSubmit} variant="contained">
            {editingSessionId ? 'Save Changes' : 'Add Session'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Study Session</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this study session? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteSession} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudyPlanDetail;