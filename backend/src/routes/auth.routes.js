const express = require('express');
const router = express.Router();
const { getMe, updateProfile } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getMe);

// @route   POST api/auth/profile
// @desc    Create or update user profile
// @access  Private
router.post('/profile', auth, updateProfile);

module.exports = router;