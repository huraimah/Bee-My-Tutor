import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// MUI components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import FormHelperText from '@mui/material/FormHelperText';

// Icons
import EventNoteIcon from '@mui/icons-material/EventNote';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CreateStudyPlan = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    examDate: '',
    sessions: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Session form data
  const [sessionFormData, setSessionFormData] = useState({
    title: '',
    description: '',
    date: '',
    duration: 60
  });
  const [sessionFormErrors, setSessionFormErrors] = useState({});
  
  const { title, description, subject, examDate, sessions } = formData;
  
  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'History',
    'Geography',
    'Literature',
    'Languages',
    'Economics',
    'Business Studies',
    'Psychology',
    'Sociology',
    'Art',
    'Music',
    'Physical Education',
    'Other'
  ];
  
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const handleSessionFormChange = e => {
    const { name, value } = e.target;
    setSessionFormData({
      ...sessionFormData,
      [name]: value
    });
    
    // Clear field-specific error when user starts typing
    if (sessionFormErrors[name]) {
      setSessionFormErrors({
        ...sessionFormErrors,
        [name]: ''
      });
    }
  };
  
  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (!title.trim()) {
        errors.title = 'Title is required';
      }
      
      if (!description.trim()) {
        errors.description = 'Description is required';
      }
      
      if (!subject) {
        errors.subject = 'Subject is required';
      }
      
      if (!examDate) {
        errors.examDate = 'Exam date is required';
      } else {
        const selectedDate = new Date(examDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          errors.examDate = 'Exam date cannot be in the past';
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateSessionForm = () => {
    const errors = {};
    
    if (!sessionFormData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!sessionFormData.date) {
      errors.date = 'Date is required';
    } else {
      const selectedDate = new Date(sessionFormData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = 'Session date cannot be in the past';
      }
      
      if (examDate) {
        const examDateObj = new Date(examDate);
        if (selectedDate > examDateObj) {
          errors.date = 'Session date cannot be after the exam date';
        }
      }
    }
    
    if (!sessionFormData.duration || sessionFormData.duration <= 0) {
      errors.duration = 'Duration must be greater than 0';
    }
    
    setSessionFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleAddSession = () => {
    if (validateSessionForm()) {
      // Add session to the list
      setFormData({
        ...formData,
        sessions: [...sessions, { ...sessionFormData, id: Date.now() }]
      });
      
      // Reset session form
      setSessionFormData({
        title: '',
        description: '',
        date: '',
        duration: 60
      });
      setSessionFormErrors({});
    }
  };
  
  const handleRemoveSession = (id) => {
    setFormData({
      ...formData,
      sessions: sessions.filter(session => session.id !== id)
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateStep(activeStep)) {
      setLoading(true);
      setError(null);
      
      try {
        // Format sessions for API
        const formattedSessions = sessions.map(({ id, ...rest }) => ({
          ...rest,
          completed: false
        }));
        
        const dataToSubmit = {
          ...formData,
          sessions: formattedSessions
        };
        
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/study/plans`, dataToSubmit);
        
        setLoading(false);
        navigate(`/study-plans/${res.data._id}`);
      } catch (err) {
        setLoading(false);
        setError(err.response?.data?.msg || 'Failed to create study plan. Please try again.');
      }
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
  
  const steps = [
    {
      label: 'Basic Information',
      description: 'Enter the basic details of your study plan',
      content: (
        <Box sx={{ py: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="title"
                label="Study Plan Title"
                name="title"
                value={title}
                onChange={handleChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="description"
                label="Description"
                name="description"
                value={description}
                onChange={handleChange}
                multiline
                rows={4}
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!formErrors.subject}>
                <InputLabel id="subject-label">Subject</InputLabel>
                <Select
                  labelId="subject-label"
                  id="subject"
                  name="subject"
                  value={subject}
                  label="Subject"
                  onChange={handleChange}
                >
                  {subjects.map((subj) => (
                    <MenuItem key={subj} value={subj}>
                      {subj}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.subject && (
                  <FormHelperText error>{formErrors.subject}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="examDate"
                label="Exam Date"
                name="examDate"
                type="date"
                value={examDate}
                onChange={handleChange}
                error={!!formErrors.examDate}
                helperText={formErrors.examDate}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: 'Study Sessions',
      description: 'Add study sessions to your plan',
      content: (
        <Box sx={{ py: 2 }}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Add Study Session
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  id="sessionTitle"
                  label="Session Title"
                  name="title"
                  value={sessionFormData.title}
                  onChange={handleSessionFormChange}
                  error={!!sessionFormErrors.title}
                  helperText={sessionFormErrors.title}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  id="sessionDate"
                  label="Session Date"
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
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  id="sessionDuration"
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={sessionFormData.duration}
                  onChange={handleSessionFormChange}
                  error={!!sessionFormErrors.duration}
                  helperText={sessionFormErrors.duration}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="sessionDescription"
                  label="Description (Optional)"
                  name="description"
                  value={sessionFormData.description}
                  onChange={handleSessionFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddSession}
                >
                  Add Session
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          <Typography variant="h6" gutterBottom>
            Study Sessions ({sessions.length})
          </Typography>
          
          {sessions.length === 0 ? (
            <Alert severity="info">
              No study sessions added yet. Add at least one session to create a study plan.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {sessions
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((session) => (
                  <Grid item xs={12} md={6} key={session.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" component="h3">
                            {session.title}
                          </Typography>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleRemoveSession(session.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
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
                    </Card>
                  </Grid>
                ))}
            </Grid>
          )}
        </Box>
      )
    },
    {
      label: 'Review & Create',
      description: 'Review your study plan and create it',
      content: (
        <Box sx={{ py: 2 }}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Study Plan Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Title:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {title}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Subject:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {subject}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Exam Date:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {examDate ? new Date(examDate).toLocaleDateString() : ''}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Description:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {description}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Study Sessions:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {sessions.length} sessions
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Study Sessions
            </Typography>
            
            {sessions.length === 0 ? (
              <Alert severity="warning">
                No study sessions added. It's recommended to add at least one session.
              </Alert>
            ) : (
              <Box>
                {sessions
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((session, index) => (
                    <Box key={session.id} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        Session {index + 1}: {session.title}
                      </Typography>
                      <Typography variant="body2">
                        Date: {new Date(session.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        Duration: {formatDuration(session.duration)}
                      </Typography>
                      {session.description && (
                        <Typography variant="body2">
                          Description: {session.description}
                        </Typography>
                      )}
                      {index < sessions.length - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  ))}
              </Box>
            )}
          </Paper>
        </Box>
      )
    }
  ];
  
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <EventNoteIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4" component="h1">
              Create Study Plan
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {steps[activeStep].description}
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {steps[activeStep].content}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
                disabled={activeStep === 0}
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading || sessions.length === 0}
                  endIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                >
                  {loading ? 'Creating...' : 'Create Study Plan'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateStudyPlan;