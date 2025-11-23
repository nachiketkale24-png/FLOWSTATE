const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  appearance: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    accentColor: {
      type: String,
      default: '#3B82F6'
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    }
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    sessionReminders: {
      type: Boolean,
      default: true
    },
    goalReminders: {
      type: Boolean,
      default: true
    },
    achievementUnlocks: {
      type: Boolean,
      default: true
    },
    weeklyReport: {
      type: Boolean,
      default: true
    }
  },
  session: {
    defaultDuration: {
      type: Number,
      default: 25,
      min: 5,
      max: 120
    },
    breakDuration: {
      type: Number,
      default: 5,
      min: 1,
      max: 30
    },
    autoStartBreaks: {
      type: Boolean,
      default: false
    },
    soundEnabled: {
      type: Boolean,
      default: true
    },
    cameraTracking: {
      type: Boolean,
      default: false
    }
  },
  goals: {
    defaultType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    autoArchive: {
      type: Boolean,
      default: true
    }
  },
  privacy: {
    profilePublic: {
      type: Boolean,
      default: false
    },
    showStats: {
      type: Boolean,
      default: true
    },
    allowAnalytics: {
      type: Boolean,
      default: true
    }
  },
  ai: {
    enabled: {
      type: Boolean,
      default: true
    },
    autoInsights: {
      type: Boolean,
      default: true
    },
    chatHistory: {
      type: Boolean,
      default: true
    }
  },
  language: {
    type: String,
    default: 'en'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
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

module.exports = mongoose.model('Settings', settingsSchema);
