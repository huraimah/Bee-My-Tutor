import React, { useState, useContext, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// MUI components
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

// Icons
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SchoolIcon from '@mui/icons-material/School';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

// Additional MUI components
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';

const Register = () => {
  const { register, isAuthenticated, error, loading, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    institution: '',
    grade: '',
    subjects: [],
    examDate: '',
    agreeToTerms: false
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear any previous errors
    clearError();
    
    // eslint-disable-next-line
  }, [isAuthenticated]);
  
  const { 
    name, 
    email, 
    password, 
    password2, 
    institution, 
    grade, 
    subjects, 
    examDate,
    agreeToTerms
  } = formData;
  
  const onChange = e => {
    const { name, value, checked, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (!name) {
        errors.name = 'Name is required';
      }
      
      if (!email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Email is invalid';
      }
      
      if (!password) {
        errors.password = 'Password is required';
      } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (!password2) {
        errors.password2 = 'Please confirm your password';
      } else if (password !== password2) {
        errors.password2 = 'Passwords do not match';
      }
    } else if (step === 1) {
      if (!institution) {
        errors.institution = 'Institution is required';
      }
      
      if (!grade) {
        errors.grade = 'Grade/Year is required';
      }
    } else if (step === 2) {
      if (subjects.length === 0) {
        errors.subjects = 'Please select at least one subject';
      }
      
      if (!examDate) {
        errors.examDate = 'Exam date is required';
      }
      
      if (!agreeToTerms) {
        errors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }
    
    setFormErrors(errors);
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
  
  const onSubmit = async e => {
    e.preventDefault();
    console.log('Form submitted');
    
    if (validateStep(activeStep)) {
      setIsSubmitting(true);
      
      try {
        console.log('Registering user with data:', {
          name,
          email,
          password,
          institution,
          grade,
          subjects,
          examDate
        });
        
        await register({
          name,
          email,
          password,
          institution,
          grade,
          subjects,
          examDate
        });
        
        setIsSubmitting(false);
      } catch (err) {
        console.error('Registration error:', err);
        setIsSubmitting(false);
      }
    }
  };
  
  const steps = [
    {
      label: 'Account Information',
      description: 'Create your account credentials',
      icon: <PersonAddIcon />,
      content: (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoComplete="name"
                name="name"
                required
                fullWidth
                id="name"
                label="Full Name"
                autoFocus
                value={name}
                onChange={onChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={onChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={onChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password2"
                label="Confirm Password"
                type="password"
                id="password2"
                autoComplete="new-password"
                value={password2}
                onChange={onChange}
                error={!!formErrors.password2}
                helperText={formErrors.password2}
              />
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: 'Education Information',
      description: 'Tell us about your education',
      icon: <SchoolIcon />,
      content: (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="institution"
                label="School/University"
                name="institution"
                value={institution}
                onChange={onChange}
                error={!!formErrors.institution}
                helperText={formErrors.institution}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!formErrors.grade}>
                <InputLabel id="grade-label">Grade/Year</InputLabel>
                <Select
                  labelId="grade-label"
                  id="grade"
                  name="grade"
                  value={grade}
                  label="Grade/Year"
                  onChange={onChange}
                >
                  <MenuItem value="High School - 9th Grade">High School - 9th Grade</MenuItem>
                  <MenuItem value="High School - 10th Grade">High School - 10th Grade</MenuItem>
                  <MenuItem value="High School - 11th Grade">High School - 11th Grade</MenuItem>
                  <MenuItem value="High School - 12th Grade">High School - 12th Grade</MenuItem>
                  <MenuItem value="University - Freshman">University - Freshman</MenuItem>
                  <MenuItem value="University - Sophomore">University - Sophomore</MenuItem>
                  <MenuItem value="University - Junior">University - Junior</MenuItem>
                  <MenuItem value="University - Senior">University - Senior</MenuItem>
                  <MenuItem value="Graduate School">Graduate School</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {formErrors.grade && (
                  <Typography variant="caption" color="error">
                    {formErrors.grade}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: 'Study Information',
      description: 'Set up your study preferences',
      icon: <EventNoteIcon />,
      content: (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!formErrors.subjects}>
                <InputLabel id="subjects-label">Subjects</InputLabel>
                <Select
                  labelId="subjects-label"
                  id="subjects"
                  name="subjects"
                  multiple
                  value={subjects}
                  label="Subjects"
                  onChange={onChange}
                  input={<OutlinedInput label="Subjects" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          size="small"
                          deleteIcon={<CloseIcon />}
                          onDelete={(e) => {
                            e.stopPropagation();
                            const newSubjects = subjects.filter(subject => subject !== value);
                            setFormData({
                              ...formData,
                              subjects: newSubjects
                            });
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 224,
                        width: 250,
                      },
                    },
                  }}
                >
                  {[
                    "Mathematics",
                    "Physics",
                    "Chemistry",
                    "Biology",
                    "Computer Science",
                    "History",
                    "Geography",
                    "Literature",
                    "Languages",
                    "Economics",
                    "Business Studies",
                    "Psychology",
                    "Sociology",
                    "Art",
                    "Music",
                    "Physical Education",
                    "Other"
                  ].map((subject) => (
                    <MenuItem
                      key={subject}
                      value={subject}
                      style={{
                        fontWeight:
                          subjects.indexOf(subject) === -1
                            ? 'normal'
                            : 'bold',
                      }}
                    >
                      {subjects.indexOf(subject) > -1 && (
                        <DoneIcon color="primary" fontSize="small" style={{ marginRight: 8 }} />
                      )}
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Select multiple subjects. Click outside to close the dropdown when finished.
                </Typography>
                {formErrors.subjects && (
                  <Typography variant="caption" color="error">
                    {formErrors.subjects}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="examDate"
                label="Next Major Exam Date"
                name="examDate"
                type="date"
                value={examDate}
                onChange={onChange}
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!formErrors.examDate}
                helperText={formErrors.examDate}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreeToTerms"
                    color="primary"
                    checked={agreeToTerms}
                    onChange={onChange}
                  />
                }
                label="I agree to the terms and conditions"
              />
              {formErrors.agreeToTerms && (
                <Typography variant="caption" color="error" display="block">
                  {formErrors.agreeToTerms}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      )
    }
  ];
  
  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <PersonAddIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" noValidate onSubmit={onSubmit} sx={{ mt: 3, width: '100%' }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    optional={
                      index === 2 ? (
                        <Typography variant="caption">Last step</Typography>
                      ) : null
                    }
                    StepIconProps={{
                      icon: step.icon
                    }}
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {step.description}
                    </Typography>
                    {step.content}
                    <Box sx={{ mb: 2, mt: 2 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={index === steps.length - 1 ? onSubmit : handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={isSubmitting || loading}
                          type={index === steps.length - 1 ? "submit" : "button"}
                        >
                          {isSubmitting || loading ? (
                            <CircularProgress size={24} />
                          ) : index === steps.length - 1 ? (
                            'Register'
                          ) : (
                            'Continue'
                          )}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Back
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>
          
          <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      
      <Box sx={{ mt: 5, mb: 4 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          <Link color="inherit" href="#">
            EduGenius
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
      </Box>
    </Container>
  );
};

export default Register;