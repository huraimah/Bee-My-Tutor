import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

// MUI components
import {
  Box, Container, Typography, Paper, Button, Divider, CircularProgress, Alert,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tabs, Tab
} from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';

// TabPanel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`quiz-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const docRef = doc(db, 'quizzes', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setQuiz({ _id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Quiz not found.');
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchQuiz();
  }, [id, user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteQuiz = async () => {
    try {
      await deleteDoc(doc(db, 'quizzes', id));
      handleCloseDeleteDialog();
      navigate('/quizzes');
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Failed to delete quiz. Please try again later.');
      handleCloseDeleteDialog();
    }
  };

  const getDifficultyLabel = (level) => {
    switch (level) {
      case 1: return 'Easy';
      case 2: return 'Medium';
      case 3: return 'Hard';
      default: return 'Medium';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} component={RouterLink} to="/quizzes">
          Back to Quizzes
        </Button>
      </Container>
    );
  }

  if (!quiz) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{quiz.title}</Typography>
        <Button color="error" startIcon={<DeleteIcon />} onClick={handleOpenDeleteDialog}>
          Delete Quiz
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Subject: {quiz.subject || 'N/A'} | Difficulty: {getDifficultyLabel(quiz.difficulty)}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>{quiz.description}</Typography>

        <Divider sx={{ my: 2 }} />

        <Tabs value={tabValue} onChange={handleTabChange} aria-label="quiz details tabs">
          <Tab label="Questions" />
          <Tab label="Results" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {quiz.questions?.length ? (
            quiz.questions.map((q, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Q{index + 1}: {q.question}</Typography>
                <ul>
                  {q.options.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
                <Typography variant="body2" color="success.main">Correct Answer: {q.correctAnswer}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No questions found in this quiz.</Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {quiz.results?.length ? (
            <ul>
              {quiz.results.map((r, i) => (
                <li key={i}>
                  Score: {r.correctAnswers}/{r.totalQuestions} — {formatDate(r.timestamp)}
                </li>
              ))}
            </ul>
          ) : (
            <Typography>No results yet.</Typography>
          )}
        </TabPanel>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Quiz</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this quiz? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteQuiz} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizDetail;
