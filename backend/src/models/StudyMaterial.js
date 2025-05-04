const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'doc'],
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String
  },
  keyPoints: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  subject: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'unknown'],
    default: 'unknown'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);