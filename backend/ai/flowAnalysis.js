/**
 * Flow Analysis Module
 * 
 * Hybrid approach: Rule-based + AI-powered analysis
 * Combines fast local logic with optional Groq enhancement
 */

import { analyzeFlowWithGroq } from './groqClient.js';

/**
 * Rule-based flow analysis (fast, offline)
 * 
 * @param {Object} metrics - Raw flow metrics
 * @returns {Object} Analysis results
 */
function analyzeFlowRuleBased(metrics) {
  const {
    typingCadence = 0,
    activeRatio = 0,
    prevFlowScore = 50,
    flowState = 'IDLE',
  } = metrics;

  // Normalize cadence (40-110 WPM → 0-1)
  const cadenceNorm = Math.max(0, Math.min(1, (typingCadence - 40) / 70));
  
  // Normalize active ratio (0-1)
  const activeNorm = Math.max(0, Math.min(1, activeRatio));

  // Calculate instant focus score (0-100)
  const instantScore = (cadenceNorm * 0.6 + activeNorm * 0.4) * 100;

  // Smooth with previous score (momentum)
  const flowScore = Math.round(0.6 * prevFlowScore + 0.4 * instantScore);

  // Fatigue: high when active ratio drops but score stable
  const fatigueScore = Math.round(
    Math.max(0, Math.min(100, (1 - activeNorm) * 70 + (100 - flowScore) * 0.3))
  );

  // Distraction risk: high when active ratio low or score dropping
  const distractionRisk = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        (1 - activeNorm) * 80 + (prevFlowScore > 0 ? Math.max(0, prevFlowScore - flowScore) * 0.8 : 0)
      )
    )
  );

  // Flow entry threshold
  const isFlowLikely = flowScore >= 70 && activeNorm >= 0.75;

  // Flow exit conditions
  const shouldExitFlow =
    flowState === 'FLOW' && (flowScore < 50 || activeNorm < 0.5 || fatigueScore > 80);

  return {
    flowScore,
    fatigueScore,
    distractionRisk,
    isFlowLikely,
    shouldExitFlow,
    method: 'rule-based',
  };
}

/**
 * Hybrid flow analysis: Rule-based with optional AI enhancement
 * 
 * @param {Object} rawMetrics - Raw flow metrics
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Enhanced analysis results
 */
export async function hybridFlowAnalysis(rawMetrics, options = {}) {
  const {
    useAI = process.env.GROQ_API_KEY ? true : false,
    fallbackToRules = true,
  } = options;

  try {
    // Always compute rule-based analysis first (fast baseline)
    const ruleBasedResult = analyzeFlowRuleBased(rawMetrics);

    // If AI is disabled or not configured, return rule-based only
    if (!useAI || !process.env.GROQ_API_KEY) {
      console.log('📊 Using rule-based flow analysis (AI disabled)');
      return ruleBasedResult;
    }

    // Try to enhance with AI analysis
    try {
      console.log('🤖 Attempting AI-enhanced flow analysis...');
      
      const aiResult = await analyzeFlowWithGroq({
        typingCadence: rawMetrics.typingCadence || 0,
        activeRatio: rawMetrics.activeRatio || 0,
        prevFlowScore: rawMetrics.prevFlowScore || 50,
        flowState: rawMetrics.flowState || 'IDLE',
      });

      // Validate AI response
      if (
        typeof aiResult.flowScore === 'number' &&
        typeof aiResult.fatigueScore === 'number' &&
        typeof aiResult.distractionRisk === 'number'
      ) {
        console.log('✅ AI-enhanced analysis successful');
        return {
          ...aiResult,
          method: 'ai-enhanced',
          ruleBasedFallback: ruleBasedResult,
        };
      } else {
        console.warn('⚠️  AI response invalid, using rule-based fallback');
        return ruleBasedResult;
      }
    } catch (aiError) {
      console.error('❌ AI analysis failed:', aiError.message);
      
      if (fallbackToRules) {
        console.log('📊 Falling back to rule-based analysis');
        return ruleBasedResult;
      } else {
        throw aiError;
      }
    }
  } catch (error) {
    console.error('❌ Flow analysis error:', error);
    
    // Final fallback
    return analyzeFlowRuleBased(rawMetrics);
  }
}

/**
 * Batch analyze multiple metric snapshots
 * 
 * @param {Array<Object>} metricsArray - Array of metric snapshots
 * @returns {Promise<Array<Object>>} Array of analysis results
 */
export async function batchAnalyzeFlow(metricsArray) {
  const results = [];

  for (const metrics of metricsArray) {
    const analysis = await hybridFlowAnalysis(metrics);
    results.push({
      timestamp: metrics.timestamp || new Date().toISOString(),
      ...analysis,
    });
  }

  return results;
}

/**
 * Calculate flow quality score from timeline
 * 
 * @param {Array<Object>} timeline - Array of metric snapshots
 * @returns {Object} Aggregated flow quality metrics
 */
export function calculateFlowQuality(timeline) {
  if (!timeline || timeline.length === 0) {
    return {
      averageFlowScore: 0,
      peakFlowScore: 0,
      flowStability: 0,
      totalFlowTime: 0,
    };
  }

  let totalFlowScore = 0;
  let peakFlowScore = 0;
  let flowTimeSeconds = 0;
  const flowScores = [];

  timeline.forEach(snapshot => {
    const score = snapshot.flowScore || 0;
    totalFlowScore += score;
    peakFlowScore = Math.max(peakFlowScore, score);
    flowScores.push(score);

    // Count as flow time if score >= 70
    if (score >= 70) {
      flowTimeSeconds += 1; // Assuming 1-second intervals
    }
  });

  const averageFlowScore = Math.round(totalFlowScore / timeline.length);

  // Calculate stability (inverse of standard deviation)
  const mean = averageFlowScore;
  const variance = flowScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / flowScores.length;
  const stdDev = Math.sqrt(variance);
  const flowStability = Math.max(0, 100 - stdDev); // Higher = more stable

  return {
    averageFlowScore,
    peakFlowScore,
    flowStability: Math.round(flowStability),
    totalFlowTime: flowTimeSeconds,
  };
}