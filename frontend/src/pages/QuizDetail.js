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
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// Icons
import QuizIcon from '@mui/icons-material/Quiz';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimerIcon from '@mui/icons-material/Timer';

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`quiz-tabpanel-${index}`}
      aria-labelledby={`quiz-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
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
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`/api/quizzes/${id}`);
        setQuiz(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz. Please try again later.');
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle delete dialog open
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };
  
  // Handle delete dialog close
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  // Handle delete quiz
  const handleDeleteQuiz = async () => {
    try {
      await axios.delete(`/api/quizzes/${id}`);
      handleCloseDeleteDialog();
      navigate('/quizzes');
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Failed to delete quiz. Please try again later.');
      handleCloseDeleteDialog();
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
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
          to="/quizzes"
        >
          Back to Quizzes
        </Button>
      </Container>
    );
  }
  
  if (!quiz) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Quiz not found.
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <QuizIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h4" component="h1">
                {quiz.title}
              </Typography>
            </Box>
            <Box>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
                component={RouterLink}
                to={`/quizzes/${id}/edit`}
              >
                Edit Quiz
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleOpenDeleteDialog}
              >
                Delete
              </Button>
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
              label={getDifficultyLabel(quiz.difficulty)} 
              color={getDifficultyColor(quiz.difficulty)}
            />
          </Box>
          
          <Typography variant="body1" paragraph>
            {quiz.description}
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <HelpOutlineIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  <strong>Questions:</strong> {quiz.questions?.length || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  <strong>Time Limit:</strong> {quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No time limit'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  <strong>Created:</strong> {new Date(quiz.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SchoolIcon />}
              component={RouterLink}
              to={`/quizzes/${id}/take`}
            >
              Take Quiz
            </Button>
          </Box>
        </Paper>
      </Box>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="quiz tabs">
            <Tab label="Questions" icon={<HelpOutlineIcon />} iconPosition="start" />
            <Tab label="Results" icon={<AssessmentIcon />} iconPosition="start" />
            <Tab label="History" icon={<HistoryIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Quiz Questions
          </Typography>
          
          {quiz.questions?.length === 0 ? (
            <Alert severity="info">
              No questions added to this quiz yet.
            </Alert>
          ) : (
            <List>
              {quiz.questions?.map((question, index) => (
                <Paper key={question._id || index} sx={{ mb: 3, overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2 }}>
                    <Typography variant="subtitle1">
                      Question {index + 1}: {question.text}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
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
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Your Quiz Results
          </Typography>
          
          {!quiz.results || quiz.results.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No results yet
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                You haven't taken this quiz yet.
              </Typography>
              <Button
                variant="contained"
                component={RouterLink}
                to={`/quizzes/${id}/take`}
                startIcon={<SchoolIcon />}
              >
                Take Quiz Now
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Latest Result
                    </Typography>
                    
                    {quiz.results && quiz.results.length > 0 && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 3 }}>
                          <Box
                            sx={{
                              position: 'relative',
                              display: 'inline-flex',
                            }}
                          >
                            <CircularProgress
                              variant="determinate"
                              value={Math.round((quiz.results[quiz.results.length - 1].correctAnswers / quiz.results[quiz.results.length - 1].totalQuestions) * 100)}
                              size={120}
                              thickness={5}
                              color={
                                (quiz.results[quiz.results.length - 1].correctAnswers / quiz.results[quiz.results.length - 1].totalQuestions) >= 0.7
                                  ? 'success'
                                  : (quiz.results[quiz.results.length - 1].correctAnswers / quiz.results[quiz.results.length - 1].totalQuestions) >= 0.4
                                  ? 'warning'
                                  : 'error'
                              }
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
                              }}
                            >
                              <Typography
                                variant="h5"
                                component="div"
                                color="text.secondary"
                              >
                                {Math.round((quiz.results[quiz.results.length - 1].correctAnswers / quiz.results[quiz.results.length - 1].totalQuestions) * 100)}%
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Correct Answers:
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              {quiz.results[quiz.results.length - 1].correctAnswers} / {quiz.results[quiz.results.length - 1].totalQuestions}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Date:
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              {new Date(quiz.results[quiz.results.length - 1].date).toLocaleDateString()}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Time Taken:
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              {quiz.results[quiz.results.length - 1].timeTaken ? `${Math.floor(quiz.results[quiz.results.length - 1].timeTaken / 60)}m ${quiz.results[quiz.results.length - 1].timeTaken % 60}s` : 'N/A'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/quizzes/${id}/results/${quiz.results[quiz.results.length - 1]._id}`}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Statistics
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Attempts:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {quiz.results?.length || 0}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Best Score:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {quiz.results && quiz.results.length > 0
                            ? `${Math.round(Math.max(...quiz.results.map(r => r.correctAnswers / r.totalQuestions * 100)))}%`
                            : 'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Average Score:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {quiz.results && quiz.results.length > 0
                            ? `${Math.round(quiz.results.reduce((acc, r) => acc + (r.correctAnswers / r.totalQuestions) * 100, 0) / quiz.results.length)}%`
                            : 'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          First Attempt:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {quiz.results && quiz.results.length > 0
                            ? new Date(quiz.results[0].date).toLocaleDateString()
                            : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Quiz History
          </Typography>
          
          {!quiz.results || quiz.results.length === 0 ? (
            <Alert severity="info">
              No quiz history available.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Time Taken</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quiz.results
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((result) => (
                      <TableRow key={result._id}>
                        <TableCell>{formatDate(result.date)}</TableCell>
                        <TableCell>
                          {Math.round((result.correctAnswers / result.totalQuestions) * 100)}%
                          ({result.correctAnswers}/{result.totalQuestions})
                        </TableCell>
                        <TableCell>
                          {result.timeTaken ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            component={RouterLink}
                            to={`/quizzes/${id}/results/${result._id}`}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Quiz</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this quiz? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteQuiz} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizDetail;