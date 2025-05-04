import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { generateLearningStyleAssessment, analyzeLearningStyle } from '../utils/gemini';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

// MUI components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HearingIcon from '@mui/icons-material/Hearing';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SportsHandballIcon from '@mui/icons-material/SportsHandball';

const LearningStyleAssessment = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const initializeAssessment = async () => {
      try {
        if (location.state?.assessment) {
          setAssessment(location.state.assessment);
          setAnswers(new Array(location.state.assessment.questions.length).fill(null));
        } else {
          const generatedAssessment = await generateLearningStyleAssessment();
          setAssessment(generatedAssessment);
          setAnswers(new Array(generatedAssessment.questions.length).fill(null));
        }
      } catch (err) {
        console.error('Error generating assessment:', err);
        setError('Failed to generate assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeAssessment();
  }, [location.state]);
  
  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };
  
  const handleNext = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (answers.includes(null)) {
      setError('Please answer all questions before submitting.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Format answers for analysis
      const formattedAnswers = answers.map((answer, index) => {
        const question = assessment.questions[index];
        const selectedOption = question.options.find(option => option.id === answer);
        
        return {
          questionId: index + 1,
          selectedOptionId: answer,
          style: selectedOption.style
        };
      });
      
      // Get analysis from Gemini
      const analysis = await analyzeLearningStyle(formattedAnswers);
      
      // Save results to Firestore
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          learningStyle: analysis.analysis,
          assessmentCompleted: true,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }
      
      setResult({
        learningStyle: analysis.analysis,
        analysis: analysis.analysis
      });
    } catch (err) {
      console.error('Error analyzing assessment:', err);
      setError('Failed to analyze results. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const getStyleIcon = (style) => {
    switch (style) {
      case 'visual':
        return <VisibilityIcon />;
      case 'auditory':
        return <HearingIcon />;
      case 'reading':
        return <MenuBookIcon />;
      case 'kinesthetic':
        return <SportsHandballIcon />;
      default:
        return null;
    }
  };
  
  const getStyleColor = (style) => {
    switch (style) {
      case 'visual':
        return 'primary';
      case 'auditory':
        return 'secondary';
      case 'reading':
        return 'success';
      case 'kinesthetic':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const getStyleClassName = (style) => {
    switch (style) {
      case 'visual':
        return 'learning-style-visual';
      case 'auditory':
        return 'learning-style-auditory';
      case 'reading':
        return 'learning-style-reading';
      case 'kinesthetic':
        return 'learning-style-kinesthetic';
      default:
        return '';
    }
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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (result) {
    // Show results
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Your Learning Style Results
        </Typography>
        
        <Box sx={{ mt: 4, mb: 6 }}>
          <Alert severity="success" sx={{ mb: 4 }}>
            <AlertTitle>Assessment Complete</AlertTitle>
            Based on your responses, we've identified your learning style preferences.
          </Alert>
          
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Your Dominant Learning Style: 
              <Chip 
                label={result.learningStyle.dominantStyle.toUpperCase()} 
                color={getStyleColor(result.learningStyle.dominantStyle)}
                icon={getStyleIcon(result.learningStyle.dominantStyle)}
                sx={{ ml: 2 }}
              />
            </Typography>
            
            <Box sx={{ mt: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Your Learning Style Breakdown:
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={3}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText'
                    }}
                  >
                    <VisibilityIcon />
                    <Typography variant="h6">Visual</Typography>
                    <Typography variant="h4">{result.learningStyle.visual}%</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: 'secondary.light',
                      color: 'secondary.contrastText'
                    }}
                  >
                    <HearingIcon />
                    <Typography variant="h6">Auditory</Typography>
                    <Typography variant="h4">{result.learningStyle.auditory}%</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: 'success.light',
                      color: 'success.contrastText'
                    }}
                  >
                    <MenuBookIcon />
                    <Typography variant="h6">Reading</Typography>
                    <Typography variant="h4">{result.learningStyle.reading}%</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: 'warning.light',
                      color: 'warning.contrastText'
                    }}
                  >
                    <SportsHandballIcon />
                    <Typography variant="h6">Kinesthetic</Typography>
                    <Typography variant="h4">{result.learningStyle.kinesthetic}%</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          
          {result.analysis && (
            <Card className={getStyleClassName(result.learningStyle.dominantStyle)}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  What this means for you:
                </Typography>
                <Typography variant="body1" paragraph>
                  {result.analysis.explanation}
                </Typography>
                
                <Typography variant="h6" gutterBottom>
                  Recommended Study Strategies:
                </Typography>
                <List>
                  {result.analysis.strategies.map((strategy, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon color={getStyleColor(result.learningStyle.dominantStyle)} />
                      </ListItemIcon>
                      <ListItemText primary={strategy} />
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  How to Adapt Materials:
                </Typography>
                <Typography variant="body1">
                  {result.analysis.adaptations}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/study-plans/create')}
          >
            Create Study Plan
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Show assessment
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Learning Style Assessment
      </Typography>
      <Typography variant="body1" paragraph align="center">
        Answer these questions to discover your optimal learning style.
        This AI-powered assessment will analyze your responses to provide personalized recommendations.
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Stepper activeStep={currentQuestion} alternativeLabel sx={{ mb: 4 }}>
          {assessment.questions.map((_, index) => (
            <Step key={index}>
              <StepLabel>{`Question ${index + 1}`}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box>
          <Typography variant="h6" gutterBottom>
            Question {currentQuestion + 1} of {assessment.questions.length}
          </Typography>
          <Typography variant="body1" paragraph>
            {assessment.questions[currentQuestion].text}
          </Typography>
          
          <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
            <FormLabel component="legend">Select the option that best describes you:</FormLabel>
            <RadioGroup
              value={answers[currentQuestion] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
            >
              {assessment.questions[currentQuestion].options.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={option.text}
                  sx={{ mb: 1 }}
                />
              ))}
            </RadioGroup>
          </FormControl>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={currentQuestion === 0}
            >
              Back
            </Button>
            
            {currentQuestion < assessment.questions.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={answers[currentQuestion] === null}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={answers[currentQuestion] === null || submitting}
                startIcon={submitting && <CircularProgress size={20} />}
              >
                {submitting ? 'Analyzing...' : 'Submit'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LearningStyleAssessment;