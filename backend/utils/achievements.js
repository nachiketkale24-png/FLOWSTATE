/**
 * Achievements System
 * 
 * Defines achievement rules and checks user progress
 */

/**
 * Achievement definitions with unlock criteria
 */
export const ACHIEVEMENTS = [
  {
    id: 'first_session',
    name: 'First Steps',
    description: 'Complete your first focus session',
    icon: '🎯',
    tier: 'bronze',
    criteria: {
      type: 'session_count',
      value: 1,
    },
  },
  {
    id: 'flow_novice',
    name: 'Flow Novice',
    description: 'Achieve flow state for the first time',
    icon: '🌊',
    tier: 'bronze',
    criteria: {
      type: 'flow_sessions',
      value: 1,
    },
  },
  {
    id: 'dedicated_10',
    name: 'Dedicated Learner',
    description: 'Complete 10 focus sessions',
    icon: '📚',
    tier: 'silver',
    criteria: {
      type: 'session_count',
      value: 10,
    },
  },
  {
    id: 'flow_master',
    name: 'Flow Master',
    description: 'Achieve flow state 25 times',
    icon: '⚡',
    tier: 'gold',
    criteria: {
      type: 'flow_sessions',
      value: 25,
    },
  },
  {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Complete a 2+ hour focus session',
    icon: '🏃',
    tier: 'silver',
    criteria: {
      type: 'longest_session',
      value: 7200, // seconds
    },
  },
  {
    id: 'flow_hours_10',
    name: 'Deep Worker',
    description: 'Accumulate 10 hours in flow state',
    icon: '💎',
    tier: 'gold',
    criteria: {
      type: 'total_flow_time',
      value: 36000, // seconds
    },
  },
  {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Complete sessions for 3 consecutive days',
    icon: '🔥',
    tier: 'bronze',
    criteria: {
      type: 'daily_streak',
      value: 3,
    },
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Complete sessions for 7 consecutive days',
    icon: '⚔️',
    tier: 'silver',
    criteria: {
      type: 'daily_streak',
      value: 7,
    },
  },
  {
    id: 'streak_30',
    name: 'Unstoppable',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    tier: 'platinum',
    criteria: {
      type: 'daily_streak',
      value: 30,
    },
  },
  {
    id: 'focus_champion',
    name: 'Focus Champion',
    description: 'Achieve 95%+ focus score in a session',
    icon: '🎖️',
    tier: 'gold',
    criteria: {
      type: 'peak_focus_score',
      value: 95,
    },
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a session before 7 AM',
    icon: '🌅',
    tier: 'bronze',
    criteria: {
      type: 'early_session',
      value: 7, // hour
    },
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a session after 11 PM',
    icon: '🦉',
    tier: 'bronze',
    criteria: {
      type: 'late_session',
      value: 23, // hour
    },
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Complete 100 focus sessions',
    icon: '💯',
    tier: 'platinum',
    criteria: {
      type: 'session_count',
      value: 100,
    },
  },
  {
    id: 'distraction_free',
    name: 'Distraction-Free',
    description: 'Complete 10 sessions with zero distractions',
    icon: '🛡️',
    tier: 'gold',
    criteria: {
      type: 'zero_distraction_sessions',
      value: 10,
    },
  },
  {
    id: 'stamina_titan',
    name: 'Stamina Titan',
    description: 'Maintain 90+ stamina for an entire session',
    icon: '💪',
    tier: 'platinum',
    criteria: {
      type: 'high_stamina_session',
      value: 90,
    },
  },
];

/**
 * Calculate user statistics from sessions
 */
