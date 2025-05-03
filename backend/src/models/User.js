const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    // Not required for Firebase auth
    required: false
  },
  institution: {
    type: String,
    default: ''
  },
  grade: {
    type: String,
    default: ''
  },
  subjects: {
    type: [String],
    default: []
  },
  examDate: {
    type: String,
    default: ''
  },
  learningStyle: {
    visual: {
      type: Number,
      default: 0
    },
    auditory: {
      type: Number,
      default: 0
    },
    reading: {
      type: Number,
      default: 0
    },
    kinesthetic: {
      type: Number,
      default: 0
    },
    dominantStyle: {
      type: String,
      enum: ['visual', 'auditory', 'reading', 'kinesthetic', 'unknown'],
      default: 'unknown'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate dominant learning style before saving
UserSchema.pre('save', function(next) {
  if (this.isModified('learningStyle.visual') || 
      this.isModified('learningStyle.auditory') || 
      this.isModified('learningStyle.reading') || 
      this.isModified('learningStyle.kinesthetic')) {
    
    const styles = {
      visual: this.learningStyle.visual,
      auditory: this.learningStyle.auditory,
      reading: this.learningStyle.reading,
      kinesthetic: this.learningStyle.kinesthetic
    };
    
    // Find the style with the highest score
    let maxScore = 0;
    let dominantStyle = 'unknown';
    
    for (const [style, score] of Object.entries(styles)) {
      if (score > maxScore) {
        maxScore = score;
        dominantStyle = style;
      }
    }
    
    this.learningStyle.dominantStyle = dominantStyle;
  }
  
  next();
});

module.exports = mongoose.model('User', UserSchema);