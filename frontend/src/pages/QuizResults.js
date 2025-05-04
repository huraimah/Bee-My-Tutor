import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

// MUI
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

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
    const fetchData = async () => {
      try {
        const quizRef = doc(db, 'quizzes', quizId);
        const resultRef = doc(db, 'quizzes', quizId, 'results', resultId);

        const [quizSnap, resultSnap] = await Promise.all([
          getDoc(quizRef),
          getDoc(resultRef)
        ]);

        if (!quizSnap.exists() || !resultSnap.exists()) {
          setError('Quiz or result not found.');
          setLoading(false);
          return;
        }

        setQuiz({ id: quizSnap.id, ...quizSnap.data() });
        setResult({ id: resultSnap.id, ...resultSnap.data() });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load quiz results.');
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, resultId]);

  const calculateScore = () =>
    result ? Math.round((result.correctAnswers / result.totalQuestions) * 100) : 0;

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const formatTimeTaken = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min > 0 ? `${min} min${min > 1 ? 's' : ''} ` : ''}${sec} sec${sec !== 1 ? 's' : ''}`;
  };

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} component={RouterLink} to="/quizzes">
          Back to Quizzes
        </Button>
      </Container>
    );
  }

  const score = calculateScore();
  const scoreColor = getScoreColor(score);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
        <Typography variant="h4" gutterBottom>
          Quiz Results: {quiz.title}
        </Typography>
        <Chip label={quiz.subject} sx={{ mr: 1 }} />
        <Chip label={`Completed: ${new Date(result.date).toLocaleDateString()}`} />

        <Box sx={{ textAlign: 'center', my: 4 }}>
          <CircularProgress variant="determinate" value={score} size={160} thickness={5} color={scoreColor} />
          <Typography variant="h3" color={`${scoreColor}.main`} sx={{ mt: -10 }}>
            {score}%
          </Typography>
          <Typography variant="body2">
            {result.correctAnswers}/{result.totalQuestions}
          </Typography>
        </Box>

        <Typography variant="h6" align="center" color={`${scoreColor}.main`} gutterBottom>
          {getFeedback(score)}
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card><CardContent>
              <AccessTimeIcon /> <Typography>Time Taken: {formatTimeTaken(result.timeTaken)}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card><CardContent>
              <CalendarTodayIcon /> <Typography>Date: {new Date(result.date).toLocaleDateString()}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card><CardContent>
              <EmojiEventsIcon /> <Typography>Performance: {getFeedback(score)}</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ReplayIcon />}
            component={RouterLink}
            to={`/quizzes/${quizId}/take`}
            sx={{ mr: 2 }}
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

      <Typography variant="h5" sx={{ mt: 5 }}>
        Question Review
      </Typography>

      {result.answers && result.answers.map((answer, index) => {
        const question = quiz.questions.find(q => q.id === answer.questionId) || quiz.questions[index];
        const isCorrect = answer.selectedAnswer === question.correctAnswer;

        return (
          <Paper key={index} sx={{ mt: 3, p: 2, backgroundColor: isCorrect ? 'success.light' : 'error.light' }}>
            <Typography variant="subtitle1">Question {index + 1}</Typography>
            <Typography>{question.text}</Typography>
            <List dense>
              {question.options.map((option, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon>
                    {option === question.correctAnswer ? <CheckCircleIcon color="success" />
                      : option === answer.selectedAnswer && !isCorrect ? <CancelIcon color="error" />
                      : <HelpOutlineIcon color="disabled" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={option}
                    sx={{
                      ...(option === question.correctAnswer && { fontWeight: 'bold', color: 'success.main' }),
                      ...(option === answer.selectedAnswer && !isCorrect && { color: 'error.main', textDecoration: 'line-through' })
                    }}
                  />
                </ListItem>
              ))}
            </List>
            {question.explanation && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="subtitle2">Explanation:</Typography>
                <Typography variant="body2">{question.explanation}</Typography>
              </Box>
            )}
          </Paper>
        );
      })}
    </Container>
  );
};

export default QuizResults;
