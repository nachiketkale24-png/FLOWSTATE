/**
 * Goal Progress Toast Notification
 * 
 * Shows when user makes progress on or completes a goal
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Target, Trophy, X } from 'lucide-react';

export default function GoalToast({ notification, onClose }) {
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

  const isCompleted = notification.type === 'goalCompleted';
  const Icon = isCompleted ? Trophy : Target;
  const iconColor = isCompleted ? 'text-yellow-400' : 'text-cyan-400';
  const borderColor = isCompleted ? 'border-yellow-500/50' : 'border-cyan-500/50';
  const shadowColor = isCompleted
    ? 'shadow-[0_0_40px_rgba(234,179,8,0.4)]'
    : 'shadow-[0_0_40px_rgba(34,211,238,0.4)]';

  const iconGradient = isCompleted 
    ? 'from-yellow-500 to-orange-500' 
    : 'from-cyan-500 to-blue-500';

  return (
    <div
      className={'fixed top-6 right-6 z-50 transition-all duration-300 ' + (isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0')}
    >
      <div className={'glass-card p-4 rounded-2xl border-2 max-w-sm ' + borderColor + ' ' + shadowColor}>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={'w-12 h-12 rounded-xl bg-linear-to-br flex items-center justify-center shrink-0 ' + iconGradient}>
            <Icon size={24} className="text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className={iconColor + ' shrink-0'} />
              <p className={'text-xs font-medium uppercase tracking-wider ' + iconColor}>
                {isCompleted ? 'Goal Completed!' : 'Goal Progress'}
              </p>
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {notification.goal.title}
            </h3>
            <p className="text-sm text-purple-300">
              {notification.goal.currentValue}/{notification.goal.targetValue} {notification.goal.unit}
            </p>
            {!isCompleted && (
              <div className="mt-2">
                <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                  <div
                    className="h-full bg-linear-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                    style={{ width: notification.goal.percentComplete + '%' }}
                  ></div>
                </div>
                <p className="text-xs text-cyan-300 mt-1">
                  {notification.goal.percentComplete}% complete
                </p>
              </div>
            )}
            {isCompleted && (
              <div className="mt-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 font-medium">
                ✓ Target Achieved!
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="text-purple-300 hover:text-white transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
