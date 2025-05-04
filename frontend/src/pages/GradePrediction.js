import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../api.js';
import { AuthContext } from '../context/AuthContext';

// MUI components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Slider from '@mui/material/Slider';
import Chip from '@mui/material/Chip';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import FormHelperText from '@mui/material/FormHelperText';
import LinearProgress from '@mui/material/LinearProgress';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import List from '@mui/material/List';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const GradePrediction = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    subject: '',
    currentGrade: '',
    studyHoursPerWeek: 5,
    attendanceRate: 90,
    completedAssignments: 90,
    quizScores: [],
    learningStyle: '',
    difficultyLevel: 2,
    targetGrade: ''
  });

  // Prediction results
  const [prediction, setPrediction] = useState(null);

  // Form errors
  const [formErrors, setFormErrors] = useState({});

  // Get user's learning style from profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get('/api/users/profile');
        if (res.data.learningStyle) {
          setFormData(prev => ({
            ...prev,
            learningStyle: res.data.learningStyle
          }));
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    fetchUserProfile();
  }, []);

  // Get user's quiz scores
  useEffect(() => {
    const fetchQuizScores = async () => {
      try {
        const res = await api.get('/api/quizzes/user-results');
        if (res.data && res.data.length > 0) {
          // Format quiz scores for the form
          const scores = res.data.map(quiz => ({
            quizId: quiz._id,
            quizTitle: quiz.title,
            score: Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100)
          }));

          setFormData(prev => ({
            ...prev,
            quizScores: scores
          }));
        }
      } catch (err) {
        console.error('Error fetching quiz scores:', err);
      }
    };

    fetchQuizScores();
  }, []);

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

  const learningStyles = [
    'Visual',
    'Auditory',
    'Reading/Writing',
    'Kinesthetic',
    'Multimodal'
  ];

  const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];

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

  const handleSliderChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear field-specific error
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
      if (!formData.subject) {
        errors.subject = 'Subject is required';
      }

      if (!formData.currentGrade) {
        errors.currentGrade = 'Current grade is required';
      }

      if (!formData.targetGrade) {
        errors.targetGrade = 'Target grade is required';
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
      setPredicting(true);
      setError(null);

      try {
        // In a real application, this would call an API endpoint
        // For this demo, we'll simulate a prediction
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Calculate a predicted grade based on the input factors
        const gradeIndex = grades.indexOf(formData.currentGrade);
        const targetIndex = grades.indexOf(formData.targetGrade);

        // Factors that influence the prediction
        const studyFactor = formData.studyHoursPerWeek / 10; // 0.5 to 2.0
        const attendanceFactor = formData.attendanceRate / 100; // 0 to 1
        const assignmentFactor = formData.completedAssignments / 100; // 0 to 1

        // Average quiz score (if available)
        const avgQuizScore = formData.quizScores.length > 0
          ? formData.quizScores.reduce((sum, quiz) => sum + quiz.score, 0) / formData.quizScores.length / 100
          : 0.7; // Default if no quizzes

        // Difficulty factor (harder courses are harder to improve in)
        const difficultyFactor = 1 - ((formData.difficultyLevel - 1) / 4); // 0.75 to 0.5

        // Calculate improvement potential (0 to 1)
        const improvementPotential = (studyFactor * 0.3) +
          (attendanceFactor * 0.2) +
          (assignmentFactor * 0.2) +
          (avgQuizScore * 0.3);

        // Apply difficulty factor
        const adjustedPotential = improvementPotential * difficultyFactor;

        // Calculate maximum possible improvement in grade steps
        const maxImprovement = Math.floor(adjustedPotential * 5); // 0 to 5 grade steps

        // Calculate predicted grade index (can't go beyond A+)
        const predictedIndex = Math.max(0, Math.min(gradeIndex - maxImprovement, grades.length - 1));
        const predictedGrade = grades[predictedIndex];

        // Calculate likelihood of achieving target
        const stepsToTarget = gradeIndex - targetIndex;
        const likelihood = stepsToTarget <= 0 ? 100 : // Already achieved
          stepsToTarget > maxImprovement ?
            Math.round((maxImprovement / stepsToTarget) * 100) :
            100; // Can achieve target

        // Generate recommendations based on the factors
        const recommendations = [];

        if (formData.studyHoursPerWeek < 7) {
          recommendations.push('Increase your study time to at least 7-10 hours per week');
        }

        if (formData.attendanceRate < 90) {
          recommendations.push('Improve your class attendance to at least 90%');
        }

        if (formData.completedAssignments < 95) {
          recommendations.push('Complete all assignments on time');
        }

        if (avgQuizScore < 0.7) {
          recommendations.push('Focus on improving quiz scores through regular practice');
        }

        // Add learning style recommendation
        if (formData.learningStyle) {
          const styleRecommendations = {
            'Visual': 'Use diagrams, charts, and videos to study',
            'Auditory': 'Record lectures and listen to them, discuss topics with others',
            'Reading/Writing': 'Take detailed notes and read textbooks thoroughly',
            'Kinesthetic': 'Use hands-on activities and practical applications',
            'Multimodal': 'Combine different learning methods for better retention'
          };

          recommendations.push(styleRecommendations[formData.learningStyle]);
        }

        // Add subject-specific recommendation
        if (formData.subject === 'Mathematics' || formData.subject === 'Physics') {
          recommendations.push('Practice solving problems regularly');
        } else if (formData.subject === 'Literature' || formData.subject === 'History') {
          recommendations.push('Focus on critical analysis and essay writing skills');
        }

        // Set prediction result
        setPrediction({
          predictedGrade,
          likelihood,
          recommendations,
          improvementPotential: Math.round(improvementPotential * 100),
          studyImpact: Math.round(studyFactor * 50), // 25-100 scale
          attendanceImpact: Math.round(attendanceFactor * 100),
          assignmentImpact: Math.round(assignmentFactor * 100),
          quizImpact: Math.round(avgQuizScore * 100)
        });

        setPredicting(false);
        setSuccess(true);
      } catch (err) {
        setPredicting(false);
        setError('Failed to generate prediction. Please try again.');
      }
    }
  };

  // Get grade color
  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A' || grade === 'A-') return 'success';
    if (grade === 'B+' || grade === 'B' || grade === 'B-') return 'primary';
    if (grade === 'C+' || grade === 'C' || grade === 'C-') return 'warning';
    return 'error';
  };

  // Get likelihood color
  const getLikelihoodColor = (likelihood) => {
    if (likelihood >= 80) return 'success';
    if (likelihood >= 60) return 'primary';
    if (likelihood >= 40) return 'warning';
    return 'error';
  };

  const steps = [
    {
      label: 'Basic Information',
      content: (
        <Box sx={{ py: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required error={!!formErrors.subject}>
                <InputLabel id="subject-label">Subject</InputLabel>
                <Select
                  labelId="subject-label"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  label="Subject"
                  onChange={handleChange}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.subject && (
                  <FormHelperText error>{formErrors.subject}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth required error={!!formErrors.currentGrade}>
                <InputLabel id="currentGrade-label">Current Grade</InputLabel>
                <Select
                  labelId="currentGrade-label"
                  id="currentGrade"
                  name="currentGrade"
                  value={formData.currentGrade}
                  label="Current Grade"
                  onChange={handleChange}
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.currentGrade && (
                  <FormHelperText error>{formErrors.currentGrade}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth required error={!!formErrors.targetGrade}>
                <InputLabel id="targetGrade-label">Target Grade</InputLabel>
                <Select
                  labelId="targetGrade-label"
                  id="targetGrade"
                  name="targetGrade"
                  value={formData.targetGrade}
                  label="Target Grade"
                  onChange={handleChange}
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.targetGrade && (
                  <FormHelperText error>{formErrors.targetGrade}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography id="difficulty-slider" gutterBottom>
                Course Difficulty Level
              </Typography>
              <Slider
                value={formData.difficultyLevel}
                onChange={(e, newValue) => handleSliderChange('difficultyLevel', newValue)}
                step={1}
                marks={difficultyMarks}
                min={1}
                max={3}
                valueLabelDisplay="auto"
                aria-labelledby="difficulty-slider"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="learningStyle-label">Your Learning Style</InputLabel>
                <Select
                  labelId="learningStyle-label"
                  id="learningStyle"
                  name="learningStyle"
                  value={formData.learningStyle}
                  label="Your Learning Style"
                  onChange={handleChange}
                >
                  {learningStyles.map((style) => (
                    <MenuItem key={style} value={style}>
                      {style}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  If you don't know your learning style, take our assessment first
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: 'Study Habits',
      content: (
        <Box sx={{ py: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography id="studyHours-slider" gutterBottom>
                Study Hours Per Week: {formData.studyHoursPerWeek} hours
              </Typography>
              <Slider
                value={formData.studyHoursPerWeek}
                onChange={(e, newValue) => handleSliderChange('studyHoursPerWeek', newValue)}
                step={1}
                marks={[
                  { value: 0, label: '0' },
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                  { value: 15, label: '15' },
                  { value: 20, label: '20' }
                ]}
                min={0}
                max={20}
                valueLabelDisplay="auto"
                aria-labelledby="studyHours-slider"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography id="attendance-slider" gutterBottom>
                Class Attendance Rate: {formData.attendanceRate}%
              </Typography>
              <Slider
                value={formData.attendanceRate}
                onChange={(e, newValue) => handleSliderChange('attendanceRate', newValue)}
                step={5}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 25, label: '25%' },
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' }
                ]}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                aria-labelledby="attendance-slider"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography id="assignments-slider" gutterBottom>
                Completed Assignments: {formData.completedAssignments}%
              </Typography>
              <Slider
                value={formData.completedAssignments}
                onChange={(e, newValue) => handleSliderChange('completedAssignments', newValue)}
                step={5}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 25, label: '25%' },
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' }
                ]}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                aria-labelledby="assignments-slider"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Quiz Performance
              </Typography>

              {formData.quizScores.length === 0 ? (
                <Alert severity="info">
                  No quiz scores available. Taking quizzes will help improve prediction accuracy.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {formData.quizScores.map((quiz, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2" noWrap>
                          {quiz.quizTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={quiz.score}
                              color={
                                quiz.score >= 80 ? 'success' :
                                  quiz.score >= 60 ? 'primary' :
                                    quiz.score >= 40 ? 'warning' : 'error'
                              }
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {quiz.score}%
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: 'Prediction',
      content: (
        <Box sx={{ py: 2 }}>
          {predicting ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Analyzing your data...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our AI is calculating your grade prediction
              </Typography>
            </Box>
          ) : success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Grade prediction generated successfully!
              </Alert>

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Predicted Grade
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 3 }}>
                        <Box
                          sx={{
                            position: 'relative',
                            display: 'inline-flex',
                          }}
                        >
                          <CircularProgress
                            variant="determinate"
                            value={prediction.likelihood}
                            size={160}
                            thickness={5}
                            color={getLikelihoodColor(prediction.likelihood)}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                            }}
                          >
                            <Typography
                              variant="h3"
                              component="div"
                              color={`${getGradeColor(prediction.predictedGrade)}.main`}
                            >
                              {prediction.predictedGrade}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {prediction.likelihood}% likelihood
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Chip
                          label={`Target: ${formData.targetGrade}`}
                          color={getGradeColor(formData.targetGrade)}
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={`Current: ${formData.currentGrade}`}
                          color={getGradeColor(formData.currentGrade)}
                        />
                      </Box>

                      <Typography variant="body2" align="center" color="text.secondary">
                        {prediction.likelihood >= 80
                          ? "You're on track to achieve your target grade!"
                          : prediction.likelihood >= 50
                            ? "You have a good chance of reaching your target with some improvements."
                            : "You'll need significant improvements to reach your target grade."}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Performance Factors
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          Study Time Impact
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={prediction.studyImpact}
                          color="primary"
                          sx={{ height: 8, borderRadius: 4, mb: 2 }}
                        />

                        <Typography variant="body2" gutterBottom>
                          Attendance Impact
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={prediction.attendanceImpact}
                          color="secondary"
                          sx={{ height: 8, borderRadius: 4, mb: 2 }}
                        />

                        <Typography variant="body2" gutterBottom>
                          Assignment Completion Impact
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={prediction.assignmentImpact}
                          color="success"
                          sx={{ height: 8, borderRadius: 4, mb: 2 }}
                        />

                        <Typography variant="body2" gutterBottom>
                          Quiz Performance Impact
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={prediction.quizImpact}
                          color="warning"
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Overall Improvement Potential: {prediction.improvementPotential}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recommendations
                      </Typography>

                      <List>
                        {prediction.recommendations.map((recommendation, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <CheckCircleIcon color="success" sx={{ mr: 1, mt: 0.5 }} />
                            <Typography variant="body1">
                              {recommendation}
                            </Typography>
                          </Box>
                        ))}
                      </List>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle1" gutterBottom>
                        Next Steps
                      </Typography>

                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6} md={4}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<SchoolIcon />}
                            component={RouterLink}
                            to="/study-plans"
                          >
                            Create Study Plan
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<AssessmentIcon />}
                            component={RouterLink}
                            to="/quizzes"
                          >
                            Practice Quizzes
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<TimelineIcon />}
                            component={RouterLink}
                            to="/study-materials"
                          >
                            Find Study Materials
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="h6" gutterBottom>
                Ready to Generate Your Grade Prediction
              </Typography>
              <Typography variant="body1" paragraph>
                Click the "Generate Prediction" button below to analyze your data and generate a personalized grade prediction.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Our AI algorithm will analyze your study habits, quiz performance, and other factors to predict your potential grade and provide personalized recommendations.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<CalculateIcon />}
                onClick={handleSubmit}
                sx={{ mt: 2 }}
              >
                Generate Prediction
              </Button>
            </Box>
          )}
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
          to="/dashboard"
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <TrendingUpIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4" component="h1">
              Grade Prediction
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

          <Box component="form" sx={{ mt: 2 }}>
            {steps[activeStep].content}

            {!success && (
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
                    onClick={handleSubmit}
                    endIcon={<CalculateIcon />}
                    disabled={predicting}
                  >
                    {predicting ? 'Generating...' : 'Generate Prediction'}
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
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default GradePrediction;