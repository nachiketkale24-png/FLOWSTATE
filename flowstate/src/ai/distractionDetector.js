/**
 * AI Distraction Detection Engine
 * 
 * Rule-based system to detect when user is distracted
 * based on behavioral signals
 */

/**
 * Evaluate distraction signals and compute focus stability
 * 
 * @param {Object} signals - Behavioral signals
 * @param {number} signals.typingCadence - Current WPM
 * @param {number} signals.activeRatio - Activity ratio (0-1)
 * @param {string} signals.flowState - Current flow state (IDLE/MONITORING/FLOW)
 * @param {boolean} signals.wasWindowBlurredRecently - Window lost focus in last 5s
 * @param {number} signals.idleSeconds - Seconds since last activity
 * @param {number} signals.tabSwitchCountLastMinute - Tab switches in last 60s
 * @returns {Object} Distraction analysis result
 */
export function evaluateDistractionSignals({
  typingCadence = 0,
  activeRatio = 0,
  flowState = 'IDLE',
  wasWindowBlurredRecently = false,
  idleSeconds = 0,
  tabSwitchCountLastMinute = 0,
}) {
  let distractionTriggered = false;
  let distractionReason = null;
  let focusStabilityScore = 100;

  // Base stability from active ratio (0-1 → 0-100)
  const baseStability = Math.round(activeRatio * 100);

  // Penalty for tab switching (each switch reduces stability by 5 points)
  const tabSwitchPenalty = Math.min(tabSwitchCountLastMinute * 5, 40);

  // Penalty for idle time
  let idlePenalty = 0;
  if (idleSeconds > 5) {
    idlePenalty = Math.min((idleSeconds - 5) * 2, 30);
  }

  // Calculate focus stability score
  focusStabilityScore = Math.max(0, Math.min(100, baseStability - tabSwitchPenalty - idlePenalty));

  // DISTRACTION DETECTION RULES

  // Rule 1: Window blur during FLOW state
  if (wasWindowBlurredRecently && flowState === 'FLOW') {
    distractionTriggered = true;
    distractionReason = 'window-blur';
  }

  // Rule 2: Prolonged idle during FLOW or MONITORING
  if (idleSeconds > 20 && (flowState === 'FLOW' || flowState === 'MONITORING')) {
    distractionTriggered = true;
    distractionReason = 'idle';
  }

  // Rule 3: Excessive tab switching (more than 5 switches per minute)
  if (tabSwitchCountLastMinute > 5) {
    distractionTriggered = true;
    distractionReason = 'tab-switching';
  }

  // Rule 4: Very low typing cadence during FLOW (possible context switch)
  if (flowState === 'FLOW' && typingCadence < 10 && idleSeconds > 10) {
    distractionTriggered = true;
    distractionReason = 'low-activity';
  }

  // Rule 5: Erratic activity pattern (very low active ratio during FLOW)
  if (flowState === 'FLOW' && activeRatio < 0.3 && idleSeconds > 5) {
    distractionTriggered = true;
    distractionReason = 'erratic-activity';
  }

  return {
    focusStabilityScore,
    distractionTriggered,
    distractionReason,
  };
}

/**
 * Get human-readable distraction message
 * 
 * @param {string} reason - Distraction reason code
 * @returns {string} Human-readable message
 */
export function getDistractionMessage(reason) {
  const messages = {
    'window-blur': '🪟 Window lost focus',
    'idle': '⏸️ Extended idle time',
    'tab-switching': '🔄 Frequent tab switching',
    'low-activity': '📉 Low activity detected',
    'erratic-activity': '⚡ Erratic activity pattern',
  };

  return messages[reason] || '⚠️ Distraction detected';
}

/**
 * Calculate distraction risk level
 * 
 * @param {number} focusStabilityScore - Focus stability score (0-100)
 * @returns {Object} Risk level info
 */
export function calculateDistractionRisk(focusStabilityScore) {
  if (focusStabilityScore >= 80) {
    return { level: 'low', color: 'green', label: 'Excellent Focus' };
  } else if (focusStabilityScore >= 60) {
    return { level: 'medium', color: 'yellow', label: 'Moderate Focus' };
  } else if (focusStabilityScore >= 40) {
    return { level: 'high', color: 'orange', label: 'Distracted' };
  } else {
    return { level: 'critical', color: 'red', label: 'Very Distracted' };
  }
}
