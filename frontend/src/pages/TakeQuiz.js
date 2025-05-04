import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../utils/firebase';

// MUI components
import {
  Box,
  Container,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const docRef = doc(db, 'quizzes', quizId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setQuiz(docSnap.data());
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

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const handleAnswerChange = (questionId, selectedAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedAnswer,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    console.log(quiz.questions);
    console.log(answers);
    // Check if all questions are answered
    if (quiz.questions.length !== Object.keys(answers).length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);

    try {
        console.log(answers);
      const resultData = {
        userId: user.uid,
        quizId,
        answers: quiz.questions.map((q, id) => ({
          questionId: id,
          selectedAnswer: answers[id],
        })),
        submittedAt: serverTimestamp(),
      };
      console.log(resultData);
      const resultDocRef = await addDoc(collection(db, 'quizResults'), resultData);
      console.log(quizId);
      console.log(resultDocRef.id);
      navigate(`/quizzes/${quizId}/results/${resultDocRef.id}`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <QuizIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="h4">{quiz.title}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {quiz.subject}
            </Typography>
          </Box>
        </Box>

        {quiz.questions.map((question, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {index + 1}. {question.text}
            </Typography>
            <RadioGroup
              name={`question-${index}`} // Unique name per question
              value={answers[index] || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
            >
              {question.options.map((option, i) => (
                <FormControlLabel
                  key={i}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </Box>
        ))}

        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TakeQuiz;
