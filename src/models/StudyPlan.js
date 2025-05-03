const mongoose = require('mongoose');

const StudySessionSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  materials: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyMaterial'
    },
    pages: {
      type: String
    },
    sections: {
      type: String
    }
  }],
  activities: [{
    type: {
      type: String,
      enum: ['read', 'review', 'practice', 'quiz', 'break', 'other'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    }
  }],
  completed: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  }
});

const StudyPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
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
  examDate: {
    type: Date,
    required: true
  },
  materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyMaterial'
  }],
  sessions: [StudySessionSchema],
  progress: {
    type: Number, // percentage
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
StudyPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate progress based on completed sessions
StudyPlanSchema.methods.calculateProgress = function() {
  if (this.sessions.length === 0) return 0;
  
  const completedSessions = this.sessions.filter(session => session.completed).length;
  return Math.round((completedSessions / this.sessions.length) * 100);
};

module.exports = mongoose.model('StudyPlan', StudyPlanSchema);