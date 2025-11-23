/**
 * Goals & Planner Page
 * 
 * Manage focus goals and schedule deep work blocks
 */

import React, { useState, useEffect } from 'react';
import { Target, Plus, Calendar, TrendingUp, Award, X, Pin, Edit2, Trash2, Clock, CheckCircle } from 'lucide-react';
import { demoGoals } from '../demoData';

export default function GoalsPage() {
  const [goals, setGoals] = useState(demoGoals);
  const [progress, setProgress] = useState(demoGoals);
  const [plannerBlocks, setPlannerBlocks] = useState([]); // Demo mode doesn't have planner blocks
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed, expired
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Demo mode: just use the demo data
      setGoals(demoGoals);
      setProgress(demoGoals);
      setPlannerBlocks([]);
    } catch (error) {
      console.error('Failed to load demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (goalData) => {
    try {
      // Demo mode: just update local state
      const newGoal = {
        ...goalData,
        id: `demo-goal-${Date.now()}`,
        status: 'In Progress',
        progress: 0,
        tasks: []
      };
      setGoals(prev => [...prev, newGoal]);
      setProgress(prev => [...prev, newGoal]);
      setShowAddGoalModal(false);
    } catch (error) {
      console.error('Failed to create demo goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      // Demo mode: just update local state
      setGoals(prev => prev.filter(g => g.id !== goalId));
      setProgress(prev => prev.filter(g => g.id !== goalId));
    } catch (error) {
      console.error('Failed to delete demo goal:', error);
    }
  };

  const handleTogglePin = async (goalId) => {
    try {
      // Demo mode: just update local state
      setGoals(prev => prev.map(g => 
        g.id === goalId ? { ...g, pinned: !g.pinned } : g
      ));
      setProgress(prev => prev.map(g => 
        g.id === goalId ? { ...g, pinned: !g.pinned } : g
      ));
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const handleCreateBlock = async (blockData) => {
    try {
      // Demo mode: just update local state
      const newBlock = {
        ...blockData,
        id: `demo-block-${Date.now()}`,
        status: 'planned'
      };
      setPlannerBlocks(prev => [...prev, newBlock]);
      setShowAddBlockModal(false);
    } catch (error) {
      console.error('Failed to create demo block:', error);
    }
  };

  const handleDeleteBlock = async (blockId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to delete this planner block?')) return;
    try {
      // Demo mode: just update local state
      setPlannerBlocks(prev => prev.filter(b => b.id !== blockId));
    } catch (error) {
      console.error('Failed to delete demo block:', error);
    }
  };

  // Merge goals with progress data
  const goalsWithProgress = goals.map(goal => {
    const progressItem = progress.find(p => p.goalId === goal.id);
    return {
      ...goal,
      currentValue: progressItem?.currentValue || goal.currentValue || 0,
      percentComplete: progressItem?.percentComplete || 0
    };
  });

  // Filter goals
  const filteredGoals = goalsWithProgress.filter(goal => {
    if (filter === 'all') return true;
    return goal.status === filter;
  });

  // Stats
  const activeGoalsCount = goalsWithProgress.filter(g => g.status === 'active').length;
  const completedThisWeek = goalsWithProgress.filter(g => {
    if (g.status !== 'completed') return false;
    const updated = g.updatedAt?.toDate ? g.updatedAt.toDate() : new Date(g.updatedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return updated >= weekAgo;
  }).length;

  const avgCompletionRate = goalsWithProgress.length > 0
    ? Math.round(goalsWithProgress.reduce((sum, g) => sum + g.percentComplete, 0) / goalsWithProgress.length)
    : 0;

  // Group planner blocks by date
  const blocksByDate = plannerBlocks.reduce((acc, block) => {
    if (!acc[block.date]) acc[block.date] = [];
    acc[block.date].push(block);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]"></div>

      {/* Content */}
      <div className="relative z-10 px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Target size={32} className="text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">Goals & Planner</h1>
          </div>
          <p className="text-purple-300 text-lg">
            Define your deep work targets and track your progress
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-6 rounded-2xl border border-cyan-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Target className="text-cyan-400" size={24} />
              <h3 className="text-white font-semibold">Active Goals</h3>
            </div>
            <p className="text-3xl font-bold text-white">{activeGoalsCount}</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Award className="text-green-400" size={24} />
              <h3 className="text-white font-semibold">Completed This Week</h3>
            </div>
            <p className="text-3xl font-bold text-white">{completedThisWeek}</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-purple-500/30">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-purple-400" size={24} />
              <h3 className="text-white font-semibold">Avg Completion</h3>
            </div>
            <p className="text-3xl font-bold text-white">{avgCompletionRate}%</p>
          </div>
        </div>

        {/* Goals Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">My Goals</h2>
            <button
              onClick={() => setShowAddGoalModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              Create New Goal
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 mb-6 overflow-x-auto">
            {['all', 'active', 'completed', 'expired'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={'px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ' + (filter === f ? 'bg-purple-500 text-white' : 'bg-white/10 text-purple-300 hover:bg-white/20')}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Goals List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredGoals.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl text-center">
              <Target size={64} className="text-purple-400 mx-auto mb-4 opacity-50" />
              <p className="text-purple-300 mb-2">No goals found</p>
              <p className="text-sm text-purple-400">Create your first goal to start tracking progress</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={handleDeleteGoal}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          )}
        </div>

        {/* Planner Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Deep Work Planner</h2>
            <button
              onClick={() => setShowAddBlockModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              Add Block
            </button>
          </div>

          {Object.keys(blocksByDate).length === 0 ? (
            <div className="glass-card p-12 rounded-2xl text-center">
              <Calendar size={64} className="text-cyan-400 mx-auto mb-4 opacity-50" />
              <p className="text-purple-300 mb-2">No planned blocks</p>
              <p className="text-sm text-purple-400">Schedule your deep work sessions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(blocksByDate).sort().map(([date, blocks]) => (
                <div key={date} className="glass-card p-6 rounded-2xl border border-cyan-500/30">
                  <h3 className="text-lg font-bold text-white mb-4">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <div className="space-y-3">
                    {blocks.map(block => (
                      <PlannerBlockCard
                        key={block.id}
                        block={block}
                        onDelete={handleDeleteBlock}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddGoalModal && (
        <AddGoalModal
          onClose={() => setShowAddGoalModal(false)}
          onSubmit={handleCreateGoal}
        />
      )}

      {showAddBlockModal && (
        <AddPlannerBlockModal
          onClose={() => setShowAddBlockModal(false)}
          onSubmit={handleCreateBlock}
        />
      )}
    </div>
  );
}

// Goal Card Component
function GoalCard({ goal, onDelete, onTogglePin }) {
  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };

  const typeColors = {
    daily: 'bg-purple-500/20 text-purple-400',
    weekly: 'bg-cyan-500/20 text-cyan-400',
    custom: 'bg-pink-500/20 text-pink-400'
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-purple-500/30 hover:border-purple-400/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white">{goal.title}</h3>
            {goal.pinned && <Pin size={16} className="text-yellow-400 fill-yellow-400" />}
          </div>
          {goal.description && (
            <p className="text-sm text-purple-300 mb-2">{goal.description}</p>
          )}
          <div className="flex gap-2">
            {goal.category && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                {goal.category}
              </span>
            )}
            {goal.priority && (
              <span className={'px-2 py-1 rounded text-xs font-medium ' + 
                (goal.priority === 'High' ? 'bg-red-500/20 text-red-400' : 
                 goal.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                 'bg-green-500/20 text-green-400')}>
                {goal.priority}
              </span>
            )}
            <span className={'px-2 py-1 rounded text-xs font-medium border ' + 
              (goal.status === 'Completed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
               goal.status === 'In Progress' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
               'bg-gray-500/20 text-gray-400 border-gray-500/30')}>
              {goal.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onTogglePin(goal.id)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Pin size={16} className={'text-purple-300 ' + (goal.pinned ? 'fill-yellow-400 text-yellow-400' : '')} />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <Trash2 size={16} className="text-red-400" />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-purple-300">Progress</span>
          <span className="text-white font-semibold">{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div
            className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full transition-all"
            style={{ width: goal.progress + '%' }}
          ></div>
        </div>
        {goal.targetDate && (
          <div className="text-right mt-1">
            <span className="text-xs text-purple-300">
              Due: {new Date(goal.targetDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Planner Block Card Component
function PlannerBlockCard({ block, onDelete }) {
  const statusColors = {
    planned: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    missed: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all">
      <div className="flex items-center gap-4 flex-1">
        <Clock className="text-cyan-400" size={20} />
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">{block.title}</h4>
          <div className="flex items-center gap-3 text-sm text-purple-300">
            <span>{block.startTime} - {block.endTime}</span>
            {block.linkedSessionId && (
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle size={14} />
                Linked
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={'px-3 py-1 rounded text-xs font-medium border ' + statusColors[block.status]}>
          {block.status.charAt(0).toUpperCase() + block.status.slice(1)}
        </span>
        <button
          onClick={() => onDelete(block.id)}
          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
        >
          <Trash2 size={16} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}

// Add Goal Modal Component
function AddGoalModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'daily',
    metric: 'total_focus_minutes',
    targetValue: 60,
    unit: 'min',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    autoReset: true,
    pinned: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      endDate: formData.endDate || null
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card p-8 rounded-2xl border border-purple-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Goal</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={24} className="text-purple-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
              rows="3"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Metric *</label>
              <select
                value={formData.metric}
                onChange={(e) => setFormData({...formData, metric: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
              >
                <option value="total_focus_minutes">Total Focus Minutes</option>
                <option value="flow_minutes">Flow Minutes</option>
                <option value="sessions_completed">Sessions Completed</option>
                <option value="zero_distraction_sessions">Zero-Distraction Sessions</option>
                <option value="streak_days">Streak Days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">Target Value *</label>
            <input
              type="number"
              value={formData.targetValue}
              onChange={(e) => setFormData({...formData, targetValue: parseInt(e.target.value)})}
              className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
              min="1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoReset}
                onChange={(e) => setFormData({...formData, autoReset: e.target.checked})}
                className="w-4 h-4 rounded border-purple-500/30"
              />
              <span className="text-sm text-purple-300">Auto-reset (for daily/weekly goals)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pinned}
                onChange={(e) => setFormData({...formData, pinned: e.target.checked})}
                className="w-4 h-4 rounded border-purple-500/30"
              />
              <span className="text-sm text-purple-300">Pin to dashboard</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Planner Block Modal Component
function AddPlannerBlockModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    targetMetric: null,
    targetValue: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card p-8 rounded-2xl border border-cyan-500/30 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add Deep Work Block</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={24} className="text-cyan-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              placeholder="Deep work on project X"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              rows="2"
              placeholder="Optional details..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">Start Time *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">End Time *</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              Add Block
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
