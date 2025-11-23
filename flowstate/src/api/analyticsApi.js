/**
 * Analytics API
 * 
 * Handles analytics and statistics queries
 */

import { apiRequest, ENDPOINTS, showToast } from './config';

/**
 * Get weekly analytics
 * 
 * @param {string} userId - User ID
 * @returns {Promise<object>} Weekly analytics data
 */
export async function getWeeklyAnalytics(userId) {
  try {
    const response = await apiRequest(ENDPOINTS.ANALYTICS_WEEKLY, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get weekly analytics');
    }
  } catch (error) {
    showToast(`Failed to fetch analytics: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Get stamina analytics
 * 
 * @param {string} userId - User ID
 * @returns {Promise<object>} Stamina trends and data
 */
export async function getStaminaAnalytics(userId) {
  try {
    const response = await apiRequest(ENDPOINTS.ANALYTICS_STAMINA, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get stamina analytics');
    }
  } catch (error) {
    showToast(`Failed to fetch stamina data: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Analyze flow metrics (hybrid rule-based + AI)
 * 
 * @param {object} metrics - Current flow metrics
 * @returns {Promise<object>} Flow analysis results
 */
export async function analyzeFlowMetrics(metrics) {
  try {
    const response = await apiRequest(ENDPOINTS.ANALYTICS_FLOW, {
      method: 'POST',
      body: JSON.stringify({
        metrics: {
          typingCadence: metrics.typingCadence,
          activeRatio: metrics.activeRatio,
          prevFlowScore: metrics.flowScore,
          flowState: metrics.flowState,
        },
      }),
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to analyze flow');
    }
  } catch (error) {
    console.warn('Flow analysis failed, using local fallback:', error.message);
    // Return null to allow local fallback
    return null;
  }
}

/**
 * Get session breakdown by hour
 * 
 * @param {string} userId - User ID
 * @param {number} days - Number of days to analyze
 * @returns {Promise<object>} Hourly breakdown data
 */
export async function getHourlyBreakdown(userId, days = 7) {
  try {
    const response = await apiRequest(`${ENDPOINTS.USER_STATS(userId)}?breakdown=hourly&days=${days}`, {
      method: 'GET',
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get hourly breakdown');
    }
  } catch (error) {
    showToast(`Failed to fetch hourly data: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Get distraction breakdown
 * 
 * @param {string} userId - User ID
 * @param {number} days - Number of days to analyze
 * @returns {Promise<object>} Distraction categories and counts
 */
export async function getDistractionBreakdown(userId, days = 7) {
  try {
    const response = await apiRequest(`${ENDPOINTS.USER_STATS(userId)}?breakdown=distractions&days=${days}`, {
      method: 'GET',
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get distraction breakdown');
    }
  } catch (error) {
    showToast(`Failed to fetch distraction data: ${error.message}`, 'error');
    throw error;
  }
}
