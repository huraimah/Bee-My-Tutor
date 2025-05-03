const User = require('../models/User');
const admin = require('../utils/firebase-admin');

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // Get user from database
    let user = await User.findOne({ firebaseUid: req.user.id }).select('-password');
    
    // If user doesn't exist in our database yet, create a new record
    if (!user) {
      // Get user details from Firebase
      const firebaseUser = await admin.auth().getUser(req.user.id);
      
      // Create new user in our database
      user = new User({
        firebaseUid: req.user.id,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email,
        // No password needed with Firebase auth
      });
      
      await user.save();
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create or update user profile
// @route   POST /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, institution, grade, subjects, examDate } = req.body;
    
    // Find user by Firebase UID
    let user = await User.findOne({ firebaseUid: req.user.id });
    
    if (!user) {
      // Get user details from Firebase
      const firebaseUser = await admin.auth().getUser(req.user.id);
      
      // Create new user
      user = new User({
        firebaseUid: req.user.id,
        name: name || firebaseUser.displayName || 'User',
        email: firebaseUser.email,
        institution,
        grade,
        subjects,
        examDate
      });
    } else {
      // Update existing user
      if (name) user.name = name;
      if (institution) user.institution = institution;
      if (grade) user.grade = grade;
      if (subjects) user.subjects = subjects;
      if (examDate) user.examDate = examDate;
    }
    
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};