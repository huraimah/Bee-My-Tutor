const express = require('express');
const router = express.Router();
const { 
  generateQuiz, 
  getQuizzes, 
  getQuiz,
  submitQuiz,
  editQuiz,
  deleteQuiz,
  getQuizResults,
  predictGrade
} = require('../controllers/quiz.controller');
const auth = require('../middleware/auth');

// @route   POST api/quiz
// @desc    Generate a quiz based on study materials
// @access  Private
router.post('/', auth, generateQuiz);

// @route   GET api/quiz
// @desc    Get all user's quizzes
// @access  Private
router.get('/', auth, getQuizzes);

// @route   GET api/quiz/:id
// @desc    Get a specific quiz
// @access  Private
router.get('/:id', auth, getQuiz);

// @route   PUT api/quiz/:id
// @desc    Edit a quiz (before submission)
// @access  Private
router.put('/:id', auth, editQuiz);

// @route   DELETE api/quiz/:id
// @desc    Delete a quiz
// @access  Private
router.delete('/:id', auth, deleteQuiz);

// @route   POST api/quiz/:id/submit
// @desc    Submit quiz answers for grading
// @access  Private
router.post('/:id/submit', auth, submitQuiz);

// @route   GET api/quiz/results
// @desc    Get all quiz results
// @access  Private
router.get('/results', auth, getQuizResults);

// @route   GET api/quiz/predict
// @desc    Predict exam grade based on quiz results
// @access  Private
router.get('/predict', auth, predictGrade);

module.exports = router;