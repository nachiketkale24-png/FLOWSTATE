const mongoose = require('mongoose');

const plannerBlockSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['work', 'break', 'meeting', 'exercise', 'learning', 'personal', 'other'],
    default: 'work'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled', 'missed'],
    default: 'planned'
  },
  tags: {
    type: [String],
    default: []
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  notes: {
    type: String,
    default: null
  },
  linkedSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null
  },
  linkedGoalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null
  },
  reminders: [{
    time: Date,
    sent: {
      type: Boolean,
      default: false
    }
  }],
  completedAt: {
    type: Date,
    default: null
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

// Index for efficient date range queries
plannerBlockSchema.index({ userId: 1, date: 1 });
plannerBlockSchema.index({ userId: 1, status: 1 });

// Auto-update status based on time
plannerBlockSchema.pre('save', function(next) {
  if (this.status === 'completed') {
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('PlannerBlock', plannerBlockSchema);
