/**
 * Achievements Page
 * 
 * Displays all achievements with progress tracking
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, TrendingUp } from 'lucide-react';
import { demoAchievements } from '../demoData';
import AchievementBadge from '../components/AchievementBadge';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      
      // Use demo achievements for offline mode
      setAchievements(demoAchievements);
      setStats({
        totalSessions: 20,
        dailyStreak: 3,
        peakFocusScore: 92
      });
    } catch (error) {
      console.error('Failed to load demo achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Group by tier
  const tierGroups = {
    platinum: filteredAchievements.filter((a) => a.tier === 'platinum'),
    gold: filteredAchievements.filter((a) => a.tier === 'gold'),
    silver: filteredAchievements.filter((a) => a.tier === 'silver'),
    bronze: filteredAchievements.filter((a) => a.tier === 'bronze'),
  };

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
            <Trophy size={32} className="text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Achievements</h1>
          </div>
          <p className="text-purple-300 text-lg">
            Track your progress and unlock rewards
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-6 rounded-2xl border border-purple-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Award className="text-yellow-400" size={24} />
              <h3 className="text-white font-semibold">Total Unlocked</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {unlockedCount} / {totalCount}
            </p>
            <div className="mt-3">
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div
                  className="h-full bg-linear-to-r from-yellow-500 to-orange-500 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-purple-300 mt-1">{completionPercentage}% Complete</p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-blue-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Star className="text-blue-400" size={24} />
              <h3 className="text-white font-semibold">Total Sessions</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalSessions || 0}</p>
            <p className="text-sm text-purple-300 mt-1">Focus sessions completed</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-cyan-500/30">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-cyan-400" size={24} />
              <h3 className="text-white font-semibold">Current Streak</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.dailyStreak || 0}</p>
            <p className="text-sm text-purple-300 mt-1">Consecutive days</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-pink-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="text-pink-400" size={24} />
              <h3 className="text-white font-semibold">Peak Score</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.peakFocusScore || 0}</p>
            <p className="text-sm text-purple-300 mt-1">Best flow score</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white/10 text-purple-300 hover:bg-white/20'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === 'unlocked'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white/10 text-purple-300 hover:bg-white/20'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === 'locked'
                ? 'bg-gray-600 text-white shadow-lg'
                : 'bg-white/10 text-purple-300 hover:bg-white/20'
            }`}
          >
            Locked ({totalCount - unlockedCount})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Achievements Grid by Tier */}
        {!loading && (
          <div className="space-y-8">
            {Object.entries(tierGroups).map(([tier, tierAchievements]) => {
              if (tierAchievements.length === 0) return null;

              const tierColors = {
                platinum: 'text-purple-400',
                gold: 'text-yellow-400',
                silver: 'text-gray-300',
                bronze: 'text-amber-400',
              };

              return (
                <div key={tier}>
                  <h2 className={`text-2xl font-bold mb-4 ${tierColors[tier]}`}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)} Achievements
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {tierAchievements.map((achievement) => (
                      <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        unlocked={achievement.unlocked}
                        progress={achievement.progress}
                        size="md"
                        showProgress={true}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy size={64} className="text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No achievements found</h3>
            <p className="text-purple-300">
              {filter === 'unlocked'
                ? 'Start completing sessions to unlock achievements!'
                : 'Try a different filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
