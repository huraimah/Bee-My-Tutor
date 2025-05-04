import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

// MUI
import {
  Box, Container, Typography, Paper, Grid, Button, Chip,
  CircularProgress, Alert, Card, CardContent, List, ListItem,
  ListItemIcon, ListItemText
} from '@mui/material';

// Icons
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  EmojiEvents as EmojiEventsIcon,
  Replay as ReplayIcon,
  School as SchoolIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';

const QuizResults = () => {
  const { quizId, resultId } = useParams();
  const { user } = useContext(AuthContext);

  const [quiz, setQuiz] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizRef = doc(db, 'quizzes', quizId);
        const quizSnap = await getDoc(quizRef);
        if (!quizSnap.exists()) throw new Error('Quiz not found');
        setQuiz({ id: quizSnap.id, ...quizSnap.data() });
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz.');
      }
    };

    const fetchResult = async () => {
      try {
        const resultRef = doc(db, 'quizResults', resultId);
        const resultSnap = await getDoc(resultRef);
        if (!resultSnap.exists()) throw new Error('Result not found');
        setResult({ id: resultSnap.id, ...resultSnap.data() });
      } catch (err) {
        console.error('Error fetching result:', err);
        setError('Failed to load result.');
      }
    };

    Promise.all([fetchQuiz(), fetchResult()]).finally(() => setLoading(false));
  }, [quizId, resultId]);

  const getAnswerStats = () => {
    if (!result?.answers || !quiz?.questions) return { correct: 0, total: 0 };

    const total = result.answers.length;
    const correct = result.answers.reduce((acc, answer) => {
      const question = quiz.questions.find(q => q.id === answer.questionId) || quiz.questions[acc];
      return answer.selectedAnswer === question?.correctAnswer ? acc + 1 : acc;
    }, 0);

    return { correct, total };
  };

  const { correct, total } = getAnswerStats();
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

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

  if (error || !quiz || !result) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error || 'Unable to load quiz or result.'}</Alert>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} component={RouterLink} to="/quizzes">
          Back to Quizzes
        </Button>
      </Container>
    );
  }

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
            {correct}/{total}
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

      {result.answers.map((answer, index) => {
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
