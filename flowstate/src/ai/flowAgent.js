// src/ai/flowAgent.js

/**
 * Flow Agent
 * Core analysis engine that determines flow state.
 * 
 * Two implementations:
 * 1. Rule-based (default): Fast, offline, deterministic
 * 2. Model-based (optional): Uses Groq/GPT for nuanced analysis
 */

import { aiConfig } from '../config/aiConfig.js';
import { APP_CONFIG } from '../config/appConfig.js';

// ============================================================================
// RULE-BASED IMPLEMENTATION (Default)
// ============================================================================

function analyzeFlowRuleBased({ typingCadence, activeRatio, prevFlowScore, flowState }) {
  // Normalize cadence (50–110 wpm → 0–1)
  const cadenceNorm = Math.max(0, Math.min(1, (typingCadence - 40) / 70));
  // Active ratio (0.5–1.0)
  const activeNorm = Math.max(0, Math.min(1, activeRatio));

  // Instant focus estimate (0–100)
  const instantScore = (cadenceNorm * 0.6 + activeNorm * 0.4) * 100;

  // Smooth with previous score → feels more "stable"
  const flowScore = Math.round(0.6 * prevFlowScore + 0.4 * instantScore);

  // Fatigue: high when score stabilises but active ratio drops
  const fatigueScore = Math.round(
    Math.max(0, Math.min(100, (1 - activeNorm) * 70 + (100 - flowScore) * 0.3))
  );

  // Distraction risk: high when active ratio low or score dropping
  const distractionRisk = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        (1 - activeNorm) * 80 +
          (prevFlowScore > 0 ? Math.max(0, prevFlowScore - flowScore) * 0.8 : 0)
      )
    )
  );

  const isFlowLikely = flowScore >= 70 && activeNorm >= 0.75;
  const shouldExitFlow =
    flowState === "FLOW" && (flowScore < 50 || activeNorm < 0.5 || fatigueScore > 80);

  return {
    flowScore,
    fatigueScore,
    distractionRisk,
    isFlowLikely,
    shouldExitFlow,
    method: 'rule-based',
  };
}

// ============================================================================
// MODEL-BASED IMPLEMENTATION (Real-time Groq API)
// ============================================================================

/**
 * Analyze flow state using Groq API (Real-time ML)
 */
async function analyzeFlowWithModel({ typingCadence, activeRatio, prevFlowScore, flowState }) {
  try {
    const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    
    const response = await fetch(`${apiUrl}/api/ai/analyze-flow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
      credentials: 'include',
      body: JSON.stringify({
        typingCadence,
        activeRatio,
        prevFlowScore,
        flowState,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to analyze flow');
    }

    const data = await response.json();
    
    if (data.success) {
      return {
        ...data.data,
        method: 'groq-api',
      };
    } else {
      throw new Error(data.message || 'Analysis failed');
    }
  } catch (error) {
    console.warn('[flowAgent] ML API call failed, falling back to rules:', error.message);
    return analyzeFlowRuleBased({ typingCadence, activeRatio, prevFlowScore, flowState });
  }
}

// ============================================================================
// PUBLIC API (Auto-selects implementation based on config)
// ============================================================================

export async function analyzeFlow(metrics) {
  // Always use rule-based in demo mode
  if (APP_CONFIG.DEMO_MODE) {
    return analyzeFlowRuleBased(metrics);
  }

  if (aiConfig.useModelFlowAgent && aiConfig.groqApiKey) {
    return await analyzeFlowWithModel(metrics);
  }
  return analyzeFlowRuleBased(metrics);
}
