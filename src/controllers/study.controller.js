const StudyMaterial = require('../models/StudyMaterial');
const StudyPlan = require('../models/StudyPlan');
const User = require('../models/User');
const fileService = require('../services/file.service');
const geminiService = require('../services/gemini.service');

// @desc    Upload study material (PDF/DOCX)
// @route   POST /api/study/materials
// @access  Private
exports.uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    
    // Process the uploaded file
    const processedFile = await fileService.processFile(req.file);
    
    // Create new study material
    const newMaterial = new StudyMaterial({
      user: req.user.id,
      title: req.body.title || processedFile.originalFilename,
      description: req.body.description || '',
      fileType: processedFile.fileType,
      filePath: processedFile.filePath,
      originalFilename: processedFile.originalFilename,
      fileSize: processedFile.fileSize,
      content: processedFile.content,
      summary: processedFile.summary,
      keyPoints: processedFile.keyPoints,
      tags: processedFile.tags,
      subject: processedFile.subject,
      difficulty: processedFile.difficulty
    });
    
    // Save to database
    await newMaterial.save();
    
    res.json(newMaterial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all user's study materials
// @route   GET /api/study/materials
// @access  Private
exports.getMaterials = async (req, res) => {
  try {
    const materials = await StudyMaterial.find({ user: req.user.id })
      .select('-content') // Exclude content field to reduce response size
      .sort({ createdAt: -1 });
    
    res.json(materials);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get a specific study material
// @route   GET /api/study/materials/:id
// @access  Private
exports.getMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    
    // Check if material exists
    if (!material) {
      return res.status(404).json({ msg: 'Study material not found' });
    }
    
    // Check if user owns the material
    if (material.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(material);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Study material not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// @desc    Delete a study material
// @route   DELETE /api/study/materials/:id
// @access  Private
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    
    // Check if material exists
    if (!material) {
      return res.status(404).json({ msg: 'Study material not found' });
    }
    
    // Check if user owns the material
    if (material.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Delete file from filesystem
    await fileService.deleteFile(material.filePath);
    
    // Delete from database
    await material.deleteOne();
    
    res.json({ msg: 'Study material removed' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Study material not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// @desc    Generate a study plan based on materials and deadline
// @route   POST /api/study/plans
// @access  Private
exports.generateStudyPlan = async (req, res) => {
  try {
    const { title, description, examDate, materialIds } = req.body;
    
    if (!examDate) {
      return res.status(400).json({ msg: 'Exam date is required' });
    }
    
    if (!materialIds || !Array.isArray(materialIds) || materialIds.length === 0) {
      return res.status(400).json({ msg: 'At least one study material is required' });
    }
    
    // Get user's learning style
    const user = await User.findById(req.user.id).select('learningStyle');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Get study materials
    const materials = await StudyMaterial.find({
      _id: { $in: materialIds },
      user: req.user.id
    });
    
    if (materials.length === 0) {
      return res.status(404).json({ msg: 'No valid study materials found' });
    }
    
    // Generate study plan using Gemini API
    const generatedPlan = await geminiService.generateStudyPlan(materials, examDate, user.learningStyle);
    
    // Create study sessions from generated plan
    const sessions = generatedPlan.sessions.map(session => {
      return {
        day: session.day,
        date: new Date(session.date),
        title: session.title,
        description: session.description,
        duration: session.duration,
        materials: session.materials.map(material => {
          return {
            material: materials.find(m => m.title === material.title)?._id,
            pages: material.pages,
            sections: material.sections
          };
        }).filter(m => m.material), // Filter out materials that weren't found
        activities: session.activities.map(activity => {
          return {
            type: activity.type,
            description: activity.description,
            duration: activity.duration
          };
        })
      };
    });
    
    // Create new study plan
    const newStudyPlan = new StudyPlan({
      user: req.user.id,
      title: title || generatedPlan.title,
      description: description || generatedPlan.description,
      examDate: new Date(examDate),
      materials: materialIds,
      sessions
    });
    
    // Save to database
    await newStudyPlan.save();
    
    res.json(newStudyPlan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all user's study plans
// @route   GET /api/study/plans
// @access  Private
exports.getStudyPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ user: req.user.id })
      .populate('materials', 'title')
      .sort({ createdAt: -1 });
    
    res.json(plans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get a specific study plan
// @route   GET /api/study/plans/:id
// @access  Private
exports.getStudyPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findById(req.params.id)
      .populate('materials', 'title description subject')
      .populate('sessions.materials.material', 'title');
    
    // Check if plan exists
    if (!plan) {
      return res.status(404).json({ msg: 'Study plan not found' });
    }
    
    // Check if user owns the plan
    if (plan.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(plan);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Study plan not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// @desc    Update study plan progress
// @route   PUT /api/study/plans/:id/progress
// @access  Private
exports.updateStudyPlanProgress = async (req, res) => {
  try {
    const { sessionId, completed, notes } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ msg: 'Session ID is required' });
    }
    
    const plan = await StudyPlan.findById(req.params.id);
    
    // Check if plan exists
    if (!plan) {
      return res.status(404).json({ msg: 'Study plan not found' });
    }
    
    // Check if user owns the plan
    if (plan.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Find the session
    const sessionIndex = plan.sessions.findIndex(session => session._id.toString() === sessionId);
    
    if (sessionIndex === -1) {
      return res.status(404).json({ msg: 'Session not found in study plan' });
    }
    
    // Update session
    if (completed !== undefined) {
      plan.sessions[sessionIndex].completed = completed;
    }
    
    if (notes) {
      plan.sessions[sessionIndex].notes = notes;
    }
    
    // Calculate new progress
    plan.progress = plan.calculateProgress();
    
    // Save changes
    await plan.save();
    
    res.json(plan);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Study plan not found' });
    }
    
    res.status(500).send('Server error');
  }
};