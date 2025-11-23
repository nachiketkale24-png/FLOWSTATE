/**
 * Notification Container
 * 
 * Manages and displays multiple notifications
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AchievementToast from './AchievementToast';
import GoalToast from './GoalToast';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showAchievement = useCallback((achievement) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, type: 'achievement', data: achievement }]);
  }, []);

  const showGoal = useCallback((goalNotification) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, type: 'goal', data: goalNotification }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Listen for new achievements from session end
  useEffect(() => {
    const handleNewAchievements = (event) => {
      const newAchievements = event.detail;
      newAchievements.forEach((achievement, index) => {
        setTimeout(() => {
          showAchievement(achievement);
        }, index * 300); // Stagger notifications
      });
    };

    const handleGoalProgress = (event) => {
      const goalNotifications = event.detail;
      goalNotifications.forEach((notification, index) => {
        setTimeout(() => {
          showGoal(notification);
        }, index * 250); // Stagger goal notifications
      });
    };

    window.addEventListener('newAchievements', handleNewAchievements);
    window.addEventListener('goalProgress', handleGoalProgress);
    
    return () => {
      window.removeEventListener('newAchievements', handleNewAchievements);
      window.removeEventListener('goalProgress', handleGoalProgress);
    };
  }, [showAchievement, showGoal]);

  return (
    <NotificationContext.Provider value={{ showAchievement, showGoal }}>
      {children}
      {notifications.map((notification, index) => {
        if (notification.type === 'achievement') {
          return (
            <div
              key={notification.id}
              className="fixed z-50"
              style={{ top: `${24 + index * 120}px`, right: '24px' }}
            >
              <AchievementToast
                achievement={notification.data}
                onClose={() => removeNotification(notification.id)}
              />
            </div>
          );
        }
        if (notification.type === 'goal') {
          return (
            <div
              key={notification.id}
              className="fixed z-50"
              style={{ top: `${24 + index * 120}px`, right: '24px' }}
            >
              <GoalToast
                notification={notification.data}
                onClose={() => removeNotification(notification.id)}
              />
            </div>
          );
        }
        return null;
      })}
    </NotificationContext.Provider>
  );
}
