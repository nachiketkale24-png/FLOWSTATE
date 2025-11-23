/**
 * Achievements Preview Widget
 * 
 * Shows recent unlocked achievements on Dashboard
 */

import React, { useEffect, useState } from 'react';
import { Trophy, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { demoAchievements } from '../demoData';
import AchievementBadge from './AchievementBadge';

export default function AchievementsWidget() {
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      
      // Use demo achievements for offline mode
      const achievements = demoAchievements;
      
      // Sort by unlock time (most recent first) and take top 3
      const sorted = achievements
        .filter((a) => a.unlocked)
        .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
        .slice(0, 3);

      setRecentAchievements(sorted);
      setTotalUnlocked(achievements.filter((a) => a.unlocked).length);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-400" size={24} />
            <h3 className="text-xl font-bold text-white">Achievements</h3>
          </div>
        </div>
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-400" size={24} />
          <h3 className="text-xl font-bold text-white">Achievements</h3>
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-sm rounded-full">
            {totalUnlocked}
          </span>
        </div>
        <Link
          to="/achievements"
          className="flex items-center gap-1 text-sm text-purple-300 hover:text-white transition-colors"
        >
          View All
          <ChevronRight size={16} />
        </Link>
      </div>

      {recentAchievements.length === 0 ? (
        <div className="text-center py-8">
          <Trophy size={48} className="text-purple-400 mx-auto mb-3 opacity-50" />
          <p className="text-purple-300 mb-2">No achievements yet</p>
          <p className="text-sm text-purple-400">
            Complete sessions to unlock achievements!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {recentAchievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              unlocked={true}
              size="md"
              showProgress={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
