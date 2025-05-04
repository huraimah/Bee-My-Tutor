import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../api.js';
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
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import FormHelperText from '@mui/material/FormHelperText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

// Icons
import QuizIcon from '@mui/icons-material/Quiz';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const CreateQuiz = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    difficulty: 2,
    timeLimit: 0, // 0 means no time limit
    questions: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Question form data
  const [questionFormData, setQuestionFormData] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });
  const [questionFormErrors, setQuestionFormErrors] = useState({});
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  
  const { title, description, subject, difficulty, timeLimit, questions } = formData;
  
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
  
  const handleQuestionFormChange = e => {
    const { name, value } = e.target;
    setQuestionFormData({
      ...questionFormData,
      [name]: value
    });
    
    // Clear field-specific error when user starts typing
    if (questionFormErrors[name]) {
      setQuestionFormErrors({
        ...questionFormErrors,
        [name]: ''
      });
    }
  };
  
  const handleOptionChange = (index, value) => {
    const newOptions = [...questionFormData.options];
    newOptions[index] = value;
    
    setQuestionFormData({
      ...questionFormData,
      options: newOptions
    });
    
    // Clear options error when user starts typing
    if (questionFormErrors.options) {
      setQuestionFormErrors({
        ...questionFormErrors,
        options: ''
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
    } else if (step === 1) {
      if (questions.length === 0) {
        errors.questions = 'At least one question is required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateQuestionForm = () => {
    const errors = {};
    
    if (!questionFormData.text.trim()) {
      errors.text = 'Question text is required';
    }
    
    // Check if at least 2 options are provided
    const filledOptions = questionFormData.options.filter(option => option.trim() !== '');
    if (filledOptions.length < 2) {
      errors.options = 'At least 2 options are required';
    }
    
    // Check for duplicate options
    const uniqueOptions = new Set(filledOptions);
    if (uniqueOptions.size !== filledOptions.length) {
      errors.options = 'Options must be unique';
    }
    
    if (!questionFormData.correctAnswer) {
      errors.correctAnswer = 'Correct answer is required';
    } else if (!questionFormData.options.includes(questionFormData.correctAnswer)) {
      errors.correctAnswer = 'Correct answer must be one of the options';
    }
    
    setQuestionFormErrors(errors);
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
  
  const handleAddQuestion = () => {
    if (validateQuestionForm()) {
      // Filter out empty options
      const filteredOptions = questionFormData.options.filter(option => option.trim() !== '');
      
      const newQuestion = {
        ...questionFormData,
        options: filteredOptions,
        id: Date.now() // Temporary ID for frontend
      };
      
      if (editingQuestionIndex !== null) {
        // Update existing question
        const updatedQuestions = [...questions];
        updatedQuestions[editingQuestionIndex] = newQuestion;
        
        setFormData({
          ...formData,
          questions: updatedQuestions
        });
        
        setEditingQuestionIndex(null);
      } else {
        // Add new question
        setFormData({
          ...formData,
          questions: [...questions, newQuestion]
        });
      }
      
      // Reset question form
      setQuestionFormData({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: ''
      });
      setQuestionFormErrors({});
    }
  };
  
  const handleEditQuestion = (index) => {
    const question = questions[index];
    
    // Ensure options array has 4 elements
    const options = [...question.options];
    while (options.length < 4) {
      options.push('');
    }
    
    setQuestionFormData({
      text: question.text,
      options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || ''
    });
    
    setEditingQuestionIndex(index);
  };
  
  const handleRemoveQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
    
    // If editing the question that's being removed, reset the form
    if (editingQuestionIndex === index) {
      setQuestionFormData({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: ''
      });
      setEditingQuestionIndex(null);
    } else if (editingQuestionIndex !== null && editingQuestionIndex > index) {
      // Adjust the editing index if a question before it is removed
      setEditingQuestionIndex(editingQuestionIndex - 1);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateStep(activeStep)) {
      setLoading(true);
      setError(null);
      
      try {
        // Format questions for API
        const formattedQuestions = questions.map(({ id, ...rest }) => rest);
        
        const dataToSubmit = {
          ...formData,
          questions: formattedQuestions
        };
        
        const res = await api.post('/api/quizzes', dataToSubmit);
        
        setLoading(false);
        navigate(`/quizzes/${res.data._id}`);
      } catch (err) {
        setLoading(false);
        setError(err.response?.data?.msg || 'Failed to create quiz. Please try again.');
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
  
  const steps = [
    {
      label: 'Basic Information',
      description: 'Enter the basic details of your quiz',
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
          </Grid>
        </Box>
      )
    },
    {
      label: 'Questions',
      description: 'Add questions to your quiz',
      content: (
        <Box sx={{ py: 2 }}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="questionText"
                  label="Question"
                  name="text"
                  value={questionFormData.text}
                  onChange={handleQuestionFormChange}
                  error={!!questionFormErrors.text}
                  helperText={questionFormErrors.text}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Options
                </Typography>
                {questionFormData.options.map((option, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Radio
                      checked={questionFormData.correctAnswer === option && option !== ''}
                      onChange={() => {
                        if (option.trim() !== '') {
                          setQuestionFormData({
                            ...questionFormData,
                            correctAnswer: option
                          });
                          
                          // Clear correctAnswer error when user selects an option
                          if (questionFormErrors.correctAnswer) {
                            setQuestionFormErrors({
                              ...questionFormErrors,
                              correctAnswer: ''
                            });
                          }
                        }
                      }}
                      disabled={option.trim() === ''}
                    />
                    <TextField
                      fullWidth
                      label={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      error={!!questionFormErrors.options}
                      helperText={index === 0 && questionFormErrors.options ? questionFormErrors.options : ''}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                ))}
                <FormHelperText>
                  Select the radio button next to the correct answer. Empty options will be ignored.
                </FormHelperText>
                {questionFormErrors.correctAnswer && (
                  <FormHelperText error>{questionFormErrors.correctAnswer}</FormHelperText>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="explanation"
                  label="Explanation (Optional)"
                  name="explanation"
                  value={questionFormData.explanation}
                  onChange={handleQuestionFormChange}
                  multiline
                  rows={2}
                  helperText="Provide an explanation for the correct answer (optional)"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={editingQuestionIndex !== null ? <EditIcon /> : <AddIcon />}
                  onClick={handleAddQuestion}
                >
                  {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                </Button>
                {editingQuestionIndex !== null && (
                  <Button
                    sx={{ ml: 2 }}
                    onClick={() => {
                      setQuestionFormData({
                        text: '',
                        options: ['', '', '', ''],
                        correctAnswer: '',
                        explanation: ''
                      });
                      setEditingQuestionIndex(null);
                      setQuestionFormErrors({});
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </Grid>
            </Grid>
          </Paper>
          
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Questions ({questions.length})
            </Typography>
            {formErrors.questions && (
              <Typography color="error" variant="body2">
                {formErrors.questions}
              </Typography>
            )}
          </Box>
          
          {questions.length === 0 ? (
            <Alert severity="info">
              No questions added yet. Add at least one question to create a quiz.
            </Alert>
          ) : (
            <List>
              {questions.map((question, index) => (
                <Paper key={question.id} sx={{ mb: 3, overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                      Question {index + 1}
                    </Typography>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditQuestion(index)}
                        sx={{ color: 'white', mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveQuestion(index)}
                        sx={{ color: 'white' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      {question.text}
                    </Typography>
                    
                    <List dense>
                      {question.options.map((option, optIndex) => (
                        <ListItem key={optIndex}>
                          <ListItemIcon>
                            {option === question.correctAnswer ? (
                              <CheckCircleIcon color="success" />
                            ) : (
                              <RadioButtonUncheckedIcon />
                            )}
                          </ListItemIcon>
                          <ListItemText primary={option} />
                        </ListItem>
                      ))}
                    </List>
                    
                    {question.explanation && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Explanation:
                        </Typography>
                        <Typography variant="body2">
                          {question.explanation}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              ))}
            </List>
          )}
        </Box>
      )
    },
    {
      label: 'Review & Create',
      description: 'Review your quiz and create it',
      content: (
        <Box sx={{ py: 2 }}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quiz Summary
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
                  Difficulty:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {getDifficultyLabel(difficulty)}
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
                  Questions:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {questions.length} questions
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Questions Preview
            </Typography>
            
            <List>
              {questions.map((question, index) => (
                <Box key={question.id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">
                    Question {index + 1}: {question.text}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Options: {question.options.join(', ')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Correct Answer: {question.correctAnswer}
                  </Typography>
                  {question.explanation && (
                    <Typography variant="body2" color="text.secondary">
                      Explanation: {question.explanation}
                    </Typography>
                  )}
                  {index < questions.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
            </List>
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
          to="/quizzes"
          sx={{ mb: 2 }}
        >
          Back to Quizzes
        </Button>
        
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <QuizIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4" component="h1">
              Create Quiz
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
                  disabled={loading || questions.length === 0}
                  endIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                >
                  {loading ? 'Creating...' : 'Create Quiz'}
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

export default CreateQuiz;