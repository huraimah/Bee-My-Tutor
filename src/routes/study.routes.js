const express = require('express');
const router = express.Router();
const { 
  uploadMaterial, 
  getMaterials, 
  getMaterial,
  deleteMaterial,
  generateStudyPlan,
  getStudyPlans,
  getStudyPlan,
  updateStudyPlanProgress
} = require('../controllers/study.controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST api/study/materials
// @desc    Upload study material (PDF/DOCX)
// @access  Private
router.post('/materials', auth, upload.single('file'), uploadMaterial);

// @route   GET api/study/materials
// @desc    Get all user's study materials
// @access  Private
router.get('/materials', auth, getMaterials);

// @route   GET api/study/materials/:id
// @desc    Get a specific study material
// @access  Private
router.get('/materials/:id', auth, getMaterial);

// @route   DELETE api/study/materials/:id
// @desc    Delete a study material
// @access  Private
router.delete('/materials/:id', auth, deleteMaterial);

// @route   POST api/study/plans
// @desc    Generate a study plan based on materials and deadline
// @access  Private
router.post('/plans', auth, generateStudyPlan);

// @route   GET api/study/plans
// @desc    Get all user's study plans
// @access  Private
router.get('/plans', auth, getStudyPlans);

// @route   GET api/study/plans/:id
// @desc    Get a specific study plan
// @access  Private
router.get('/plans/:id', auth, getStudyPlan);

// @route   PUT api/study/plans/:id/progress
// @desc    Update study plan progress
// @access  Private
router.put('/plans/:id/progress', auth, updateStudyPlanProgress);

module.exports = router;