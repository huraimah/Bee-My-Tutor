import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// MUI components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import QuizIcon from '@mui/icons-material/Quiz';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/quizzes`);
        setQuizzes(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load quizzes. Please try again later.');
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleFilterSelect = (subject) => {
    setSelectedSubject(subject);
    handleFilterClose();
  };

  const handleSortSelect = (sortOption) => {
    setSortBy(sortOption);
    handleSortClose();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteQuiz = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/quizzes/${id}`);
        setQuizzes(quizzes.filter(quiz => quiz._id !== id));
      } catch (err) {
        console.error('Error deleting quiz:', err);
        setError('Failed to delete quiz. Please try again later.');
      }
    }
  };

  // Calculate quiz score percentage
  const calculateScore = (quiz) => {
    if (!quiz.results || quiz.results.length === 0) return null;
    const latestResult = quiz.results[quiz.results.length - 1];
    return Math.round((latestResult.correctAnswers / latestResult.totalQuestions) * 100);
  };

  // Filter and sort quizzes
  const filteredQuizzes = quizzes
    .filter(quiz => 
      (selectedSubject === 'All' || quiz.subject === selectedSubject) &&
      (quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'difficulty') {
        return b.difficulty - a.difficulty;
      }
      return 0;
    });

  // Get unique subjects for filter
  const subjects = ['All', ...new Set(quizzes.map(quiz => quiz.subject))];

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Quizzes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/quizzes/create"
        >
          Create Quiz
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
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
              ),
            }}
          />
          
          <Box>
            <Button
              startIcon={<FilterListIcon />}
              onClick={handleFilterClick}
              variant="outlined"
              size="medium"
              sx={{ mr: 1 }}
            >
              Filter
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
            >
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
            
            <Button
              startIcon={<SortIcon />}
              onClick={handleSortClick}
              variant="outlined"
              size="medium"
            >
              Sort
            </Button>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
            >
              <MenuItem
                onClick={() => handleSortSelect('newest')}
                selected={sortBy === 'newest'}
              >
                Newest First
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect('oldest')}
                selected={sortBy === 'oldest'}
              >
                Oldest First
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect('alphabetical')}
                selected={sortBy === 'alphabetical'}
              >
                Alphabetical
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect('difficulty')}
                selected={sortBy === 'difficulty'}
              >
                Difficulty (Hardest First)
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {selectedSubject !== 'All' && (
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`Subject: ${selectedSubject}`} 
              onDelete={() => setSelectedSubject('All')} 
              color="primary" 
              variant="outlined" 
            />
          </Box>
        )}
      </Paper>

      {filteredQuizzes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No quizzes found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {quizzes.length === 0 
              ? "You haven't created any quizzes yet." 
              : "No quizzes match your search criteria."}
          </Typography>
          {quizzes.length === 0 && (
            <Button
              variant="contained"
              component={RouterLink}
              to="/quizzes/create"
              startIcon={<AddIcon />}
            >
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {quiz.title}
                      </Typography>
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={quiz.subject} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ mr: 1 }} 
                      />
                      <Chip 
                        label={getDifficultyLabel(quiz.difficulty)} 
                        size="small" 
                        color={getDifficultyColor(quiz.difficulty)}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {quiz.description.length > 100 
                        ? `${quiz.description.substring(0, 100)}...` 
                        : quiz.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <HelpOutlineIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {quiz.questions?.length || 0} Questions
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No time limit'}
                      </Typography>
                    </Box>
                    
                    {score !== null && (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Last Score
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {score}%
                          </Typography>
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
                    <Button 
                      size="small" 
                      component={RouterLink} 
                      to={`/quizzes/${quiz._id}`}
                    >
                      View
                    </Button>
                    <Button 
                      size="small" 
                      color="primary"
                      component={RouterLink}
                      to={`/quizzes/${quiz._id}/take`}
                      startIcon={<SchoolIcon />}
                    >
                      Take Quiz
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteQuiz(quiz._id)}
                    >
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