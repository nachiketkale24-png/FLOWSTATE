/**
 * In-Memory Data Store
 * 
 * Fallback storage when Firebase is not configured
 * Stores sessions, users, goals, and achievements in memory
 */

class MemoryStore {
  constructor() {
    this.sessions = new Map(); // sessionId -> session data
    this.users = new Map(); // userId -> user data
    this.userSessions = new Map(); // userId -> [sessionIds]
    this.goals = new Map(); // goalId -> goal data
    this.userGoals = new Map(); // userId -> [goalIds]
    this.achievements = new Map(); // achievementId -> achievement data
    this.userAchievements = new Map(); // userId -> [achievementIds]
  }

  // ============================================================================
  // SESSION OPERATIONS
  // ============================================================================

  createSession(userId, sessionData) {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session = {
      id: sessionId,
      userId,
      status: 'active',
      startTime: new Date().toISOString(),
      metrics: [],
      ...sessionData,
      createdAt: new Date().toISOString(),
    };

    this.sessions.set(sessionId, session);

    // Track user sessions
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, []);
    }
    this.userSessions.get(userId).unshift(sessionId);

    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  updateSession(sessionId, updates) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Handle metrics array append
    if (updates.metric) {
      updatedSession.metrics = [...(session.metrics || []), updates.metric];
    }

    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  endSession(sessionId, finalData) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const completedSession = {
      ...session,
      ...finalData,
      status: 'completed',
      endTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(sessionId, completedSession);
    return completedSession;
  }

  getUserSessions(userId, limit = 50) {
    const sessionIds = this.userSessions.get(userId) || [];
    return sessionIds
      .slice(0, limit)
      .map(id => this.sessions.get(id))
      .filter(Boolean);
  }

  // ============================================================================
  // USER OPERATIONS
  // ============================================================================

  createOrUpdateUser(userId, userData) {
    const existingUser = this.users.get(userId);
    const user = {
      id: userId,
      ...existingUser,
      ...userData,
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!existingUser) {
      user.createdAt = new Date().toISOString();
    }

    this.users.set(userId, user);
    return user;
  }

  getUser(userId) {
    return this.users.get(userId) || null;
  }

  getUserStats(userId) {
    const sessions = this.getUserSessions(userId, 100);
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalTime: 0,
        avgFlowScore: 0,
        avgStaminaScore: 0,
        totalFlowTime: 0,
        bestFlowScore: 0,
        currentStreak: 0,
      };
    }

    const totalTime = sessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0);
    const totalFlowTime = sessions.reduce((sum, s) => sum + (s.flowDuration || 0), 0);
    const avgFlowScore = Math.round(
      sessions.reduce((sum, s) => sum + (s.flowScore || 0), 0) / sessions.length
    );
    const avgStaminaScore = Math.round(
      sessions.reduce((sum, s) => sum + (s.staminaScore || 0), 0) / sessions.length
    );
    const bestFlowScore = Math.max(...sessions.map(s => s.flowScore || 0));

    // Calculate streak
    let currentStreak = 0;
    const today = new Date().toDateString();
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.startTime) - new Date(a.startTime)
    );

    let checkDate = new Date();
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.startTime).toDateString();
      const expectedDate = checkDate.toDateString();
      
      if (sessionDate === expectedDate) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalSessions: sessions.length,
      totalTime,
      totalFlowTime,
      avgFlowScore,
      avgStaminaScore,
      bestFlowScore,
      currentStreak,
    };
  }

  // ============================================================================
  // GOAL OPERATIONS
  // ============================================================================

  createGoal(userId, goalData) {
    const goalId = `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const goal = {
      id: goalId,
      userId,
      status: 'active',
      currentValue: 0,
      ...goalData,
      createdAt: new Date().toISOString(),
    };

    this.goals.set(goalId, goal);

    if (!this.userGoals.has(userId)) {
      this.userGoals.set(userId, []);
    }
    this.userGoals.get(userId).push(goalId);

    return goal;
  }

  getGoal(goalId) {
    return this.goals.get(goalId) || null;
  }

  updateGoal(goalId, updates) {
    const goal = this.goals.get(goalId);
    if (!goal) return null;

    const updatedGoal = {
      ...goal,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.goals.set(goalId, updatedGoal);
    return updatedGoal;
  }

  getUserGoals(userId) {
    const goalIds = this.userGoals.get(userId) || [];
    return goalIds
      .map(id => this.goals.get(id))
      .filter(Boolean);
  }

  deleteGoal(goalId) {
    const goal = this.goals.get(goalId);
    if (!goal) return false;

    this.goals.delete(goalId);

    // Remove from user's goals
    const userGoalIds = this.userGoals.get(goal.userId) || [];
    const index = userGoalIds.indexOf(goalId);
    if (index > -1) {
      userGoalIds.splice(index, 1);
    }

    return true;
  }

  // ============================================================================
  // ACHIEVEMENT OPERATIONS
  // ============================================================================

  getAchievementsList() {
    // Return predefined achievements
    return [
      {
        id: 'first_session',
        name: 'First Steps',
        description: 'Complete your first focus session',
        icon: '🎯',
        tier: 'bronze',
        criteria: { type: 'session_count', value: 1 },
      },
      {
        id: 'flow_novice',
        name: 'Flow Novice',
        description: 'Achieve flow state for the first time',
        icon: '🌊',
        tier: 'bronze',
        criteria: { type: 'flow_sessions', value: 1 },
      },
      {
        id: 'dedicated_10',
        name: 'Dedicated Learner',
        description: 'Complete 10 focus sessions',
        icon: '📚',
        tier: 'silver',
        criteria: { type: 'session_count', value: 10 },
      },
      {
        id: 'flow_master',
        name: 'Flow Master',
        description: 'Achieve flow state 25 times',
        icon: '⚡',
        tier: 'gold',
        criteria: { type: 'flow_sessions', value: 25 },
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Complete sessions for 7 consecutive days',
        icon: '🔥',
        tier: 'silver',
        criteria: { type: 'daily_streak', value: 7 },
      },
    ];
  }

  getUserAchievements(userId) {
    const achievementIds = this.userAchievements.get(userId) || [];
    return achievementIds
      .map(id => this.achievements.get(id))
      .filter(Boolean);
  }

  unlockAchievement(userId, achievementData) {
    const achievementId = `achievement-${userId}-${achievementData.achievementId || Date.now()}`;
    const achievement = {
      id: achievementId,
      userId,
      unlocked: true,
      unlockedAt: new Date().toISOString(),
      ...achievementData,
    };

    this.achievements.set(achievementId, achievement);

    if (!this.userAchievements.has(userId)) {
      this.userAchievements.set(userId, []);
    }
    this.userAchievements.get(userId).push(achievementId);

    return achievement;
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  clear() {
    this.sessions.clear();
    this.users.clear();
    this.userSessions.clear();
    this.goals.clear();
    this.userGoals.clear();
    this.achievements.clear();
    this.userAchievements.clear();
  }

  getStats() {
    return {
      sessions: this.sessions.size,
      users: this.users.size,
      goals: this.goals.size,
      achievements: this.achievements.size,
    };
  }
}

// Singleton instance
const memoryStore = new MemoryStore();

export default memoryStore;
