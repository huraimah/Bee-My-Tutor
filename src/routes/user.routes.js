const express = require('express');
const router = express.Router();
const { 
  updateProfile, 
  saveLearningStyle, 
  getLearningStyle,
  getUserStats
} = require('../controllers/user.controller');
const auth = require('../middleware/auth');

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateProfile);

// @route   POST api/users/learning-style
// @desc    Save user learning style assessment results
// @access  Private
router.post('/learning-style', auth, saveLearningStyle);

// @route   GET api/users/learning-style
// @desc    Get user learning style
// @access  Private
router.get('/learning-style', auth, getLearningStyle);

// @route   GET api/users/stats
// @desc    Get user statistics and predictions
// @access  Private
router.get('/stats', auth, getUserStats);

module.exports = router;