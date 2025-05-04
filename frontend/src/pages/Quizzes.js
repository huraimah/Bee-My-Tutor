import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../utils/firebase'; 

// MUI components
import {
  Box, Container, Typography, Grid, Card, CardContent,
  CardActions, Button, Divider, CircularProgress, TextField,
  InputAdornment, IconButton, Chip, Menu, MenuItem, Paper,
  Alert, LinearProgress
} from '@mui/material';

// Icons
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Quiz as QuizIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';

const Quizzes = () => {
  const { user } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user) return;

      try {
        const q = query(collection(db, 'quizzes'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const quizzesData = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          _id: doc.id
        }));

        setQuizzes(quizzesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load quizzes. Please try again later.');
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [user]);

  const handleFilterClick = (event) => setFilterAnchorEl(event.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);
  const handleSortClick = (event) => setSortAnchorEl(event.currentTarget);
  const handleSortClose = () => setSortAnchorEl(null);
  const handleFilterSelect = (subject) => {
    setSelectedSubject(subject);
    handleFilterClose();
  };
  const handleSortSelect = (sortOption) => {
    setSortBy(sortOption);
    handleSortClose();
  };
  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleDeleteQuiz = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        // You’ll need to implement Firestore delete logic here
        // e.g. await deleteDoc(doc(db, 'quizzes', id));
        console.warn('Delete functionality not implemented yet.');
      } catch (err) {
        console.error('Error deleting quiz:', err);
        setError('Failed to delete quiz. Please try again later.');
      }
    }
  };

  const calculateScore = (quiz) => {
    if (!quiz.results || quiz.results.length === 0) return null;
    const latestResult = quiz.results[quiz.results.length - 1];
    return Math.round((latestResult.correctAnswers / latestResult.totalQuestions) * 100);
  };

  const filteredQuizzes = quizzes
    .filter(quiz =>
      (selectedSubject === 'All' || quiz.subject === selectedSubject) &&
      (quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
      if (sortBy === 'difficulty') return b.difficulty - a.difficulty;
      return 0;
    });

  const subjects = ['All', ...new Set(quizzes.map(quiz => quiz.subject))];

  const getDifficultyLabel = (level) => ({
    1: 'Easy',
    2: 'Medium',
    3: 'Hard'
  }[level] || 'Medium');

  const getDifficultyColor = (level) => ({
    1: 'success',
    2: 'warning',
    3: 'error'
  }[level] || 'warning');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Quizzes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/quizzes/create"
        >
          Create Quiz
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 4 }}>
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
          <TextField
            placeholder="Search quizzes..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <Box>
            <Button startIcon={<FilterListIcon />} onClick={handleFilterClick} variant="outlined" sx={{ mr: 1 }}>
              Filter
            </Button>
            <Menu anchorEl={filterAnchorEl} open={Boolean(filterAnchorEl)} onClose={handleFilterClose}>
              {subjects.map((subject) => (
                <MenuItem
                  key={subject}
                  onClick={() => handleFilterSelect(subject)}
                  selected={selectedSubject === subject}
                >
                  {subject}
                </MenuItem>
              ))}
            </Menu>
            <Button startIcon={<SortIcon />} onClick={handleSortClick} variant="outlined">
              Sort
            </Button>
            <Menu anchorEl={sortAnchorEl} open={Boolean(sortAnchorEl)} onClose={handleSortClose}>
              <MenuItem onClick={() => handleSortSelect('newest')} selected={sortBy === 'newest'}>Newest First</MenuItem>
              <MenuItem onClick={() => handleSortSelect('oldest')} selected={sortBy === 'oldest'}>Oldest First</MenuItem>
              <MenuItem onClick={() => handleSortSelect('alphabetical')} selected={sortBy === 'alphabetical'}>Alphabetical</MenuItem>
              <MenuItem onClick={() => handleSortSelect('difficulty')} selected={sortBy === 'difficulty'}>Difficulty (Hardest First)</MenuItem>
            </Menu>
          </Box>
        </Box>

        {selectedSubject !== 'All' && (
          <Box mt={2}>
            <Chip label={`Subject: ${selectedSubject}`} onDelete={() => setSelectedSubject('All')} color="primary" variant="outlined" />
          </Box>
        )}
      </Paper>

      {filteredQuizzes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No quizzes found</Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {quizzes.length === 0
              ? "You haven't created any quizzes yet."
              : "No quizzes match your search criteria."}
          </Typography>
          {quizzes.length === 0 && (
            <Button variant="contained" component={RouterLink} to="/quizzes/create" startIcon={<AddIcon />}>
              Create Your First Quiz
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredQuizzes.map((quiz) => {
            const score = calculateScore(quiz);
            return (
              <Grid item xs={12} md={6} lg={4} key={quiz._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6">{quiz.title}</Typography>
                      <IconButton size="small"><MoreVertIcon /></IconButton>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Chip label={quiz.subject} size="small" color="primary" variant="outlined" sx={{ mr: 1 }} />
                      <Chip label={getDifficultyLabel(quiz.difficulty)} size="small" color={getDifficultyColor(quiz.difficulty)} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {quiz.description.length > 100 ? `${quiz.description.substring(0, 100)}...` : quiz.description}
                    </Typography>
                    <Box display="flex" alignItems="center" mb={1}>
                      <HelpOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">{quiz.questions?.length || 0} Questions</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No time limit'}
                      </Typography>
                    </Box>
                    {score !== null && (
                      <Box mt={2}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2" color="text.secondary">Last Score</Typography>
                          <Typography variant="body2" color="text.secondary">{score}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={score}
                          color={score >= 70 ? 'success' : score >= 40 ? 'warning' : 'error'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    )}
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button size="small" component={RouterLink} to={`/quizzes/${quiz._id}`}>View</Button>
                    <Button size="small" color="primary" component={RouterLink} to={`/quizzes/${quiz._id}/take`} startIcon={<SchoolIcon />}>
                      Take Quiz
                    </Button>
                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteQuiz(quiz._id)}>
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default Quizzes;
