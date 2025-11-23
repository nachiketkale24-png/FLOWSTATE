/**
 * Achievement Unlock Toast Notification
 * 
 * Shows when user unlocks a new achievement
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Trophy, X } from 'lucide-react';

export default function AchievementToast({ achievement, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [handleClose]);

  const tierColors = {
    bronze: 'from-amber-700 to-amber-900',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-cyan-400 to-purple-500',
  };

  return (
    <div
      className={`fixed top-6 right-6 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
      }`}
    >
      <div className="glass-card p-4 rounded-2xl border-2 border-yellow-500/50 shadow-[0_0_40px_rgba(234,179,8,0.4)] max-w-sm">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={'w-16 h-16 rounded-xl bg-linear-to-br ' + tierColors[achievement.tier] + ' flex items-center justify-center text-3xl shrink-0 shadow-lg'}
          >
            {achievement.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={16} className="text-yellow-400 shrink-0" />
              <p className="text-xs font-medium text-yellow-400 uppercase tracking-wider">
                Achievement Unlocked!
              </p>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {achievement.name}
            </h3>
            <p className="text-sm text-purple-300 line-clamp-2">
              {achievement.description}
            </p>
            <div className="mt-2">
              <span
                className={
                  achievement.tier === 'platinum'
                    ? 'inline-block px-2 py-0.5 rounded text-xs font-medium bg-linear-to-r from-cyan-500 to-purple-500 text-white'
                    : achievement.tier === 'gold'
                    ? 'inline-block px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : achievement.tier === 'silver'
                    ? 'inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    : 'inline-block px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }
              >
                {achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1)}
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="text-purple-300 hover:text-white transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
