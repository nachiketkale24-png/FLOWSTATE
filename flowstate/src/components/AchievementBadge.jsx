/**
 * Achievement Badge Component
 * 
 * Displays individual achievement with progress
 */

import React from 'react';
import { Lock, Check } from 'lucide-react';

export default function AchievementBadge({ achievement, unlocked, progress, size = 'md', showProgress = true }) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-24 h-24 text-4xl',
    lg: 'w-32 h-32 text-5xl',
  };

  const tierColors = {
    bronze: 'from-amber-700 to-amber-900',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-cyan-400 to-purple-500',
  };

  const tierBorders = {
    bronze: 'border-amber-500/50',
    silver: 'border-gray-400/50',
    gold: 'border-yellow-400/50',
    platinum: 'border-purple-400/50',
  };

  return (
    <div className={`glass-card rounded-2xl p-4 border ${unlocked ? tierBorders[achievement.tier] : 'border-white/10'} transition-all hover:scale-105 ${unlocked ? 'shadow-lg' : 'opacity-60'}`}>
      {/* Icon */}
      <div className="flex justify-center mb-3">
        <div className={`${sizeClasses[size]} flex items-center justify-center rounded-full ${unlocked ? 'bg-linear-to-br ' + tierColors[achievement.tier] : 'bg-gray-700/50'} relative`}>
          {unlocked ? (
            <>
              <span>{achievement.icon}</span>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                <Check size={14} className="text-white" />
              </div>
            </>
          ) : (
            <Lock size={size === 'sm' ? 20 : size === 'md' ? 32 : 40} className="text-gray-500" />
          )}
        </div>
      </div>

      {/* Name */}
      <h4 className={`text-center font-bold mb-1 ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'} ${unlocked ? 'text-white' : 'text-gray-400'}`}>
        {achievement.name}
      </h4>

      {/* Description */}
      <p className={`text-center ${size === 'sm' ? 'text-xs' : 'text-sm'} text-purple-300/70 mb-3`}>
        {achievement.description}
      </p>

      {/* Progress Bar */}
      {showProgress && progress && !unlocked && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-purple-300 mb-1">
            <span>Progress</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-purple-400 mt-1 text-center">
            {progress.current} / {progress.target}
          </p>
        </div>
      )}

      {/* Tier Badge */}
      <div className="flex justify-center mt-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          achievement.tier === 'bronze' ? 'bg-amber-900/30 text-amber-400' :
          achievement.tier === 'silver' ? 'bg-gray-600/30 text-gray-300' :
          achievement.tier === 'gold' ? 'bg-yellow-900/30 text-yellow-400' :
          'bg-purple-900/30 text-purple-400'
        }`}>
          {achievement.tier ? (achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1)) : 'Standard'}
        </span>
      </div>
    </div>
  );
}
