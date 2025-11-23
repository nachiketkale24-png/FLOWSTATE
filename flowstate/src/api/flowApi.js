/**
 * Flow API
 * 
 * Handles AI-powered flow analysis and insights generation
 */

import { apiRequest, ENDPOINTS } from './config';

/**
 * Generate AI insights for a session
 * 
 * @param {object} sessionData - Session data including metrics
 * @returns {Promise<object>} AI-generated insights
 */
export async function generateInsights(sessionData) {
  try {
    const response = await apiRequest(ENDPOINTS.AI_INSIGHTS, {
      method: 'POST',
      body: JSON.stringify({
        sessionData: {
          sessionDuration: sessionData.sessionDuration,
          flowDuration: sessionData.flowDuration,
          staminaScore: sessionData.staminaScore,
          flowScore: sessionData.flowScore,
          blockedCount: sessionData.blockedCount,
          distractionEvents: sessionData.distractionEvents,
          focusStabilityScore: sessionData.focusStabilityScore,
        },
      }),
    });

    if (response.success) {
      return response.data.insights || [];
    } else {
      throw new Error(response.message || 'Failed to generate insights');
    }
  } catch (error) {
    console.warn('AI insights generation failed:', error.message);
    // Return empty array to allow UI to show fallback insights
    return [];
  }
}

/**
 * Analyze flow state in real-time
 * 
 * @param {object} metrics - Current metrics
 * @returns {Promise<object>} Flow analysis with recommendations
 */
export async function analyzeFlowState(metrics) {
  try {
    const response = await apiRequest(ENDPOINTS.AI_FLOW_ANALYSIS, {
      method: 'POST',
      body: JSON.stringify({
        metrics: {
          typingCadence: metrics.typingCadence,
          activeRatio: metrics.activeRatio,
          prevFlowScore: metrics.flowScore,
          flowState: metrics.flowState,
          sessionDuration: metrics.sessionDuration,
          blockedCount: metrics.blockedCount,
        },
      }),
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to analyze flow state');
    }
  } catch (error) {
    console.warn('Flow state analysis failed:', error.message);
    // Return null to indicate fallback should be used
    return null;
  }
}

/**
 * Get personalized recommendations
 * 
 * @param {string} userId - User ID
 * @param {object} currentMetrics - Current session metrics
 * @returns {Promise<array>} Array of recommendations
 */
export async function getRecommendations(userId, currentMetrics) {
  try {
    const response = await apiRequest(`${ENDPOINTS.AI_INSIGHTS}?type=recommendations`, {
      method: 'POST',
      body: JSON.stringify({
        userId,
        currentMetrics: {
          flowScore: currentMetrics.flowScore,
          staminaScore: currentMetrics.staminaScore,
          distractionEvents: currentMetrics.distractionEvents,
          focusStabilityScore: currentMetrics.focusStabilityScore,
        },
      }),
    });

    if (response.success) {
      return response.data.recommendations || [];
    } else {
      throw new Error(response.message || 'Failed to get recommendations');
    }
  } catch (error) {
    console.warn('Recommendations generation failed:', error.message);
    return [];
  }
}

/**
 * Send a chat message to AI assistant
 * 
 * @param {string} message - User's message
 * @param {string} userId - User ID
 * @param {object} context - Optional session context
 * @returns {Promise<object>} AI response
 */
export async function sendChatMessage(message, userId, context = null) {
  try {
    const response = await apiRequest(ENDPOINTS.AI_CHAT, {
      method: 'POST',
      body: JSON.stringify({
        message,
        userId,
        context,
      }),
    });

    if (response.success) {
      return {
        message: response.data.message || response.data.response || 'No response',
        suggestions: response.data.suggestions || [],
      };
    } else {
      throw new Error(response.message || 'Failed to send message');
    }
  } catch (error) {
    console.error('Chat message failed:', error.message);
    throw error;
  }
}

/**
 * Check backend health
 * 
 * @returns {Promise<boolean>} True if backend is healthy
 */
export async function checkBackendHealth() {
  try {
    const response = await apiRequest('/health', {
      method: 'GET',
    });

    return response.status === 'healthy';
  } catch (error) {
    console.warn('Backend health check failed:', error.message);
    return false;
  }
}
