// src/ai/staminaAgent.js

/**
 * Stamina Agent
 * Builds long-term focus capacity over multiple sessions.
 * 
 * Two implementations:
 * 1. Rule-based (default): Simple flow ratio calculation
 * 2. ML-based (with backend): Real-time stamina analysis via Groq
 */

import { aiConfig } from '../config/aiConfig.js';
import { APP_CONFIG } from '../config/appConfig.js';

// ============================================================================
// RULE-BASED IMPLEMENTATION (Fallback)
// ============================================================================

function updateStaminaRuleBased({
  sessionDuration,
  flowDuration,
  prevStaminaScore,
}) {
  if (sessionDuration === 0) {
    return { staminaScore: prevStaminaScore ?? 50, staminaTrend: "stable" };
  }

  const flowRatio = flowDuration / sessionDuration; // 0–1
  const target = 40 + flowRatio * 60; // 40–100

  const staminaScore = Math.round(
    0.7 * (prevStaminaScore ?? 50) + 0.3 * target
  );

  let staminaTrend = "stable";
  if (staminaScore > (prevStaminaScore ?? 50) + 2) staminaTrend = "up";
  if (staminaScore < (prevStaminaScore ?? 50) - 2) staminaTrend = "down";

  return { staminaScore, staminaTrend };
}

// ============================================================================
// ML-BASED IMPLEMENTATION (Real-time Groq Analysis)
// ============================================================================

/**
 * Analyze stamina using backend ML API
 */
async function updateStaminaWithML({
  sessionDuration,
  activeTime,
  keyPressCount,
  breakTime,
  flowScore,
  prevStaminaScore,
}) {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('[staminaAgent] No auth token, using fallback');
      return updateStaminaRuleBased({ sessionDuration, flowDuration: activeTime, prevStaminaScore });
    }

    // Get backend URL from config
    const apiUrl = aiConfig.backendUrl || 'http://localhost:3001';

    console.log('[staminaAgent] Calling ML API for stamina analysis...');

    const response = await fetch(`${apiUrl}/api/ai/analyze-stamina`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({
        sessionDuration: Math.round(sessionDuration || 0),
        activeTime: Math.round(activeTime || 0),
        keyPressCount: Math.round(keyPressCount || 0),
        breakTime: Math.round(breakTime || 0),
        flowScore: Math.round(flowScore || 50),
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response');
    }

    const { staminaScore, fatigueLevel, recommendBreak, advice } = data.data;

    let staminaTrend = "stable";
    if (staminaScore > (prevStaminaScore ?? 50) + 2) staminaTrend = "up";
    if (staminaScore < (prevStaminaScore ?? 50) - 2) staminaTrend = "down";

    console.log(`[staminaAgent] ML result: Stamina=${staminaScore}, Fatigue=${fatigueLevel}%`);

    return {
      staminaScore: Math.round(staminaScore),
      staminaTrend,
      fatigueLevel: Math.round(fatigueLevel),
      recommendBreak,
      advice,
    };
  } catch (error) {
    console.warn('[staminaAgent] ML API failed:', error.message);
    // Fallback to rule-based
    return updateStaminaRuleBased({ sessionDuration, flowDuration: activeTime, prevStaminaScore });
  }
}

// ============================================================================
// PUBLIC API (Auto-selects implementation based on config)
// ============================================================================

export async function updateStamina(metrics) {
  // Always use rule-based in demo mode
  if (APP_CONFIG.DEMO_MODE) {
    return updateStaminaRuleBased(metrics);
  }

  // Use ML if available and configured, otherwise use rule-based
  if (aiConfig.useModelStaminaAgent) {
    return await updateStaminaWithML(metrics);
  }
  return updateStaminaRuleBased(metrics);
}
