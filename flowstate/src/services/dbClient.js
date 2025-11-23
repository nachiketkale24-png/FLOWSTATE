// src/services/dbClient.js - Universal Database Client

import { APP_CONFIG } from '../config/appConfig';
import { logger } from '../utils/logger';
import { auth, db } from '../lib/firebaseClient';

/**
 * Database Client Class - SMART MODE
 * Uses Firestore if available, else localStorage for persistence
 */
class DBClient {
  constructor() {
    // Check if Firestore is actually working
    this.isFirestoreAvailable = APP_CONFIG.ENABLE_FIRESTORE && db && typeof db.collection !== 'undefined';
    
    logger.info('DBClient', 'Initialized', {
      firestoreAvailable: this.isFirestoreAvailable,
      usingLocalStorage: !this.isFirestoreAvailable,
    });
  }

  /**
   * Get current user ID
   */
  getCurrentUserId() {
    try {
      const uid = auth?.currentUser?.uid;
      if (uid) return uid;
      
      // Fallback to localStorage user
      let localUser = localStorage.getItem('flowstate_user_id');
      if (!localUser) {
        localUser = `local-user-${Date.now()}`;
        localStorage.setItem('flowstate_user_id', localUser);
      }
      return localUser;
    } catch (error) {
      logger.error('DBClient', 'Failed to get user ID', error);
      return `local-user-${Date.now()}`;
    }
  }

  /**
   * Ensure user profile exists
   */
  async ensureUserProfile(uid = null) {
    const userId = uid || this.getCurrentUserId();

    // LocalStorage mode
    if (!this.isFirestoreAvailable) {
      const profileKey = `flowstate_profile_${userId}`;
      let profile = localStorage.getItem(profileKey);
      
      if (!profile) {
        profile = {
          uid: userId,
          email: 'local@flowstate.ai',
          displayName: 'Local User',
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        };
        localStorage.setItem(profileKey, JSON.stringify(profile));
        logger.event('DBClient', 'Profile created in localStorage', { userId });
      } else {
        profile = JSON.parse(profile);
      }
      
      return profile;
    }

    // Firestore mode
    try {
      const { doc, getDoc, setDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const profileData = {
          uid: userId,
          email: auth?.currentUser?.email || 'unknown@example.com',
          displayName: auth?.currentUser?.displayName || 'User',
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        };

        await setDoc(userRef, profileData);
        logger.event('DBClient', 'User profile created in Firestore', { userId });
        return profileData;
      }

      logger.info('DBClient', 'User profile exists in Firestore', { userId });
      return userDoc.data();
    } catch (error) {
      logger.error('DBClient', 'Failed to ensure user profile', error);
      throw error;
    }
  }

  /**
   * Save session to database
   */
  async saveSession(uid = null, sessionData) {
    const userId = uid || this.getCurrentUserId();

    // LocalStorage mode - REAL PERSISTENCE
    if (!this.isFirestoreAvailable) {
      const sessionId = `session-${Date.now()}`;
      const sessionsKey = `flowstate_sessions_${userId}`;
      
      let sessions = localStorage.getItem(sessionsKey);
      sessions = sessions ? JSON.parse(sessions) : [];
      
      sessions.unshift({
        id: sessionId,
        userId,
        ...sessionData,
        savedAt: new Date().toISOString(),
      });
      
      // Keep only last 100 sessions
      if (sessions.length > 100) {
        sessions = sessions.slice(0, 100);
      }
      
      localStorage.setItem(sessionsKey, JSON.stringify(sessions));
      logger.event('DBClient', 'Session saved to localStorage', { sessionId, userId });
      
      return { success: true, sessionId };
    }

    // Firestore mode
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const sessionsRef = collection(db, 'users', userId, 'sessions');
      
      const sessionRecord = {
        ...sessionData,
        userId,
        savedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(sessionsRef, sessionRecord);
      logger.event('DBClient', 'Session saved to Firestore', { userId, sessionId: docRef.id });
      
      return { success: true, sessionId: docRef.id };
    } catch (error) {
      logger.error('DBClient', 'Failed to save session', error);
      throw error;
    }
  }

