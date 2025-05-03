import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DescriptionIcon from '@mui/icons-material/Description';
import EventNoteIcon from '@mui/icons-material/EventNote';
import QuizIcon from '@mui/icons-material/Quiz';
import InsightsIcon from '@mui/icons-material/Insights';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                component="h1"
                variant="h2"
                color="inherit"
                gutterBottom
              >
                EduGenius
              </Typography>
              <Typography
                variant="h5"
                color="inherit"
                paragraph
                sx={{ mb: 4 }}
              >
                Personalized learning powered by AI. Discover your learning style, organize study materials, create tailored study plans, and test your knowledge with AI-generated quizzes.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={RouterLink}
                  to="/register"
                  sx={{ mr: 2, mb: 2 }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={RouterLink}
                  to="/login"
                  sx={{ mb: 2 }}
                >
                  Login
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                <SchoolIcon sx={{ fontSize: 200, opacity: 0.8 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography
          component="h2"
          variant="h3"
          align="center"
          color="textPrimary"
          gutterBottom
        >
          Key Features
        </Typography>
        <Typography variant="h5" align="center" color="textSecondary" paragraph>
          EduGenius helps you study smarter, not harder.
        </Typography>
        <Divider sx={{ my: 4 }} />

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Learning Style Assessment */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <PsychologyIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="div">
                  Learning Style Assessment
                </Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body1" paragraph>
                  Discover your unique learning style through our comprehensive assessment. Identify whether you're a visual, auditory, reading, or kinesthetic learner.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Our AI analyzes your responses to determine your optimal learning approach, helping you study more effectively.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Study Material Management */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  bgcolor: 'secondary.light',
                  color: 'secondary.contrastText',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <DescriptionIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="div">
                  Study Material Management
                </Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body1" paragraph>
                  Upload and organize your study materials in PDF or DOCX format. Our AI automatically extracts key points, summaries, and metadata.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  All your study materials are organized in one place, making it easy to find what you need when you need it.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Personalized Study Plans */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  bgcolor: 'success.light',
                  color: 'success.contrastText',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <EventNoteIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="div">
                  Personalized Study Plans
                </Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body1" paragraph>
                  Generate study plans tailored to your learning style and upcoming exam deadlines. Our AI creates a schedule that optimizes your study time.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Track your progress, mark completed sessions, and adjust your plan as needed to stay on track.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Interactive Quizzes */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  bgcolor: 'warning.light',
                  color: 'warning.contrastText',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <QuizIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="div">
                  Interactive Quizzes
                </Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body1" paragraph>
                  Create AI-generated quizzes based on your study materials. Test your knowledge with multiple-choice, true/false, and short-answer questions.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Our AI analyzes your uploaded materials to create relevant questions that test your understanding of the content.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Grade Prediction */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  bgcolor: 'info.light',
                  color: 'info.contrastText',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <InsightsIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="div">
                  Grade Prediction
                </Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body1" paragraph>
                  Predict your exam performance based on quiz results and study progress. Our AI identifies your strengths and areas for improvement.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Get personalized recommendations to improve your understanding of challenging topics and boost your confidence before exams.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8, mb: 8 }}>
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="textPrimary"
            gutterBottom
          >
            How It Works
          </Typography>
          <Divider sx={{ my: 4 }} />

          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom align="center">
                  Step 1
                </Typography>
                <Typography variant="body1" paragraph align="center">
                  Take the learning style assessment to discover your unique learning preferences.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom align="center">
                  Step 2
                </Typography>
                <Typography variant="body1" paragraph align="center">
                  Upload your study materials and let our AI analyze and organize them.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom align="center">
                  Step 3
                </Typography>
                <Typography variant="body1" paragraph align="center">
                  Create personalized study plans and quizzes tailored to your learning style.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ mb: 8 }}>
        <Paper
          sx={{
            p: 4,
            bgcolor: 'primary.main',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" gutterBottom>
            Ready to transform your learning experience?
          </Typography>
          <Typography variant="body1" paragraph>
            Join EduGenius today and discover a smarter way to study.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={RouterLink}
            to="/register"
            sx={{ mt: 2 }}
          >
            Get Started Now
          </Button>
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body1" align="center">
            © {new Date().getFullYear()} EduGenius. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </>
  );
};

export default Home;