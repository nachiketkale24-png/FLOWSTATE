// src/ai/distractionAgent.js

/**
 * Distraction Agent
 * Detects and analyzes distraction patterns during focus sessions.
 * 
 * Two implementations:
 * 1. Rule-based (default): Probability-based detection
 * 2. ML-based (with backend): Real-time distraction analysis via Groq
 */

import { aiConfig } from '../config/aiConfig.js';
import { APP_CONFIG } from '../config/appConfig.js';

const DISTRACTION_SITES = [
  "youtube.com",
  "instagram.com",
  "twitter.com",
  "reddit.com",
  "netflix.com",
];

// ============================================================================
// RULE-BASED IMPLEMENTATION (Fallback)
// ============================================================================

function decideDistractionRuleBased({ flowState, distractionRisk }) {
  if (flowState !== "FLOW") return { shouldBlock: false, site: null };

  // Base probability: 3–10% per second depending on risk
  const baseProb = 0.03 + (distractionRisk / 100) * 0.07; // 0.03–0.10
  if (Math.random() < baseProb) {
    const site = DISTRACTION_SITES[Math.floor(Math.random() * DISTRACTION_SITES.length)];
    return { shouldBlock: true, site };
  }

  return { shouldBlock: false, site: null };
}

// ============================================================================
// ML-BASED IMPLEMENTATION (Real-time Groq Analysis)
// ============================================================================

/**
 * Detect distractions using backend ML API
 */
async function detectDistractionWithML({
  windowSwitches,
  tabSwitches,
  focusLosses,
  keyboardGaps,
  screenTime,
}) {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('[distractionAgent] No auth token, using fallback');
      return { shouldBlock: false, site: null };
    }

    // Get backend URL from config
    const apiUrl = aiConfig.backendUrl || 'http://localhost:3001';

    console.log('[distractionAgent] Calling ML API for distraction detection...');

    const response = await fetch(`${apiUrl}/api/ai/detect-distractions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({
        windowSwitches: Math.round(windowSwitches || 0),
        tabSwitches: Math.round(tabSwitches || 0),
        focusLosses: Math.round(focusLosses || 0),
        keyboardGaps: Math.round(keyboardGaps || 0),
        screenTime: Math.round(screenTime || 0),
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response');
    }

    const { distractionScore, focusHealthScore, detectedDistractions, severity, recommendation } = data.data;

    console.log(`[distractionAgent] ML result: Severity=${severity}, Score=${distractionScore}`);

    // Decide if should block based on severity
    let shouldBlock = false;
    let site = null;

    if (severity === 'high' && distractionScore > 70) {
      shouldBlock = true;
      site = DISTRACTION_SITES[Math.floor(Math.random() * DISTRACTION_SITES.length)];
    } else if (severity === 'medium' && Math.random() < 0.4) {
      shouldBlock = true;
      site = DISTRACTION_SITES[Math.floor(Math.random() * DISTRACTION_SITES.length)];
    }

    return {
      shouldBlock,
      site,
      distractionScore: Math.round(distractionScore),
      focusHealthScore: Math.round(focusHealthScore),
      detectedDistractions,
      severity,
      recommendation,
    };
  } catch (error) {
    console.warn('[distractionAgent] ML API failed:', error.message);
    // Fallback to rule-based
    return { shouldBlock: false, site: null };
  }
}

// ============================================================================
// PUBLIC API (Auto-selects implementation based on config)
// ============================================================================

export async function detectDistraction(metrics) {
  // Always use rule-based in demo mode
  if (APP_CONFIG.DEMO_MODE) {
    return decideDistractionRuleBased(metrics);
  }

  // Use ML if available and configured, otherwise use rule-based
  if (aiConfig.useModelDistractionAgent) {
    return await detectDistractionWithML(metrics);
  }
  return decideDistractionRuleBased(metrics);
}
