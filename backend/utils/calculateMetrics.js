/**
 * Metrics Calculation Utilities
 * 
 * Compute aggregated metrics, averages, and statistics from session data
 */

/**
 * Calculate flow percentage from session data
 * 
 * @param {number} flowDuration - Duration in flow state (seconds)
 * @param {number} sessionDuration - Total session duration (seconds)
 * @returns {number} Flow percentage (0-100)
 */
export function calculateFlowPercentage(flowDuration, sessionDuration) {
  if (!sessionDuration || sessionDuration === 0) {
    return 0;
  }

  const percentage = (flowDuration / sessionDuration) * 100;
  return Math.round(Math.max(0, Math.min(100, percentage)));
}

/**
 * Calculate average from timeline metrics
 * 
 * @param {Array<Object>} timeline - Array of metric snapshots
 * @param {string} field - Field name to average
 * @returns {number} Average value
 */
export function calculateAverage(timeline, field) {
  if (!timeline || timeline.length === 0) {
    return 0;
  }

  const sum = timeline.reduce((acc, snapshot) => {
    return acc + (snapshot[field] || 0);
  }, 0);

  return Math.round(sum / timeline.length);
}

/**
 * Calculate peak value from timeline
 * 
 * @param {Array<Object>} timeline - Array of metric snapshots
 * @param {string} field - Field name to find peak
 * @returns {number} Peak value
 */
export function calculatePeak(timeline, field) {
  if (!timeline || timeline.length === 0) {
    return 0;
  }

  return Math.max(...timeline.map(snapshot => snapshot[field] || 0));
}

/**
 * Calculate session summary from timeline
 * 
 * @param {Array<Object>} timeline - Array of metric snapshots (1 per second)
 * @returns {Object} Session summary statistics
 */
export function calculateSessionSummary(timeline) {
  if (!timeline || timeline.length === 0) {
    return {
      sessionDuration: 0,
      flowDuration: 0,
      flowPercentage: 0,
      averageFlowScore: 0,
      peakFlowScore: 0,
      averageWPM: 0,
      peakWPM: 0,
      averageActiveRatio: 0,
      totalKeystrokes: 0,
      flowStateChanges: 0,
    };
  }

  // Session duration (assuming 1 snapshot per second)
  const sessionDuration = timeline.length;

  // Count seconds in FLOW state
  const flowDuration = timeline.filter(
    snapshot => snapshot.flowState === 'FLOW' || (snapshot.flowScore || 0) >= 70
  ).length;

  // Calculate averages
  const averageFlowScore = calculateAverage(timeline, 'flowScore');
  const averageWPM = calculateAverage(timeline, 'typingCadence');
  const averageActiveRatio = timeline.reduce((acc, s) => acc + (s.activeRatio || 0), 0) / timeline.length;

  // Calculate peaks
  const peakFlowScore = calculatePeak(timeline, 'flowScore');
  const peakWPM = calculatePeak(timeline, 'typingCadence');

  // Calculate total keystrokes (approximate from WPM)
  const totalKeystrokes = timeline.reduce((acc, snapshot) => {
    const wpm = snapshot.typingCadence || 0;
    const keysPerSecond = (wpm * 5) / 60; // WPM to keys per second (avg 5 chars per word)
    return acc + keysPerSecond;
  }, 0);

  // Count flow state changes
  let flowStateChanges = 0;
  for (let i = 1; i < timeline.length; i++) {
    if (timeline[i].flowState !== timeline[i - 1].flowState) {
      flowStateChanges++;
    }
  }

  return {
    sessionDuration,
    flowDuration,
    flowPercentage: calculateFlowPercentage(flowDuration, sessionDuration),
    averageFlowScore: Math.round(averageFlowScore),
    peakFlowScore: Math.round(peakFlowScore),
    averageWPM: Math.round(averageWPM),
    peakWPM: Math.round(peakWPM),
    averageActiveRatio: Math.round(averageActiveRatio * 100) / 100,
    totalKeystrokes: Math.round(totalKeystrokes),
    flowStateChanges,
  };
}

/**
 * Calculate stamina score from session performance
 * 
 * @param {Object} sessionSummary - Session summary statistics
 * @param {number} previousStamina - Previous stamina score
 * @returns {number} Updated stamina score (0-100)
 */
export function calculateStaminaScore(sessionSummary, previousStamina = 50) {
  const { flowDuration, sessionDuration, averageFlowScore } = sessionSummary;

  // Base stamina on flow ratio
  const flowRatio = sessionDuration > 0 ? flowDuration / sessionDuration : 0;
  const targetStamina = 40 + flowRatio * 60; // 40-100 range

  // Smooth with previous stamina (70% previous, 30% new)
  const newStamina = 0.7 * previousStamina + 0.3 * targetStamina;

  // Bonus for high flow scores
  const flowBonus = averageFlowScore > 80 ? 5 : 0;

  return Math.round(Math.max(0, Math.min(100, newStamina + flowBonus)));
}

/**
 * Calculate trend from recent values
 * 
 * @param {Array<number>} values - Recent values (newest first)
 * @returns {string} Trend: 'up', 'down', or 'stable'
 */
export function calculateTrend(values) {
  if (!values || values.length < 2) {
    return 'stable';
  }

  const recent = values.slice(0, Math.min(5, values.length));
  const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const oldest = recent[recent.length - 1];

  const change = avg - oldest;

  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
}

/**
 * Calculate flow quality score
 * 
 * @param {Object} sessionSummary - Session summary statistics
 * @returns {Object} Flow quality breakdown
 */
export function calculateFlowQuality(sessionSummary) {
  const {
    flowPercentage,
    averageFlowScore,
    flowStateChanges,
    sessionDuration,
  } = sessionSummary;

  // Duration quality (longer sessions = better, up to 90 min)
  const durationMinutes = sessionDuration / 60;
  const durationScore = Math.min(100, (durationMinutes / 90) * 100);

  // Consistency quality (fewer state changes = better)
  const changesPerMinute = sessionDuration > 0 ? flowStateChanges / (sessionDuration / 60) : 0;
  const consistencyScore = Math.max(0, 100 - changesPerMinute * 10);

  // Overall flow quality (weighted average)
  const qualityScore = Math.round(
    flowPercentage * 0.4 +
    averageFlowScore * 0.3 +
    consistencyScore * 0.2 +
    durationScore * 0.1
  );

  return {
    qualityScore: Math.max(0, Math.min(100, qualityScore)),
    breakdown: {
      flowPercentage: Math.round(flowPercentage),
      averageFlowScore: Math.round(averageFlowScore),
      consistencyScore: Math.round(consistencyScore),
      durationScore: Math.round(durationScore),
    },
  };
}

/**
 * Format duration in human-readable format
 * 
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "1h 23m 45s")
 */
export function formatDuration(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Calculate productivity score
 * 
 * @param {Object} stats - User statistics
 * @returns {number} Productivity score (0-100)
 */
export function calculateProductivityScore(stats) {
  const {
    totalSessions = 0,
    totalFlowTime = 0,
    averageFlowScore = 0,
    averageStamina = 0,
  } = stats;

  // Consistency score (more sessions = better)
  const consistencyScore = Math.min(100, totalSessions * 5);

  // Flow time score (target: 2 hours per week = 7200 seconds)
  const flowTimeScore = Math.min(100, (totalFlowTime / 7200) * 100);

  // Weighted productivity score
  const productivityScore = Math.round(
    consistencyScore * 0.2 +
    flowTimeScore * 0.3 +
    averageFlowScore * 0.3 +
    averageStamina * 0.2
  );

  return Math.max(0, Math.min(100, productivityScore));
}