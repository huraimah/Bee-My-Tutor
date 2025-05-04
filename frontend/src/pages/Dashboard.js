import React, { useContext, useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';

// Icons
import DescriptionIcon from '@mui/icons-material/Description';
import EventNoteIcon from '@mui/icons-material/EventNote';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import InsightsIcon from '@mui/icons-material/Insights';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get location
  const { user, loading } = useContext(AuthContext);
  const [stats, setStats] = useState({
    materials: { count: 0, recent: [] },
    plans: { count: 0, recent: [], nextSession: null },
    quizzes: { count: 0, recent: [], averageScore: 0 },
    prediction: null,
    learningStyle: null
  });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch learning style
        const learningStyleRes = await axios.get('/api/users/learning-style');
        
        // Fetch study materials
        const materialsRes = await axios.get('/api/study/materials');
        
        // Fetch study plans
        const plansRes = await axios.get('/api/study/plans');
        
        // Fetch quizzes
        const quizzesRes = await axios.get('/api/quiz');
        
        // Fetch user stats
        const statsRes = await axios.get('/api/users/stats');
        
        // Find next study session
        let nextSession = null;
        if (plansRes.data.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Look through all plans
          for (const plan of plansRes.data) {
            // Find the first incomplete session scheduled for today or in the future
            const upcomingSession = plan.sessions.find(session => {
              const sessionDate = new Date(session.date);
              sessionDate.setHours(0, 0, 0, 0);
              return !session.completed && sessionDate >= today;
            });
            
            if (upcomingSession) {
              nextSession = {
                ...upcomingSession,
                planTitle: plan.title,
                planId: plan._id
              };
              break;
            }
          }
        }
        
        // Update stats
        setStats({
          materials: {
            count: materialsRes.data.length,
            recent: materialsRes.data.slice(0, 3)
          },
          plans: {
            count: plansRes.data.length,
            recent: plansRes.data.slice(0, 3),
            nextSession
          },
          quizzes: {
            count: quizzesRes.data.length,
            recent: quizzesRes.data.slice(0, 3),
            averageScore: statsRes.data.averageScore || 0
          },
          prediction: statsRes.data.prediction,
          learningStyle: learningStyleRes.data.learningStyle
        });
        
        setDataLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setDataLoading(false);
      }
    };
    
    if (!loading && user) {
      fetchDashboardData();
    }
  }, [loading, user, location.pathname]); // Add location.pathname as dependency

  if (loading || dataLoading) {
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

  const handleLearningStyleClick = () => {
    navigate('/learning-style');
  };
  
  // Update the button click handler
  <Button
    variant="contained"
    onClick={handleLearningStyleClick}
    startIcon={<SchoolIcon />}
  >
    {stats.learningStyle?.dominantStyle === 'unknown' ? 'Take Assessment' : 'View Details'}
  </Button>

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to your study dashboard, {user?.displayName}! 📖
      </Typography>
      
      {/* Learning Style Card */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          borderLeft: 5,
          borderColor: 'primary.main'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              Your Learning Style: {stats.learningStyle?.dominantStyle || 'Not Assessed Yet'}
            </Typography>
            {stats.learningStyle?.dominantStyle === 'unknown' ? (
              <Typography variant="body1">
                Take the learning style assessment to discover your optimal study approach.
              </Typography>
            ) : (
              <Box>
                <Typography variant="body1" paragraph>
                  Visual: {stats.learningStyle?.visual || 0}% | 
                  Auditory: {stats.learningStyle?.auditory || 0}% | 
                  Reading: {stats.learningStyle?.reading || 0}% | 
                  Kinesthetic: {stats.learningStyle?.kinesthetic || 0}%
                </Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              component={RouterLink}
              to="/learning-style-info"
              startIcon={<SchoolIcon />}
            >
              {stats.learningStyle?.dominantStyle === 'unknown' ? 'Take Assessment' : 'View Details'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={4}>
        {/* Study Materials Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <DescriptionIcon />
                </Avatar>
                <Typography variant="h5" component="div">
                  Study Materials
                </Typography>
              </Box>
              {stats.materials.recent.length > 0 ? (
                <List dense>
                  {stats.materials.recent.map((material) => (
                    <ListItem key={material._id}>
                      <ListItemIcon>
                        <DescriptionIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={material.title}
                        secondary={material.subject || 'No subject'}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No study materials uploaded yet.
                </Typography>
              )}
            </CardContent>
            <Box sx={{ flexGrow: 1 }} />
            <Divider />
            <CardActions>
              <Button
                size="small"
                component={RouterLink}
                to="/materials"
              >
                View All
              </Button>
              <Button
                size="small"
                component={RouterLink}
                to="/materials/upload"
                color="primary"
              >
                Upload New
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Study Plans Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <EventNoteIcon />
                </Avatar>
                <Typography variant="h5" component="div">
                  Study Plans
                </Typography>
              </Box>
              {stats.plans.nextSession ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Next Study Session:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      {new Date(stats.plans.nextSession.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.plans.nextSession.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {stats.plans.nextSession.duration} minutes
                    </Typography>
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/study-plans/${stats.plans.nextSession.planId}`}
                      sx={{ mt: 1 }}
                    >
                      View Plan
                    </Button>
                  </Paper>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No upcoming study sessions.
                </Typography>
              )}
            </CardContent>
            <Box sx={{ flexGrow: 1 }} />
            <Divider />
            <CardActions>
              <Button
                size="small"
                component={RouterLink}
                to="/study-plans"
              >
                View All
              </Button>
              <Button
                size="small"
                component={RouterLink}
                to="/study-plans/create"
                color="primary"
              >
                Create New
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Quizzes Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <QuizIcon />
                </Avatar>
                <Typography variant="h5" component="div">
                  Quizzes
                </Typography>
              </Box>
              {stats.quizzes.recent.length > 0 ? (
                <>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Average Score: {stats.quizzes.averageScore.toFixed(1)}%
                  </Typography>
                  <List dense>
                    {stats.quizzes.recent.map((quiz) => (
                      <ListItem key={quiz._id}>
                        <ListItemIcon>
                          {quiz.isSubmitted ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <PendingIcon color="warning" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={quiz.title}
                          secondary={
                            quiz.isSubmitted
                              ? `Score: ${quiz.result.percentage}%`
                              : 'Not submitted'
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No quizzes created yet.
                </Typography>
              )}
            </CardContent>
            <Box sx={{ flexGrow: 1 }} />
            <Divider />
            <CardActions>
              <Button
                size="small"
                component={RouterLink}
                to="/quizzes"
              >
                View All
              </Button>
              <Button
                size="small"
                component={RouterLink}
                to="/quizzes/create"
                color="primary"
              >
                Create New
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Grade Prediction Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <InsightsIcon />
                </Avatar>
                <Typography variant="h5" component="div">
                  Exam Grade Prediction
                </Typography>
              </Box>
              
              {stats.prediction ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                      <Typography variant="h6" gutterBottom>
                        Predicted Score
                      </Typography>
                      <Typography variant="h3" color="primary">
                        {stats.prediction.predictedPercentage}%
                      </Typography>
                      <Chip 
                        label={`Grade: ${stats.prediction.predictedGrade}`} 
                        color="primary" 
                        sx={{ mt: 1 }}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography variant="subtitle1" gutterBottom>
                      Strengths:
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {stats.prediction.strengths.map((strength, index) => (
                        <Chip 
                          key={index} 
                          label={strength} 
                          color="success" 
                          variant="outlined" 
                          sx={{ m: 0.5 }} 
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Areas to Improve:
                    </Typography>
                    <Box>
                      {stats.prediction.weaknesses.map((weakness, index) => (
                        <Chip 
                          key={index} 
                          label={weakness} 
                          color="warning" 
                          variant="outlined" 
                          sx={{ m: 0.5 }} 
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body1" paragraph>
                    Complete at least 2 quizzes to get your exam grade prediction.
                  </Typography>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/quizzes/create"
                    startIcon={<QuizIcon />}
                  >
                    Create a Quiz
                  </Button>
                </Box>
              )}
            </CardContent>
            {stats.prediction && (
              <>
                <Divider />
                <CardActions>
                  <Button
                    size="small"
                    component={RouterLink}
                    to="/grade-prediction"
                  >
                    View Detailed Prediction
                  </Button>
                </CardActions>
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;