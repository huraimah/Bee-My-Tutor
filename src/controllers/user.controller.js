const User = require('../models/User');
const Quiz = require('../models/Quiz');
const geminiService = require('../services/gemini.service');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (email) profileFields.email = email;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Save user learning style assessment results
// @route   POST /api/users/learning-style
// @access  Private
exports.saveLearningStyle = async (req, res) => {
  try {
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ msg: 'Invalid assessment data' });
    }
    
    // Count scores for each learning style
    const scores = {
      visual: 0,
      auditory: 0,
      reading: 0,
      kinesthetic: 0
    };
    
    // Process answers
    answers.forEach(answer => {
      if (answer.style && scores.hasOwnProperty(answer.style)) {
        scores[answer.style]++;
      }
    });
    
    // Get analysis from Gemini API
    const analysis = await geminiService.analyzeLearningStyle(answers);
    
    // Update user's learning style
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'learningStyle.visual': scores.visual,
          'learningStyle.auditory': scores.auditory,
          'learningStyle.reading': scores.reading,
          'learningStyle.kinesthetic': scores.kinesthetic,
          'learningStyle.dominantStyle': analysis.dominantStyle
        }
      },
      { new: true }
    ).select('-password');
    
    // Return user with updated learning style and analysis
    res.json({
      user,
      analysis
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get user learning style
// @route   GET /api/users/learning-style
// @access  Private
exports.getLearningStyle = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('learningStyle');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if learning style assessment has been completed
    if (user.learningStyle.dominantStyle === 'unknown') {
      // Generate a new learning style assessment
      const assessment = await geminiService.generateLearningStyleAssessment();
      return res.json({
        learningStyle: user.learningStyle,
        assessment,
        isCompleted: false
      });
    }
    
    res.json({
      learningStyle: user.learningStyle,
      isCompleted: true
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get user statistics and predictions
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    // Get user's quiz results
    const quizResults = await Quiz.find({
      user: req.user.id,
      isSubmitted: true
    }).select('title totalPoints result.score result.percentage result.completedAt');
    
    if (quizResults.length === 0) {
      return res.json({
        quizCount: 0,
        averageScore: 0,
        prediction: null,
        message: 'Complete some quizzes to get predictions'
      });
    }
    
    // Calculate average score
    const totalPercentage = quizResults.reduce((sum, quiz) => sum + quiz.result.percentage, 0);
    const averageScore = totalPercentage / quizResults.length;
    
    // Get prediction if there are enough quiz results
    let prediction = null;
    if (quizResults.length >= 2) {
      prediction = await geminiService.predictExamGrade(quizResults);
    }
    
    res.json({
      quizCount: quizResults.length,
      averageScore,
      recentQuizzes: quizResults.slice(-5), // Last 5 quizzes
      prediction
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};