import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import Checkbox from '@mui/material/Checkbox';
import Slider from '@mui/material/Slider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormHelperText from '@mui/material/FormHelperText';

// Icons
import QuizIcon from '@mui/icons-material/Quiz';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const GenerateQuiz = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    materialIds: [],
    difficulty: 2,
    questionCount: 10,
    timeLimit: 30
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  
  const { title, description, materialIds, difficulty, questionCount, timeLimit } = formData;
  
  // Fetch study materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/study/materials`);
        setMaterials(res.data);
        setLoadingMaterials(false);
      } catch (err) {
        console.error('Error fetching materials:', err);
        setError('Failed to load study materials. Please try again later.');
        setLoadingMaterials(false);
      }
    };
    
    fetchMaterials();
  }, []);
  
  const difficultyMarks = [
    {
      value: 1,
      label: 'Easy',
    },
    {
      value: 2,
      label: 'Medium',
    },
    {
      value: 3,
      label: 'Hard',
    },
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
  
  const handleDifficultyChange = (event, newValue) => {
    setFormData({
      ...formData,
      difficulty: newValue
    });
  };
  
  const handleQuestionCountChange = (event, newValue) => {
    setFormData({
      ...formData,
      questionCount: newValue
    });
  };
  
  const handleMaterialToggle = (materialId) => {
    const currentIndex = materialIds.indexOf(materialId);
    const newMaterialIds = [...materialIds];
    
    if (currentIndex === -1) {
      newMaterialIds.push(materialId);
    } else {
      newMaterialIds.splice(currentIndex, 1);
    }
    
    setFormData({
      ...formData,
      materialIds: newMaterialIds
    });
    
    // Clear material error if at least one is selected
    if (newMaterialIds.length > 0 && formErrors.materialIds) {
      setFormErrors({
        ...formErrors,
        materialIds: ''
      });
    }
  };
  
  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (materialIds.length === 0) {
        errors.materialIds = 'Please select at least one study material';
      }
    } else if (step === 1) {
      if (!title.trim()) {
        errors.title = 'Title is required';
      }
      
      if (!description.trim()) {
        errors.description = 'Description is required';
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateStep(activeStep)) {
      setLoading(true);
      setError(null);
      
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/quizzes/generate`,
          formData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        setGeneratedQuiz(res.data);
        setSuccess(true);
        setLoading(false);
        
        // Navigate to the quiz page after a short delay
        setTimeout(() => {
          navigate(`/quizzes/${res.data._id}`);
        }, 2000);
      } catch (err) {
        console.error('Error generating quiz:', err);
        setError(
          err.response?.data?.message || 
          'Failed to generate quiz. Please try again.'
        );
        setLoading(false);
      }
    }
  };
  
  // Get difficulty label
  const getDifficultyLabel = (level) => {
    switch (level) {
      case 1: return 'Easy';
      case 2: return 'Medium';
      case 3: return 'Hard';
      default: return 'Medium';
    }
  };
  
  // Get difficulty color
  const getDifficultyColor = (level) => {
    switch (level) {
      case 1: return 'success';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'warning';
    }
  };
  
  // Success view
  if (success) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Quiz Generated Successfully!
          </Typography>
          <Typography variant="body1" paragraph>
            Your AI-generated quiz "{generatedQuiz.title}" has been created with {generatedQuiz.questions.length} questions.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to quiz page...
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  // Loading view for materials
  if (loadingMaterials) {
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
  
  const steps = [
    {
      label: 'Select Materials',
      description: 'Choose study materials to generate questions from',
      content: (
        <Box sx={{ py: 2 }}>
          {materials.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              You don't have any study materials yet. Please upload some materials first.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select the study materials you want to use for generating quiz questions:
              </Typography>
              
              {formErrors.materialIds && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formErrors.materialIds}
                </Alert>
              )}
              
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {materials.map((material) => {
                  const labelId = `checkbox-list-label-${material._id}`;
                  
                  return (
                    <ListItem
                      key={material._id}
                      disablePadding
                      sx={{ mb: 1 }}
                    >
                      <Card sx={{ width: '100%' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <ListItemButton 
                            role={undefined} 
                            onClick={() => handleMaterialToggle(material._id)}
                            dense
                          >
                            <ListItemIcon>
                              <Checkbox
                                edge="start"
                                checked={materialIds.indexOf(material._id) !== -1}
                                tabIndex={-1}
                                disableRipple
                                inputProps={{ 'aria-labelledby': labelId }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              id={labelId}
                              primary={material.title}
                              secondary={
                                <>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                  >
                                    {material.subject}
                                  </Typography>
                                  {" — "}{material.description?.substring(0, 100)}
                                  {material.description?.length > 100 ? "..." : ""}
                                </>
                              }
                            />
                          </ListItemButton>
                        </CardContent>
                      </Card>
                    </ListItem>
                  );
                })}
              </List>
            </>
          )}
        </Box>
      )
    },
    {
      label: 'Quiz Details',
      description: 'Customize your quiz settings',
      content: (
        <Box sx={{ py: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="title"
                label="Quiz Title"
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
              <FormControl fullWidth>
                <InputLabel id="timeLimit-label">Time Limit (minutes)</InputLabel>
                <Select
                  labelId="timeLimit-label"
                  id="timeLimit"
                  name="timeLimit"
                  value={timeLimit}
                  label="Time Limit (minutes)"
                  onChange={handleChange}
                >
                  <MenuItem value={0}>No time limit</MenuItem>
                  <MenuItem value={5}>5 minutes</MenuItem>
                  <MenuItem value={10}>10 minutes</MenuItem>
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={20}>20 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={45}>45 minutes</MenuItem>
                  <MenuItem value={60}>60 minutes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography id="difficulty-slider" gutterBottom>
                Difficulty Level
              </Typography>
              <Slider
                value={difficulty}
                onChange={handleDifficultyChange}
                step={1}
                marks={difficultyMarks}
                min={1}
                max={3}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => getDifficultyLabel(value)}
                aria-labelledby="difficulty-slider"
                sx={{
                  '& .MuiSlider-markLabel': {
                    fontSize: '0.875rem',
                  },
                  '& .MuiSlider-thumb': {
                    backgroundColor: getDifficultyColor(difficulty),
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: getDifficultyColor(difficulty),
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography id="question-count-slider" gutterBottom>
                Number of Questions: {questionCount}
              </Typography>
              <Slider
                value={questionCount}
                onChange={handleQuestionCountChange}
                step={1}
                marks={[
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                  { value: 15, label: '15' },
                  { value: 20, label: '20' },
                ]}
                min={5}
                max={20}
                valueLabelDisplay="auto"
                aria-labelledby="question-count-slider"
              />
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: 'Review & Generate',
      description: 'Review your settings and generate the quiz',
      content: (
        <Box sx={{ py: 2 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quiz Settings
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
                  Difficulty:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip 
                  label={getDifficultyLabel(difficulty)} 
                  size="small" 
                  color={getDifficultyColor(difficulty)}
                />
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Questions:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {questionCount} questions
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Time Limit:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {timeLimit === 0 ? 'No time limit' : `${timeLimit} minutes`}
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Selected Materials
            </Typography>
            <List dense>
              {materials
                .filter(material => materialIds.includes(material._id))
                .map(material => (
                  <ListItem key={material._id}>
                    <ListItemIcon>
                      <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={material.title}
                      secondary={material.subject}
                    />
                  </ListItem>
                ))
              }
            </List>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                The AI will generate {questionCount} questions based on the selected materials.
                The questions will be at {getDifficultyLabel(difficulty).toLowerCase()} difficulty level.
              </Typography>
            </Box>
          </Paper>
        </Box>
      )
    }
  ];
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <AutoAwesomeIcon color="primary" sx={{ mr: 2, fontSize: 30 }} />
          <Typography variant="h4" component="h1">
            Generate AI Quiz
          </Typography>
        </Box>
        
        {error && !loading && (
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
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading || materials.length === 0}
                  startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                >
                  {loading ? 'Generating...' : 'Generate Quiz'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={materials.length === 0}
                  endIcon={<ArrowForwardIcon />}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
          
          {loading && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Generating your quiz using AI... This may take a minute.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default GenerateQuiz;