export function calculateUserStats(sessions) {
  const stats = {
    totalSessions: sessions.length,
    flowSessions: 0,
    totalFlowTime: 0,
    longestSession: 0,
    peakFocusScore: 0,
    zeroDistractionSessions: 0,
    earlySession: false,
    lateSession: false,
    highStaminaSession: false,
    dailyStreak: 0,
  };

  if (sessions.length === 0) {
    return stats;
  }

  // Count flow sessions and totals
  sessions.forEach((session) => {
    if (session.flowDuration > 0) {
      stats.flowSessions++;
      stats.totalFlowTime += session.flowDuration;
    }

    if (session.sessionDuration > stats.longestSession) {
      stats.longestSession = session.sessionDuration;
    }

    if (session.flowScore > stats.peakFocusScore) {
      stats.peakFocusScore = session.flowScore;
    }

    if ((session.blockedCount || 0) === 0 && (session.distractionEvents || 0) === 0) {
      stats.zeroDistractionSessions++;
    }

    // Check session time
    const startTime = session.startTime?.toDate?.() || new Date(session.startTime);
    const hour = startTime.getHours();
    if (hour < 7) stats.earlySession = true;
    if (hour >= 23) stats.lateSession = true;

    // Check stamina (if available in session metrics)
    if (session.staminaScore >= 90) {
      stats.highStaminaSession = true;
    }
  });

  // Calculate daily streak
  stats.dailyStreak = calculateStreak(sessions);

  return stats;
}

/**
 * Calculate consecutive daily streak
 */
export function calculateStreak(sessions) {
  if (sessions.length === 0) return 0;

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = a.startTime?.toDate?.() || new Date(a.startTime);
    const dateB = b.startTime?.toDate?.() || new Date(b.startTime);
    return dateB - dateA;
  });

  // Get unique dates
  const dates = [...new Set(sortedSessions.map((s) => {
    const date = s.startTime?.toDate?.() || new Date(s.startTime);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }))];

  // Check if streak is current (includes today or yesterday)
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (!dates.includes(today) && !dates.includes(yesterday)) {
    return 0; // Streak broken
  }

  // Count consecutive days
  let streak = 0;
  let currentDate = new Date();

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(currentDate - i * 86400000).toISOString().split('T')[0];
    if (dates.includes(checkDate)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Check which achievements user has unlocked
 */
export function checkAchievements(userStats) {
  const unlockedAchievements = [];

  ACHIEVEMENTS.forEach((achievement) => {
    const { type, value } = achievement.criteria;
    let unlocked = false;

    switch (type) {
      case 'session_count':
        unlocked = userStats.totalSessions >= value;
        break;
      case 'flow_sessions':
        unlocked = userStats.flowSessions >= value;
        break;
      case 'longest_session':
        unlocked = userStats.longestSession >= value;
        break;
      case 'total_flow_time':
        unlocked = userStats.totalFlowTime >= value;
        break;
      case 'daily_streak':
        unlocked = userStats.dailyStreak >= value;
        break;
      case 'peak_focus_score':
        unlocked = userStats.peakFocusScore >= value;
        break;
      case 'early_session':
        unlocked = userStats.earlySession;
        break;
      case 'late_session':
        unlocked = userStats.lateSession;
        break;
      case 'zero_distraction_sessions':
        unlocked = userStats.zeroDistractionSessions >= value;
        break;
      case 'high_stamina_session':
        unlocked = userStats.highStaminaSession;
        break;
      default:
        unlocked = false;
    }

    if (unlocked) {
      unlockedAchievements.push(achievement);
    }
  });

  return unlockedAchievements;
}

/**
 * Get achievement progress percentage
 */
export function getAchievementProgress(achievement, userStats) {
  const { type, value } = achievement.criteria;
  let current = 0;

  switch (type) {
    case 'session_count':
      current = userStats.totalSessions;
      break;
    case 'flow_sessions':
      current = userStats.flowSessions;
      break;
    case 'longest_session':
      current = userStats.longestSession;
      break;
    case 'total_flow_time':
      current = userStats.totalFlowTime;
      break;
    case 'daily_streak':
      current = userStats.dailyStreak;
      break;
    case 'peak_focus_score':
      current = userStats.peakFocusScore;
      break;
    case 'zero_distraction_sessions':
      current = userStats.zeroDistractionSessions;
      break;
    default:
      return { current: 0, target: value, percentage: 0 };
  }

  const percentage = Math.min(100, Math.round((current / value) * 100));

  return { current, target: value, percentage };
}
