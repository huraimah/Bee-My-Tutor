import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

// MUI components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HearingIcon from '@mui/icons-material/Hearing';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SportsHandballIcon from '@mui/icons-material/SportsHandball';

const LearningStyleAssessment = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const hardcodedAssessment = {
    questions: [
      {
        id: 1,
        text: "When learning something new, you prefer to...",
        options: [
          { id: "A", text: "Watch a video or see a diagram explaining it", style: "visual" },
          { id: "B", text: "Have someone explain it to you out loud", style: "auditory" },
          { id: "C", text: "Read a detailed description or written explanation", style: "reading" },
          { id: "D", text: "Try it out for yourself or work with it physically", style: "kinesthetic" },
        ],
      },
      {
        id: 2,
        text: "When someone gives you a list of items, you...",
        options: [
          { id: "A", text: "Picture them in your head", style: "visual" },
          { id: "B", text: "Say them out loud or repeat them to yourself", style: "auditory" },
          { id: "C", text: "Write them down or read them repeatedly", style: "reading" },
          { id: "D", text: "Use your fingers to count or move around as you memorize", style: "kinesthetic" },
        ],
      },
      {
        id: 3,
        text: "In a class or lecture, what keeps your attention best?",
        options: [
          { id: "A", text: "Visuals like charts, graphs, and images", style: "visual" },
          { id: "B", text: "A speaker with a clear, engaging voice", style: "auditory" },
          { id: "C", text: "Reading slides or writing notes", style: "reading" },
          { id: "D", text: "Interactive activities or hands-on demos", style: "kinesthetic" },
        ],
      },
      {
        id: 4,
        text: "If you're assembling furniture, what do you rely on most?",
        options: [
          { id: "A", text: "Diagrams and images", style: "visual" },
          { id: "B", text: "A YouTube video with verbal instructions", style: "auditory" },
          { id: "C", text: "Written step-by-step instructions", style: "reading" },
          { id: "D", text: "Trial and error – just getting into it", style: "kinesthetic" },
        ],
      },
      {
        id: 5,
        text: "When you don’t know how to spell a word, you...",
        options: [
          { id: "A", text: "Picture how the word looks", style: "visual" },
          { id: "B", text: "Sound it out", style: "auditory" },
          { id: "C", text: "Write it down to see if it “looks right”", style: "reading" },
          { id: "D", text: "Trace it with your finger or type it", style: "kinesthetic" },
        ],
      },
      {
        id: 6,
        text: "When you want to remember a phone number, you...",
        options: [
          { id: "A", text: "Visualize it in chunks (e.g., 647–888–1234)", style: "visual" },
          { id: "B", text: "Repeat it out loud several times", style: "auditory" },
          { id: "C", text: "Write it down or type it into notes", style: "reading" },
          { id: "D", text: "Dial it a few times to remember how it “feels”", style: "kinesthetic" },
        ],
      },
      {
        id: 7,
        text: "Your favourite way to take notes is...",
        options: [
          { id: "A", text: "Use arrows, symbols, and draw diagrams", style: "visual" },
          { id: "B", text: "Record yourself or talk through ideas with someone", style: "auditory" },
          { id: "C", text: "Write organized bullet points or summaries", style: "reading" },
          { id: "D", text: "Use flashcards, hands-on apps, or create movement-based study tools", style: "kinesthetic" },
        ],
      },
      {
        id: 8,
        text: "You’ve just received a new phone. What do you do first?",
        options: [
          { id: "A", text: "Look at the icons and explore menus visually", style: "visual" },
          { id: "B", text: "Ask a friend to explain how to use it", style: "auditory" },
          { id: "C", text: "Read the user manual or online FAQ", style: "reading" },
          { id: "D", text: "Start pressing buttons to figure it out on your own", style: "kinesthetic" },
        ],
      },
      {
        id: 9,
        text: "When remembering past experiences, you recall...",
        options: [
          { id: "A", text: "What things looked like", style: "visual" },
          { id: "B", text: "What was said or heard", style: "auditory" },
          { id: "C", text: "A written message, story, or script", style: "reading" },
          { id: "D", text: "What you physically did or how you felt", style: "kinesthetic" },
        ],
      },
      {
        id: 10,
        text: "You prefer teachers or instructors who...",
        options: [
          { id: "A", text: "Use visual aids and handouts", style: "visual" },
          { id: "B", text: "Explain concepts clearly and answer questions out loud", style: "auditory" },
          { id: "C", text: "Give structured reading assignments and notes", style: "reading" },
          { id: "D", text: "Incorporate lab work, experiments, or activities", style: "kinesthetic" },
        ],
      },
      {
        id: 11,
        text: "You learn a new word best when you...",
        options: [
          { id: "A", text: "See it written in a sentence or image", style: "visual" },
          { id: "B", text: "Hear someone pronounce and explain it", style: "auditory" },
          { id: "C", text: "Look it up and write it down with its meaning", style: "reading" },
          { id: "D", text: "Use it in a sentence or role-play", style: "kinesthetic" },
        ],
      },
      {
        id: 12,
        text: "Your ideal study session involves...",
        options: [
          { id: "A", text: "Watching videos or using colorful study guides", style: "visual" },
          { id: "B", text: "Reading notes aloud or listening to podcasts", style: "auditory" },
          { id: "C", text: "Rewriting notes and reading textbooks", style: "reading" },
          { id: "D", text: "Doing practice problems or creating models", style: "kinesthetic" },
        ],
      },
      {
        id: 13,
        text: "When learning a dance or movement, you prefer...",
        options: [
          { id: "A", text: "Watch someone else do it first", style: "visual" },
          { id: "B", text: "Listen to the rhythm and instructions", style: "auditory" },
          { id: "C", text: "Read a written breakdown of the steps", style: "reading" },
          { id: "D", text: "Try the moves yourself and adjust based on how it feels", style: "kinesthetic" },
        ],
      },
      {
        id: 14,
        text: "You remember best when...",
        options: [
          { id: "A", text: "You can visualize it in your head", style: "visual" },
          { id: "B", text: "You hear it in a conversation or lecture", style: "auditory" },
          { id: "C", text: "You’ve read it and written it down", style: "reading" },
          { id: "D", text: "You’ve physically done it or acted it out", style: "kinesthetic" },
        ],
      },
      {
        id: 15,
        text: "You find it hardest to learn when...",
        options: [
          { id: "A", text: "There are no visuals or demonstrations", style: "visual" },
          { id: "B", text: "There’s no opportunity to hear explanations", style: "auditory" },
          { id: "C", text: "Nothing is written down", style: "reading" },
          { id: "D", text: "You can’t move, interact, or experiment with the material", style: "kinesthetic" },
        ],
      },
    ],
  };

  useEffect(() => {
    // Use hardcoded assessment instead of generating
    setAssessment(hardcodedAssessment);
    setAnswers(new Array(hardcodedAssessment.questions.length).fill(null));
    setLoading(false);
  }, []);
  
  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };
  
  const handleNext = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (answers.includes(null)) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      // Local analysis based on hardcoded questions
      const styleCounts = { visual: 0, auditory: 0, reading: 0, kinesthetic: 0 };
      const totalQuestions = assessment.questions.length;

      answers.forEach((answer, index) => {
        const question = assessment.questions[index];
        const selectedOption = question.options.find(option => option.id === answer);
        if (selectedOption && selectedOption.style) {
          styleCounts[selectedOption.style]++;
        }
      });

      const learningStylePercentages = {
        visual: Math.round((styleCounts.visual / totalQuestions) * 100),
        auditory: Math.round((styleCounts.auditory / totalQuestions) * 100),
        reading: Math.round((styleCounts.reading / totalQuestions) * 100),
        kinesthetic: Math.round((styleCounts.kinesthetic / totalQuestions) * 100),
      };

      const dominantStyle = Object.keys(learningStylePercentages).reduce((a, b) =>
        learningStylePercentages[a] > learningStylePercentages[b] ? a : b
      );

      // Hardcoded analysis and strategies based on dominant style
      let analysisDetails = {
        explanation: "Based on your responses, your dominant learning style is [Dominant Style]. This means you tend to learn best through methods associated with this style.",
        strategies: [],
        adaptations: "Consider adapting your study materials to align with your dominant style. For example, [Adaptation Suggestion]."
      };

      switch (dominantStyle) {
        case 'visual':
          analysisDetails.explanation = analysisDetails.explanation.replace('[Dominant Style]', 'Visual');
          analysisDetails.strategies = [
            "Use diagrams, charts, and maps to organize information.",
            "Highlight important points in different colors.",
            "Watch videos and use visual presentations.",
            "Create flashcards with images.",
          ];
          analysisDetails.adaptations = analysisDetails.adaptations.replace('[Adaptation Suggestion]', 'turn notes into diagrams or mind maps');
          break;
        case 'auditory':
          analysisDetails.explanation = analysisDetails.explanation.replace('[Dominant Style]', 'Auditory');
          analysisDetails.strategies = [
            "Listen to lectures and participate in discussions.",
            "Read notes aloud or record them to listen later.",
            "Use mnemonics and rhymes.",
            "Study with a partner and explain concepts to each other.",
          ];
          analysisDetails.adaptations = analysisDetails.adaptations.replace('[Adaptation Suggestion]', 'read textbooks aloud or find audio summaries');
          break;
        case 'reading':
          analysisDetails.explanation = analysisDetails.explanation.replace('[Dominant Style]', 'Reading/Writing');
          analysisDetails.strategies = [
            "Take detailed notes and rewrite them.",
            "Read textbooks and articles carefully.",
            "Create summaries and outlines.",
            "Use lists and headings to structure information.",
          ];
          analysisDetails.adaptations = analysisDetails.adaptations.replace('[Adaptation Suggestion]', 'summarize lectures and create written study guides');
          break;
        case 'kinesthetic':
          analysisDetails.explanation = analysisDetails.explanation.replace('[Dominant Style]', 'Kinesthetic');
          analysisDetails.strategies = [
            "Engage in hands-on activities and experiments.",
            "Take breaks to move around.",
            "Use flashcards and interactive apps.",
            "Role-play or act out concepts.",
          ];
          analysisDetails.adaptations = analysisDetails.adaptations.replace('[Adaptation Suggestion]', 'use physical models or practice problems');
          break;
        default:
          break;
      }


      // Save results to Firestore
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          learningStyle: {
            ...learningStylePercentages,
            dominantStyle: dominantStyle
          },
          assessmentCompleted: true,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }

      setResult({
        learningStyle: {
          ...learningStylePercentages,
          dominantStyle: dominantStyle
        },
        analysis: analysisDetails
      });
    } catch (err) {
      console.error('Error analyzing assessment:', err);
      setError('Failed to analyze results. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const getStyleIcon = (style) => {
    switch (style) {
      case 'visual':
        return <VisibilityIcon />;
      case 'auditory':
        return <HearingIcon />;
      case 'reading':
        return <MenuBookIcon />;
      case 'kinesthetic':
        return <SportsHandballIcon />;
      default:
        return null;
    }
  };
  
  const getStyleColor = (style) => {
    switch (style) {
      case 'visual':
        return 'primary';
      case 'auditory':
        return 'secondary';
      case 'reading':
        return 'success';
      case 'kinesthetic':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const getStyleClassName = (style) => {
    switch (style) {
      case 'visual':
        return 'learning-style-visual';
      case 'auditory':
        return 'learning-style-auditory';
      case 'reading':
        return 'learning-style-reading';
      case 'kinesthetic':
        return 'learning-style-kinesthetic';
      default:
        return '';
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
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (result) {
    // Show results
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Your Learning Style Results
        </Typography>
        
        <Box sx={{ mt: 4, mb: 6 }}>
          <Alert severity="success" sx={{ mb: 4 }}>
            <AlertTitle>Assessment Complete</AlertTitle>
            Based on your responses, we've identified your learning style preferences.
          </Alert>
          
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Your Dominant Learning Style: 
              <Chip 
                label={result.learningStyle.dominantStyle.toUpperCase()} 
                color={getStyleColor(result.learningStyle.dominantStyle)}
                icon={getStyleIcon(result.learningStyle.dominantStyle)}
                sx={{ ml: 2 }}
              />
            </Typography>
            
            <Box sx={{ mt: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Your Learning Style Breakdown:
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={3}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText'
                    }}
                  >
                    <VisibilityIcon />
                    <Typography variant="h6">Visual</Typography>
                    <Typography variant="h4">{result.learningStyle.visual}%</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: 'secondary.light',
                      color: 'secondary.contrastText'
                    }}
                  >
                    <HearingIcon />
                    <Typography variant="h6">Auditory</Typography>
                    <Typography variant="h4">{result.learningStyle.auditory}%</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: 'success.light',
                      color: 'success.contrastText'
                    }}
                  >
                    <MenuBookIcon />
                    <Typography variant="h6">Reading</Typography>
                    <Typography variant="h4">{result.learningStyle.reading}%</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: 'warning.light',
                      color: 'warning.contrastText'
                    }}
                  >
                    <SportsHandballIcon />
                    <Typography variant="h6">Kinesthetic</Typography>
                    <Typography variant="h4">{result.learningStyle.kinesthetic}%</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          
          {result.analysis && (
            <Card className={getStyleClassName(result.learningStyle.dominantStyle)}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  What this means for you:
                </Typography>
                <Typography variant="body1" paragraph>
                  {result.analysis.explanation}
                </Typography>
                
                <Typography variant="h6" gutterBottom>
                  Recommended Study Strategies:
                </Typography>
                <List>
                  {result.analysis.strategies.map((strategy, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon color={getStyleColor(result.learningStyle.dominantStyle)} />
                      </ListItemIcon>
                      <ListItemText primary={strategy} />
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  How to Adapt Materials:
                </Typography>
                <Typography variant="body1">
                  {result.analysis.adaptations}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/study-plans/create')}
          >
            Create Study Plan
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Show assessment
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Learning Style Assessment
      </Typography>
      <Typography variant="body1" paragraph align="center">
        Answer these questions to discover your optimal learning style.
        This AI-powered assessment will analyze your responses to provide personalized recommendations.
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Stepper activeStep={currentQuestion} alternativeLabel sx={{ mb: 4 }}>
          {assessment.questions.map((_, index) => (
            <Step key={index}>
              <StepLabel>{index + 1}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box>
          <Typography variant="h6" gutterBottom>
            Question {currentQuestion + 1} of {assessment.questions.length}
          </Typography>
          <Typography variant="body1" paragraph>
            {assessment.questions[currentQuestion].text}
          </Typography>
          
          <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
            <FormLabel component="legend">Select the option that best describes you:</FormLabel>
            <RadioGroup
              value={answers[currentQuestion] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
            >
              {assessment.questions[currentQuestion].options.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={option.text}
                  sx={{ mb: 1 }}
                />
              ))}
            </RadioGroup>
          </FormControl>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={currentQuestion === 0}
            >
              Back
            </Button>
            
            {currentQuestion < assessment.questions.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={answers[currentQuestion] === null}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={answers[currentQuestion] === null || submitting}
                startIcon={submitting && <CircularProgress size={20} />}
              >
                {submitting ? 'Analyzing...' : 'Submit'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LearningStyleAssessment;