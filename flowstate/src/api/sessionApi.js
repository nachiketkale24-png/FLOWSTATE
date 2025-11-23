/**
 * Session API
 * 
 * Handles session lifecycle: start, update, end
 */

import { post, get } from './client';

/**
 * Start a new session
 * 
 * @param {object} initialData - Initial session data (optional)
 * @returns {Promise<object>} Session data with sessionId
 */
export async function startSession(initialData = {}) {
  try {
    const response = await post('/api/sessions/start', {
      initialData,
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to start session');
    }
  } catch (error) {
    console.error('Failed to start session:', error.message);
    throw error;
  }
}

/**
 * Update session metrics
 * 
 * @param {string} sessionId - Session ID
 * @param {object} metrics - Current metrics snapshot
 * @returns {Promise<object>} Updated session data
 */
export async function updateSessionMetrics(sessionId, metrics) {
  try {
    const response = await post(`/api/sessions/${sessionId}/update`, {
      metrics: {
        typingCadence: metrics.typingCadence,
        activeRatio: metrics.activeRatio,
        flowScore: metrics.flowScore,
        flowState: metrics.flowState,
        sessionDuration: metrics.sessionDuration,
        flowDuration: metrics.flowDuration,
        blockedCount: metrics.blockedCount,
        staminaScore: metrics.staminaScore,
        fatigueScore: metrics.fatigueScore,
        distractionRisk: metrics.distractionRisk,
        distractionEvents: metrics.distractionEvents,
        windowBlurCount: metrics.windowBlurCount,
        windowFocusCount: metrics.windowFocusCount,
        tabsSwitched: metrics.tabsSwitched,
        totalKeystrokes: metrics.totalKeystrokes,
        clickCount: metrics.clickCount,
        idleSeconds: metrics.idleSeconds,
      },
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update session');
    }
  } catch (error) {
    console.warn('Failed to update session metrics:', error.message);
    throw error;
  }
}

/**
 * End session and get summary
 * 
 * @param {string} sessionId - Session ID
 * @param {object} finalMetrics - Final session metrics
 * @returns {Promise<object>} Session summary with insights
 */
export async function endSession(sessionId, finalMetrics) {
  try {
    const response = await post(`/api/sessions/${sessionId}/end`, {
      finalMetrics: {
        sessionDuration: finalMetrics.sessionDuration,
        flowDuration: finalMetrics.flowDuration,
        flowScore: finalMetrics.flowScore,
        staminaScore: finalMetrics.staminaScore,
        blockedCount: finalMetrics.blockedCount,
        distractionEvents: finalMetrics.distractionEvents,
        typingCadence: finalMetrics.typingCadence,
        activeRatio: finalMetrics.activeRatio,
        fatigueScore: finalMetrics.fatigueScore,
        distractionRisk: finalMetrics.distractionRisk,
        windowBlurCount: finalMetrics.windowBlurCount,
        windowFocusCount: finalMetrics.windowFocusCount,
        tabsSwitched: finalMetrics.tabsSwitched,
        totalKeystrokes: finalMetrics.totalKeystrokes,
        clickCount: finalMetrics.clickCount,
        idleSeconds: finalMetrics.idleSeconds,
        timestamp: Date.now(),
      },
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to end session');
    }
  } catch (error) {
    console.error('Failed to end session:', error.message);
    throw error;
  }
}

/**
 * Get session by ID
 * 
 * @param {string} sessionId - Session ID
 * @returns {Promise<object>} Session data
 */
export async function getSession(sessionId) {
  try {
    const response = await get(`/api/sessions/${sessionId}`);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get session');
    }
  } catch (error) {
    console.error('Failed to fetch session:', error.message);
    throw error;
  }
}

/**
 * Get user sessions list (for authenticated user)
 * 
 * @param {number} limit - Maximum number of sessions to return
 * @returns {Promise<object>} Sessions list
 */
export async function getUserSessions(limit = 50) {
  try {
    const response = await get(`/api/users/sessions?limit=${limit}`);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get user sessions');
    }
  } catch (error) {
    console.error('Failed to fetch sessions:', error.message);
    throw error;
  }
}

/**
 * Get user statistics (for authenticated user)
 * 
 * @returns {Promise<object>} User statistics
 */
export async function getUserStats() {
  try {
    const response = await get('/api/users/stats');

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get user stats');
    }
  } catch (error) {
    console.error('Failed to fetch user stats:', error.message);
    throw error;
  }
}

/**
 * Get user settings (for authenticated user)
 * 
 * @returns {Promise<object>} User settings
 */
export async function getUserSettings() {
  try {
    const response = await get('/api/users/settings');

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get user settings');
    }
  } catch (error) {
    console.error('Failed to fetch user settings:', error.message);
    throw error;
  }
}

/**
 * Update user settings (for authenticated user)
 * 
 * @param {object} settings - Settings to update
 * @returns {Promise<object>} Updated settings
 */
export async function updateUserSettings(settings) {
  try {
    const response = await post('/api/users/settings', settings);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update user settings');
    }
  } catch (error) {
    console.error('Failed to update user settings:', error.message);
    throw error;
  }
}
