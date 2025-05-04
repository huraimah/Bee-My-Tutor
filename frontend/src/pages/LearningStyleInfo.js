import React from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Import RouterLink
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card'; // Import Card
import CardContent from '@mui/material/CardContent'; // Import CardContent
import Grid from '@mui/material/Grid'; // Import Grid
import Button from '@mui/material/Button'; // Import Button
import PsychologyIcon from '@mui/icons-material/Psychology'; // Import Icon

const LearningStyleInfo = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ my: 4, textAlign: 'center' }}> {/* Center the main title */}
        <Typography variant="h3" component="h1" gutterBottom> {/* Larger title */}
          What is Your Learning Style?
        </Typography>
        <Typography variant="body1" paragraph sx={{ maxWidth: 800, mx: 'auto' }}> {/* Center and limit width */}
          Learning styles refer to the various ways individuals approach learning. Understanding your dominant learning style can help you tailor your study methods to be more effective and efficient. While there are many models, common learning styles include Visual, Auditory, Reading/Writing, and Kinesthetic (VARK).
        </Typography>
      </Box>

      <Grid container spacing={4}> {/* Use Grid for layout */}
        {/* Visual Learners Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', bgcolor: '#e3f2fd' }}> {/* Light blue background */}
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PsychologyIcon color="primary" sx={{ mr: 1 }} /> Visual Learners
              </Typography>
              <Typography variant="body1">
                Visual learners prefer to see information presented in charts, graphs, diagrams, and other visual aids. They often benefit from using flashcards, highlighting notes, and watching videos.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Auditory Learners Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', bgcolor: '#fff3e0' }}> {/* Light orange background */}
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PsychologyIcon color="primary" sx={{ mr: 1 }} /> Auditory Learners
              </Typography>
              <Typography variant="body1">
                Auditory learners learn best by hearing information. They may benefit from listening to lectures, participating in discussions, recording notes to listen to later, and using mnemonics.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Reading/Writing Learners Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', bgcolor: '#e8f5e9' }}> {/* Light green background */}
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PsychologyIcon color="primary" sx={{ mr: 1 }} /> Reading/Writing Learners
              </Typography>
              <Typography variant="body1">
                Reading/Writing learners prefer to process information through text. They often excel at taking detailed notes, reading textbooks, writing summaries, and creating lists.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Kinesthetic Learners Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', bgcolor: '#ffcdd2' }}> {/* Light red/pink background */}
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PsychologyIcon color="primary" sx={{ mr: 1 }} /> Kinesthetic Learners
              </Typography>
              <Typography variant="body1">
                Kinesthetic learners learn by doing and experiencing. They benefit from hands-on activities, experiments, role-playing, and taking breaks to move around.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}> {/* Box for the button */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Note: Most people have a combination of learning styles, but often have one or two dominant preferences.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={RouterLink}
          to="/learning-style" // Link to the assessment page
          startIcon={<PsychologyIcon />}
        >
          Take the 10-Minute Learning Style Quiz
        </Button>
      </Box>
    </Container>
  );
};

export default LearningStyleInfo;