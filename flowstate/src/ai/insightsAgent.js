// src/ai/insightsAgent.js

/**
 * Insights Agent
 * Generates human-readable AI insights for session summaries.
 * 
 * Two implementations:
 * 1. Rule-based (default): Template-based text generation
 * 2. Model-based (optional): Natural language generation via LLM
 */

import { aiConfig } from '../config/aiConfig.js';

// ============================================================================
// RULE-BASED IMPLEMENTATION (Default)
// ============================================================================

function generateInsightsRuleBased({ sessionDuration, flowDuration, staminaScore }) {
  const insights = [];

  const mins = (s) => Math.round(s / 60);

  const flowRatio = sessionDuration
    ? (flowDuration / sessionDuration) * 100
    : 0;

  insights.push(
    `You spent ${mins(flowDuration)} min in flow (${flowRatio.toFixed(
      0
    )}% of this session).`
  );

  if (flowRatio > 70) {
    insights.push("This was a strong deep-work block. Try to repeat this time window.");
  } else if (flowRatio < 40) {
    insights.push(
      "Flow was fragile this session. Shorter sessions or better blocking might help."
    );
  }

  if (staminaScore >= 70) {
    insights.push("Your focus stamina is in a strong zone. You can handle longer flow blocks.");
  } else if (staminaScore <= 50) {
    insights.push(
      "Stamina is still warming up. Aim for consistent 20–25 minute focus chunks."
    );
  }

  return insights;
}

// ============================================================================
// MODEL-BASED IMPLEMENTATION (Optional)
// ============================================================================

/**
 * Generate natural language insights using LLM.
 * 
 * Benefits:
 * - Personalized, conversational feedback
 * - Can reference specific events from session
 * - More nuanced understanding of productivity patterns
 * - Actionable advice tailored to user's work style
 * 
 * TODO: Implement actual API calls when ready
 */
async function generateInsightsWithModel({ sessionDuration, flowDuration, staminaScore }) {
  try {
    const flowMinutes = Math.floor(flowDuration / 60);
    const sessionMinutes = Math.floor(sessionDuration / 60);
    const flowPercent = sessionDuration > 0 ? (flowDuration / sessionDuration * 100).toFixed(0) : 0;
    
    // TODO: Build comprehensive prompt with session context
    const _prompt = `
You are an AI productivity coach analyzing a focus session. Generate 3-4 brief, actionable insights:

Session Metrics:
- Total duration: ${sessionMinutes} minutes
- Flow duration: ${flowMinutes} minutes (${flowPercent}% of session)
- Stamina score: ${staminaScore}/100

Provide insights as a JSON array of strings. Each insight should be:
- One sentence (15-25 words)
- Actionable and encouraging
- Based on the metrics provided
- Focused on improvement or recognition

Example: ["Great focus stamina! Your ${flowMinutes}-minute flow state shows strong concentration.", "Consider a short break - fatigue is building up."]
    `.trim();

    // TODO: Call Groq or OpenAI API
    // const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${aiConfig.groqApiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: aiConfig.modelName,
    //     messages: [{ role: 'user', content: _prompt }],
    //     max_tokens: aiConfig.maxTokens,
    //     temperature: 0.8,
    //   }),
    // });
    // const data = await response.json();
    // return JSON.parse(data.choices[0].message.content);

    console.warn('[insightsAgent] Model-based generation not yet implemented, using rule-based fallback');
    return generateInsightsRuleBased({ sessionDuration, flowDuration, staminaScore });
  } catch (error) {
    console.error('[insightsAgent] Model call failed, falling back to rules:', error);
    return generateInsightsRuleBased({ sessionDuration, flowDuration, staminaScore });
  }
}

// ============================================================================
// PUBLIC API (Auto-selects implementation based on config)
// ============================================================================

export async function generateInsights(metrics) {
  if (aiConfig.useModelInsightsAgent && aiConfig.groqApiKey) {
    return await generateInsightsWithModel(metrics);
  }
  return generateInsightsRuleBased(metrics);
}
