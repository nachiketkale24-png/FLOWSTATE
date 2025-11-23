const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    required: true
  },
  category: {
    type: String,
    enum: ['flow_time', 'sessions', 'score', 'streak', 'custom'],
    default: 'custom'
  },
  target: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    }
  },
  current: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'archived'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tags: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    default: null
  },
  milestones: [{
    title: String,
    value: Number,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
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

// Index for efficient queries
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, endDate: 1 });

// Calculate progress before saving
goalSchema.pre('save', function(next) {
  if (this.target.value > 0) {
    this.progress = Math.min(100, Math.round((this.current / this.target.value) * 100));
  }
  
  // Auto-complete if target reached
  if (this.current >= this.target.value && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  // Auto-fail if past end date and not completed
  if (this.endDate < new Date() && this.status === 'active') {
    this.status = 'failed';
  }
  
  next();
});

// Update progress method
goalSchema.methods.updateProgress = function(value) {
  this.current = Math.max(0, this.current + value);
  
  // Check milestones
  this.milestones.forEach(milestone => {
    if (!milestone.completed && this.current >= milestone.value) {
      milestone.completed = true;
      milestone.completedAt = new Date();
    }
  });
};

module.exports = mongoose.model('Goal', goalSchema);
