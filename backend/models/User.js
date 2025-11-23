const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'email';
    }
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  photoURL: {
    type: String,
    default: null
  },
  authProvider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  },
  googleId: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  stats: {
    totalSessions: {
      type: Number,
      default: 0
    },
    totalFlowTime: {
      type: Number,
      default: 0
    },
    avgFlowScore: {
      type: Number,
      default: 0
    },
    bestFlowScore: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastSessionDate: {
      type: Date,
      default: null
    }
  },
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update stats method
userSchema.methods.updateStats = function(sessionData) {
  this.stats.totalSessions += 1;
  this.stats.totalFlowTime += sessionData.sessionDuration || 0;
  
  const newAvg = ((this.stats.avgFlowScore * (this.stats.totalSessions - 1)) + sessionData.flowScore) / this.stats.totalSessions;
  this.stats.avgFlowScore = Math.round(newAvg);
  
  if (sessionData.flowScore > this.stats.bestFlowScore) {
    this.stats.bestFlowScore = sessionData.flowScore;
  }
  
  this.stats.lastSessionDate = new Date();
};

// Update streak method
userSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastSession = this.stats.lastSessionDate;
  
  if (!lastSession) {
    this.stats.currentStreak = 1;
  } else {
    const daysSinceLastSession = Math.floor((now - lastSession) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastSession === 0) {
      // Same day, don't change streak
      return;
    } else if (daysSinceLastSession === 1) {
      // Consecutive day
      this.stats.currentStreak += 1;
    } else {
      // Streak broken
      this.stats.currentStreak = 1;
    }
  }
  
  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }
};

module.exports = mongoose.model('User', userSchema);
