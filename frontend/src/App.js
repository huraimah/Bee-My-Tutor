import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import PrivateRoute from './components/routing/PrivateRoute';
import Navbar from './components/layout/Navbar';
import Alert from './components/layout/Alert';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LearningStyleAssessment from './pages/LearningStyleAssessment';
import StudyMaterials from './pages/StudyMaterials';
import UploadMaterial from './pages/UploadMaterial';
import StudyPlans from './pages/StudyPlans';
import StudyPlanDetail from './pages/StudyPlanDetail';
import CreateStudyPlan from './pages/CreateStudyPlan';
import Quizzes from './pages/Quizzes';
import QuizDetail from './pages/QuizDetail';
import CreateQuiz from './pages/CreateQuiz';
import QuizResults from './pages/QuizResults';
import GradePrediction from './pages/GradePrediction';
import NotFound from './pages/NotFound';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Alert />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            {/* Private Routes */}
            <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
            <Route path="/learning-style" element={<PrivateRoute component={LearningStyleAssessment} />} />
            
            {/* Study Materials Routes */}
            <Route path="/materials" element={<PrivateRoute component={StudyMaterials} />} />
            <Route path="/materials/upload" element={<PrivateRoute component={UploadMaterial} />} />
            
            {/* Study Plans Routes */}
            <Route path="/study-plans" element={<PrivateRoute component={StudyPlans} />} />
            <Route path="/study-plans/:id" element={<PrivateRoute component={StudyPlanDetail} />} />
            <Route path="/study-plans/create" element={<PrivateRoute component={CreateStudyPlan} />} />
            
            {/* Quiz Routes */}
            <Route path="/quizzes" element={<PrivateRoute component={Quizzes} />} />
            <Route path="/quizzes/:id" element={<PrivateRoute component={QuizDetail} />} />
            <Route path="/quizzes/create" element={<PrivateRoute component={CreateQuiz} />} />
            <Route path="/quiz-results" element={<PrivateRoute component={QuizResults} />} />
            <Route path="/grade-prediction" element={<PrivateRoute component={GradePrediction} />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;