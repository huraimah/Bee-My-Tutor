const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer'],
    required: true
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  correctAnswer: {
    type: String
  },
  explanation: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 1
  }
});

const QuizResultSchema = new mongoose.Schema({
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    selectedOption: {
      type: String
    },
    textAnswer: {
      type: String
    },
    isCorrect: {
      type: Boolean
    },
    points: {
      type: Number,
      default: 0
    }
  }],
  score: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  feedback: {
    type: String
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

const QuizSchema = new mongoose.Schema({
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
  materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyMaterial'
  }],
  questions: [QuestionSchema],
  totalPoints: {
    type: Number,
    default: 0
  },
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  isSubmitted: {
    type: Boolean,
    default: false
  },
  result: QuizResultSchema,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total points before saving
QuizSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  }
  next();
});

module.exports = mongoose.model('Quiz', QuizSchema);