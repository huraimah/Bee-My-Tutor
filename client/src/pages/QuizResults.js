import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import QuizIcon from '@mui/icons-material/Quiz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ReplayIcon from '@mui/icons-material/Replay';
import SchoolIcon from '@mui/icons-material/School';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const QuizResults = () => {
  const { quizId, resultId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [quiz, setQuiz] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchQuizAndResult = async () => {
      try {
        // Fetch quiz data
        const quizRes = await axios.get(`/api/quizzes/${quizId}`);
        setQuiz(quizRes.data);
        
        // Fetch specific result
        const resultRes = await axios.get(`/api/quizzes/${quizId}/results/${resultId}`);
        setResult(resultRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Failed to load quiz results. Please try again later.');
        setLoading(false);
      }
    };

    fetchQuizAndResult();
  }, [quizId, resultId]);
  
  // Calculate score percentage
  const calculateScore = () => {
    if (!result) return 0;
    return Math.round((result.correctAnswers / result.totalQuestions) * 100);
  };
  
  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  };
  
  // Format time taken
  const formatTimeTaken = (seconds) => {
    if (!seconds) return 'N/A';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) return `${remainingSeconds} seconds`;
    if (remainingSeconds === 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
  };
  
  // Get feedback based on score
  const getFeedback = (score) => {
    if (score >= 90) return 'Excellent! You have mastered this topic.';
    if (score >= 80) return 'Great job! You have a strong understanding of this topic.';
    if (score >= 70) return 'Good work! You understand most of this topic.';
    if (score >= 60) return 'Not bad! You have a decent grasp of this topic.';
    if (score >= 50) return 'You passed, but there\'s room for improvement.';
    if (score >= 40) return 'You need to study more to improve your understanding.';
    return 'You should review this topic thoroughly before trying again.';
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
          to={`/quizzes/${quizId}`}
        >
          Back to Quiz
        </Button>
      </Container>
    );
  }
  
  if (!quiz || !result) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Quiz or result not found.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/quizzes"
        >
          Back to Quizzes
        </Button>
      </Container>
    );
  }
  
  const score = calculateScore();
  const scoreColor = getScoreColor(score);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to={`/quizzes/${quizId}`}
          sx={{ mb: 2 }}
        >
          Back to Quiz
        </Button>
        
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <QuizIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h4" component="h1">
                Quiz Results: {quiz.title}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip 
              label={quiz.subject} 
              color="primary" 
              variant="outlined" 
              sx={{ mr: 1 }} 
            />
            <Chip 
              label={`Completed: ${new Date(result.date).toLocaleDateString()}`} 
              color="default"
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 4 }}>
            <Box
              sx={{
                position: 'relative',
                display: 'inline-flex',
              }}
            >
              <CircularProgress
                variant="determinate"
                value={score}
                size={160}
                thickness={5}
                color={scoreColor}
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
                  color={`${scoreColor}.main`}
                >
                  {score}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.correctAnswers}/{result.totalQuestions}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Typography variant="h6" align="center" color={`${scoreColor}.main`} gutterBottom>
            {getFeedback(score)}
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Time Taken
                    </Typography>
                  </Box>
                  <Typography variant="h5" align="center">
                    {formatTimeTaken(result.timeTaken)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarTodayIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Date Completed
                    </Typography>
                  </Box>
                  <Typography variant="h5" align="center">
                    {new Date(result.date).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmojiEventsIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Performance
                    </Typography>
                  </Box>
                  <Typography variant="h5" align="center" color={`${scoreColor}.main`}>
                    {score >= 80 ? 'Excellent' : 
                     score >= 70 ? 'Good' : 
                     score >= 60 ? 'Satisfactory' : 
                     score >= 50 ? 'Fair' : 'Needs Improvement'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ReplayIcon />}
              component={RouterLink}
              to={`/quizzes/${quizId}/take`}
            >
              Retake Quiz
            </Button>
            <Button
              variant="outlined"
              startIcon={<SchoolIcon />}
              component={RouterLink}
              to="/study-materials"
            >
              Study Materials
            </Button>
          </Box>
        </Paper>
      </Box>
      
      <Typography variant="h5" gutterBottom>
        Question Review
      </Typography>
      
      {result.answers && result.answers.map((answer, index) => {
        const question = quiz.questions.find(q => q._id === answer.questionId) || 
                         quiz.questions[index]; // Fallback if ID matching fails
        
        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        
        return (
          <Paper key={index} sx={{ mb: 3, overflow: 'hidden' }}>
            <Box sx={{ 
              bgcolor: isCorrect ? 'success.light' : 'error.light', 
              color: 'white', 
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="subtitle1">
                Question {index + 1}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isCorrect ? (
                  <>
                    <CheckCircleIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">Correct</Typography>
                  </>
                ) : (
                  <>
                    <CancelIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">Incorrect</Typography>
                  </>
                )}
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
                      ) : option === answer.selectedAnswer && !isCorrect ? (
                        <CancelIcon color="error" />
                      ) : (
                        <HelpOutlineIcon color="disabled" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={option} 
                      sx={{
                        ...(option === question.correctAnswer && {
                          fontWeight: 'bold',
                          color: 'success.main'
                        }),
                        ...(option === answer.selectedAnswer && !isCorrect && {
                          color: 'error.main',
                          textDecoration: 'line-through'
                        })
                      }}
                    />
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
        );
      })}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ReplayIcon />}
          component={RouterLink}
          to={`/quizzes/${quizId}/take`}
        >
          Retake Quiz
        </Button>
      </Box>
    </Container>
  );
};

export default QuizResults;