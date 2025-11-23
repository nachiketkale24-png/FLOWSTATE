const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  sessionDuration: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  },
  flowState: {
    type: String,
    enum: ['IDLE', 'WARMING_UP', 'FLOW', 'DEEP_FLOW', 'PEAK_FLOW', 'FATIGUE', 'MONITORING'],
    default: 'IDLE'
  },
  flowScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  metrics: {
    attention: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    stamina: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    focus: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    arousal: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    }
  },
  metricsHistory: [{
    timestamp: Date,
    flowScore: Number,
    attention: Number,
    stamina: Number,
    focus: Number,
    arousal: Number,
    flowState: String
  }],
  breaksTaken: {
    type: Number,
    default: 0
  },
  breakDuration: {
    type: Number,
    default: 0
  },
  taskCompleted: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  insights: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: []
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

// Index for efficient queries
sessionSchema.index({ userId: 1, startTime: -1 });
sessionSchema.index({ userId: 1, status: 1 });

// Calculate session duration before saving
sessionSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.sessionDuration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  next();
});

// Add metrics to history
sessionSchema.methods.addMetricsSnapshot = function() {
  this.metricsHistory.push({
    timestamp: new Date(),
    flowScore: this.flowScore,
    attention: this.metrics.attention,
    stamina: this.metrics.stamina,
    focus: this.metrics.focus,
    arousal: this.metrics.arousal,
    flowState: this.flowState
  });
};

module.exports = mongoose.model('Session', sessionSchema);