  /**
   * Get user sessions
   */
  async getSessions(uid = null, limit = 20) {
    const userId = uid || this.getCurrentUserId();

    // LocalStorage mode - REAL DATA
    if (!this.isFirestoreAvailable) {
      const sessionsKey = `flowstate_sessions_${userId}`;
      let sessions = localStorage.getItem(sessionsKey);
      sessions = sessions ? JSON.parse(sessions) : [];
      
      logger.info('DBClient', 'Sessions loaded from localStorage', { userId, count: sessions.length });
      return sessions.slice(0, limit);
    }

    // Firestore mode
    try {
      const { collection, query, orderBy, getDocs, limit: firestoreLimit } = await import('firebase/firestore');
      const sessionsRef = collection(db, 'users', userId, 'sessions');
      const q = query(sessionsRef, orderBy('timestamp', 'desc'), firestoreLimit(limit));
      
      const querySnapshot = await getDocs(q);
      const sessions = [];
      
      querySnapshot.forEach((doc) => {
        sessions.push({ id: doc.id, ...doc.data() });
      });

      logger.info('DBClient', 'Sessions loaded from Firestore', { userId, count: sessions.length });
      return sessions;
    } catch (error) {
      logger.error('DBClient', 'Failed to get sessions', error);
      return [];
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(uid = null) {
    const userId = uid || this.getCurrentUserId();
    
    if (!userId) {
      return {
        totalSessions: 0,
        avgFlowScore: 0,
        totalTime: 0,
        currentStreak: 0,
        bestStreak: 0,
        achievementsCount: 0,
      };
    }

    try {
      const sessions = await this.getSessions(userId, 100);
      
      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          avgFlowScore: 0,
          totalTime: 0,
          currentStreak: 0,
          bestStreak: 0,
          achievementsCount: 0,
        };
      }

      const totalSessions = sessions.length;
      const avgFlowScore = Math.round(
        sessions.reduce((sum, s) => sum + (s.flowScore || 0), 0) / totalSessions
      );
      const totalTime = sessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0);

      // Calculate streak
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      const today = new Date().setHours(0, 0, 0, 0);
      
      sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      for (let i = 0; i < sessions.length; i++) {
        const sessionDate = new Date(sessions[i].timestamp).setHours(0, 0, 0, 0);
        const expectedDate = today - i * 86400000;
        
        if (sessionDate === expectedDate) {
          tempStreak++;
          currentStreak = tempStreak;
        } else {
          break;
        }
      }
      
      bestStreak = Math.max(currentStreak, bestStreak);

      return {
        totalSessions,
        avgFlowScore,
        totalTime,
        currentStreak,
        bestStreak,
        achievementsCount: 0, // TODO: Count from achievements collection
      };
    } catch (error) {
      logger.error('DBClient', 'Failed to get user stats', error);
      return {
        totalSessions: 0,
        avgFlowScore: 0,
        totalTime: 0,
        currentStreak: 0,
        bestStreak: 0,
        achievementsCount: 0,
      };
    }
  }

  /**
   * Get user goals
   */
  async getGoals(uid = null) {
    const userId = uid || this.getCurrentUserId();

    // LocalStorage mode
    if (!this.isFirestoreAvailable) {
      const goalsKey = `flowstate_goals_${userId}`;
      let goals = localStorage.getItem(goalsKey);
      goals = goals ? JSON.parse(goals) : [];
      logger.info('DBClient', 'Goals loaded from localStorage', { userId, count: goals.length });
      return goals.filter(g => g.active);
    }

    // Firestore mode
    try {

      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const goalsRef = collection(db, 'users', userId, 'goals');
      const q = query(goalsRef, where('active', '==', true));
      
      const querySnapshot = await getDocs(q);
      const goals = [];
      
      querySnapshot.forEach((doc) => {
        goals.push({ id: doc.id, ...doc.data() });
      });

      logger.info('DBClient', 'Goals loaded', { userId, count: goals.length });
      return goals;
    } catch (error) {
      logger.error('DBClient', 'Failed to get goals', error);
      return [];
    }
  }

  /**
   * Update goal progress
   */
  async updateGoal(uid = null, goalId, updates) {
    const userId = uid || this.getCurrentUserId();

    // LocalStorage mode
    if (!this.isFirestoreAvailable) {
      const goalsKey = `flowstate_goals_${userId}`;
      let goals = localStorage.getItem(goalsKey);
      goals = goals ? JSON.parse(goals) : [];
      
      const goalIndex = goals.findIndex(g => g.id === goalId);
      if (goalIndex !== -1) {
        goals[goalIndex] = { ...goals[goalIndex], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(goalsKey, JSON.stringify(goals));
        logger.event('DBClient', 'Goal updated in localStorage', { userId, goalId });
      }
      
      return { success: true };
    }

    // Firestore mode
    try {

      const { doc, updateDoc } = await import('firebase/firestore');
      const goalRef = doc(db, 'users', userId, 'goals', goalId);
      
      await updateDoc(goalRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      logger.event('DBClient', 'Goal updated', { userId, goalId });
      return { success: true };
    } catch (error) {
      logger.error('DBClient', 'Failed to update goal', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user achievements
   */
  async getAchievements(uid = null) {
    const userId = uid || this.getCurrentUserId();

    // LocalStorage mode
    if (!this.isFirestoreAvailable) {
      const achievementsKey = `flowstate_achievements_${userId}`;
      let achievements = localStorage.getItem(achievementsKey);
      achievements = achievements ? JSON.parse(achievements) : [];
      logger.info('DBClient', 'Achievements loaded from localStorage', { userId, count: achievements.length });
      return achievements;
    }

    // Firestore mode
    try {

      const { collection, getDocs } = await import('firebase/firestore');
      const achievementsRef = collection(db, 'users', userId, 'achievements');
      
      const querySnapshot = await getDocs(achievementsRef);
      const achievements = [];
      
      querySnapshot.forEach((doc) => {
        achievements.push({ id: doc.id, ...doc.data() });
      });

      logger.info('DBClient', 'Achievements loaded', { userId, count: achievements.length });
      return achievements;
    } catch (error) {
      logger.error('DBClient', 'Failed to get achievements', error);
      return [];
    }
  }

  /**
   * Award achievement
   */
  async awardAchievement(uid = null, achievementId, achievementData) {
    const userId = uid || this.getCurrentUserId();

    // LocalStorage mode
    if (!this.isFirestoreAvailable) {
      const achievementsKey = `flowstate_achievements_${userId}`;
      let achievements = localStorage.getItem(achievementsKey);
      achievements = achievements ? JSON.parse(achievements) : [];
      
      const existingIndex = achievements.findIndex(a => a.id === achievementId);
      const achievement = {
        ...achievementData,
        id: achievementId,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };
      
      if (existingIndex !== -1) {
        achievements[existingIndex] = achievement;
      } else {
        achievements.push(achievement);
      }
      
      localStorage.setItem(achievementsKey, JSON.stringify(achievements));
      logger.event('DBClient', 'Achievement awarded in localStorage', { userId, achievementId });
      
      return { success: true };
    }

    // Firestore mode
    try {

      const { doc, setDoc } = await import('firebase/firestore');
      const achievementRef = doc(db, 'users', userId, 'achievements', achievementId);
      
      await setDoc(achievementRef, {
        ...achievementData,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      });

      logger.event('DBClient', 'Achievement awarded', { userId, achievementId });
      return { success: true };
    } catch (error) {
      logger.error('DBClient', 'Failed to award achievement', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user settings
   */
  async getSettings(uid = null) {
    const userId = uid || this.getCurrentUserId();
    
    const defaultSettings = {
      theme: 'dark',
      notifications: true,
      soundEffects: true,
      webcamDetection: false,
      autoSaveInterval: 30,
    };

    // LocalStorage mode
    if (!this.isFirestoreAvailable) {
      const settingsKey = `flowstate_settings_${userId}`;
      let settings = localStorage.getItem(settingsKey);
      settings = settings ? JSON.parse(settings) : defaultSettings;
      return settings;
    }

    // Firestore mode
    try {

      const { doc, getDoc } = await import('firebase/firestore');
      const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
      const settingsDoc = await getDoc(settingsRef);

      if (!settingsDoc.exists()) {
        return defaultSettings;
      }

      return { ...defaultSettings, ...settingsDoc.data() };
    } catch (error) {
      logger.error('DBClient', 'Failed to get settings', error);
      return defaultSettings;
    }
  }

  /**
   * Save user settings
   */
  async saveSettings(uid = null, settings) {
    const userId = uid || this.getCurrentUserId();

    // LocalStorage mode
    if (!this.isFirestoreAvailable) {
      const settingsKey = `flowstate_settings_${userId}`;
      localStorage.setItem(settingsKey, JSON.stringify(settings));
      logger.event('DBClient', 'Settings saved to localStorage', { userId });
      return { success: true };
    }

    // Firestore mode
    try {

      const { doc, setDoc } = await import('firebase/firestore');
      const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
      
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
      });

      logger.event('DBClient', 'Settings saved', { userId });
      return { success: true };
    } catch (error) {
      logger.error('DBClient', 'Failed to save settings', error);
      
      // Fallback to localStorage
      localStorage.setItem('flowstate_settings', JSON.stringify(settings));
      return { success: true, fallback: true };
    }
  }
}

// Export singleton instance
export const dbClient = new DBClient();

export default dbClient;
