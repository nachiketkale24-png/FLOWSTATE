/**
 * Goals Widget for Dashboard
 * 
 * Shows pinned goals with progress
 */

import React, { useEffect, useState } from 'react';
import { Target, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { demoGoals } from '../demoData';

export default function GoalsWidget() {
  const [pinnedGoals, setPinnedGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    loadGoals();
    
    // Listen for goal progress updates
    const handleGoalProgress = () => {
      // Trigger pulse animation
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 600);
      
      // Reload goals
      setTimeout(() => loadGoals(), 300);
    };

    window.addEventListener('goalProgress', handleGoalProgress);
    return () => window.removeEventListener('goalProgress', handleGoalProgress);
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      
      // Use demo goals for offline mode
      const goals = demoGoals;
      
      // Filter active goals and take top 2
      const active = goals.filter(g => g.status === 'In Progress').slice(0, 2);
      setPinnedGoals(active);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-cyan-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="text-cyan-400" size={24} />
            <h3 className="text-xl font-bold text-white">Goals</h3>
          </div>
        </div>
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-cyan-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="text-cyan-400" size={24} />
          <h3 className="text-xl font-bold text-white">Goals</h3>
        </div>
        <Link
          to="/goals"
          className="flex items-center gap-1 text-sm text-cyan-300 hover:text-white transition-colors"
        >
          Manage Goals
          <ChevronRight size={16} />
        </Link>
      </div>

      {pinnedGoals.length === 0 ? (
        <div className="text-center py-8">
          <Target size={48} className="text-cyan-400 mx-auto mb-3 opacity-50" />
          <p className="text-purple-300 mb-2">No pinned goals</p>
          <p className="text-sm text-purple-400">
            <Link to="/goals" className="text-cyan-400 hover:underline">
              Create a goal
            </Link>{' '}
            and pin it to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pinnedGoals.map((goal) => (
            <div 
              key={goal.id} 
              className={'p-4 bg-white/5 rounded-xl border border-cyan-500/20 transition-all duration-300 ' + (pulseAnimation ? 'scale-105 border-cyan-400/50 shadow-lg shadow-cyan-500/20' : '')}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white mb-1">{goal.title}</h4>
                  <p className="text-sm text-purple-300">
                    {goal.category || 'General'}
                  </p>
                </div>
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                  {goal.priority || 'Medium'}
                </span>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-300">Progress</span>
                  <span className="text-white font-semibold">
                    {goal.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className="h-full bg-linear-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                    style={{ width: goal.progress + '%' }}
                  ></div>
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs text-cyan-300 font-semibold">
                    {goal.progress}% complete
                  </span>
                </div>
              </div>

              {goal.status === 'Completed' && (
                <div className="mt-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 text-center font-medium">
                  ✓ Goal Completed!
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
