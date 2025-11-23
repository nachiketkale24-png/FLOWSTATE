/**
 * AI Controller - MongoDB Version
 */

const groqService = require('../services/groqService');
const Session = require('../models/Session');
const User = require('../models/User');
const logger = require('../utils/logger');
const groqClient = require('../ai/groqClient');

async function sendAIMessage(req, res) {
  try {
    const { message, context } = req.body;
    const userId = req.userId;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    logger.info(`[AI Chat] User ${userId}: ${message}`);

    // Build context from user data
    let contextString = '';
    if (context) {
      const { currentMetrics, todayStats } = context;

      contextString = `
User Context:
- Current Flow Score: ${currentMetrics?.flowScore || 0}
- Current Flow State: ${currentMetrics?.flowState || 'IDLE'}
- Stamina Score: ${currentMetrics?.stamina || 0}
- Attention Score: ${currentMetrics?.attention || 0}

Today's Stats:
- Total Sessions: ${todayStats?.totalSessions || 0}
- Average Flow Score: ${todayStats?.avgFlowScore || 0}
- Total Time: ${todayStats?.totalTime || 0} seconds
- Current Streak: ${todayStats?.currentStreak || 0} days

You are FlowState AI, a personal productivity assistant. Answer the user's question about their flow state, productivity patterns, or give advice on improving focus.
`;
    }

    // Get AI response
    const aiResponse = await getAIResponse(message, contextString);

    // Generate suggestions
    const suggestions = generateSuggestions(message, context);

    return res.json({
      success: true,
      data: {
        message: aiResponse,
        suggestions,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('❌ AI chat error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get AI response',
      message: error.message,
    });
  }
}

async function getAIResponse(message, context) {
  try {
    // Try Groq API first
    if (process.env.GROQ_API_KEY) {
      const response = await groqService.generateGroqResponse(message, context);
      if (response) return response;
    }
  } catch (error) {
    logger.warn('⚠️  Groq API error, using fallback:', error.message);
  }

  // Fallback to pattern matching
  return generateFallbackResponse(message);
}

function generateFallbackResponse(message) {
  const lowerMsg = message.toLowerCase();

  // Flow state questions
  if (lowerMsg.includes('flow') && (lowerMsg.includes('what') || lowerMsg.includes('how') || lowerMsg.includes('score'))) {
    return "Your flow score shows how deeply you're focused on your work. A score above 70 indicates strong flow state, where you're fully immersed and productive. Maintain consistent attention and minimize distractions to improve it.";
  }

  // Improvement tips
  if (lowerMsg.includes('improve') || lowerMsg.includes('better') || lowerMsg.includes('tips')) {
    return "Here are 5 proven ways to improve your flow:\n1. Start with clear goals for each session\n2. Eliminate distractions before you begin\n3. Take regular breaks to maintain stamina\n4. Track your patterns to find your peak hours\n5. Gradually increase session duration as you build focus";
  }

  // Analysis questions
  if (lowerMsg.includes('analysis') || lowerMsg.includes('pattern') || lowerMsg.includes('trend')) {
    return "Check the History and Analytics pages to see your productivity patterns over time. You'll find insights about your peak performance times, average flow scores, and streak trends.";
  }

  // Best time questions
  if (lowerMsg.includes('best time') || lowerMsg.includes('when should')) {
    return "Your best performance times are visible in the Analytics section. Generally, most people achieve peak flow in mid-morning (10-11am) or early afternoon (2-3pm). Track your sessions to discover your personal peak hours.";
  }

  // Distraction questions
  if (lowerMsg.includes('distract') || lowerMsg.includes('focus')) {
    return "To minimize distractions: Turn on Do Not Disturb mode, close unnecessary tabs/apps, silence notifications, and set up a dedicated workspace. The FlowState camera tracking can help alert you when you lose focus.";
  }

  // Streak questions
  if (lowerMsg.includes('streak')) {
    return "Maintaining a streak builds consistency and discipline. Even short 15-minute sessions count toward your streak. Set a daily goal that's achievable, and gradually increase intensity as the habit solidifies.";
  }

  // General greeting or unclear
  return "I'm here to help you optimize your productivity and achieve deeper flow states. Ask me about your flow scores, productivity tips, best practices, or anything else about improving your focus!";
}

function generateSuggestions(message, context) {
  const suggestions = [];

  if (context?.currentMetrics?.flowScore < 50) {
    suggestions.push("How can I improve my flow score?");
    suggestions.push("What's causing my low focus?");
  }

  if (context?.todayStats?.totalSessions === 0) {
    suggestions.push("How do I start a productive session?");
    suggestions.push("What's the ideal session length?");
  }

  if (context?.currentMetrics?.stamina < 30) {
    suggestions.push("When should I take a break?");
    suggestions.push("How to prevent burnout?");
  }

  if (suggestions.length === 0) {
    suggestions.push("Show me my productivity trends");
    suggestions.push("What's my best time to work?");
    suggestions.push("Tips for maintaining focus");
  }

  return suggestions.slice(0, 3);
}

/**
 * Real-time Flow State Analysis using Groq AI
 * 
 * Analyzes current typing patterns and focus metrics to determine flow state
 * 
 * @param {Request} req - Request object with userId in token and analysis metrics in body
 * @param {Response} res - Response object
 */
async function analyzeFlowRealtime(req, res) {
  try {
    const { typingCadence, activeRatio, prevFlowScore, flowState } = req.body;
    const userId = req.userId;

    // Validate inputs
    if (typeof typingCadence !== 'number' || typeof activeRatio !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid metrics: typingCadence and activeRatio required',
      });
    }

    logger.info(`[Flow Analysis] User ${userId}: Cadence=${typingCadence}, Active=${(activeRatio*100).toFixed(1)}%`);

    try {
      // Get Groq client and call flow analysis
      const groq = groqClient;
      
      const analysis = await groq.analyzeFlowWithGroq({
        typingCadence: Math.max(0, typingCadence), // Ensure non-negative
        activeRatio: Math.max(0, Math.min(1, activeRatio)), // Clamp 0-1
        prevFlowScore: prevFlowScore || 50,
        flowState: flowState || 'MONITORING',
      });

      logger.info(`[Flow Analysis] Result: Flow=${analysis.flowScore}, Fatigue=${analysis.fatigueScore}`);

      return res.json({
        success: true,
        data: {
          flowScore: Math.round(analysis.flowScore),
          fatigueScore: Math.round(analysis.fatigueScore),
          distractionRisk: Math.round(analysis.distractionRisk),
          isFlowLikely: analysis.isFlowLikely,
          shouldExitFlow: analysis.shouldExitFlow,
          reasoning: analysis.reasoning,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (groqError) {
      logger.warn(`⚠️  Groq API error: ${groqError.message}, using fallback analysis`);
      
      // Fallback to rule-based analysis
      const fallbackAnalysis = generateFlowAnalysisFallback(
        typingCadence,
        activeRatio,
        prevFlowScore
      );

      return res.json({
        success: true,
        data: fallbackAnalysis,
        message: 'Using fallback analysis (Groq unavailable)',
      });
    }
  } catch (error) {
    logger.error('❌ Flow analysis error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze flow state',
      message: error.message,
    });
  }
}

/**
 * Real-time Stamina Analysis using Groq AI
 * 
 * Analyzes user fatigue and energy levels to predict burnout
 * 
 * @param {Request} req - Request object with userId and stamina metrics
 * @param {Response} res - Response object
 */
async function analyzeStamina(req, res) {
  try {
    const { sessionDuration, activeTime, keyPressCount, breakTime, flowScore } = req.body;
    const userId = req.userId;

    logger.info(`[Stamina Analysis] User ${userId}: Duration=${sessionDuration}s`);

    try {
      // Get Groq client for stamina analysis
      const groq = groqClient;
      
      const staminaPrompt = `
Analyze user stamina and energy levels based on this session data:

- Session Duration: ${sessionDuration || 0} seconds
- Active Time: ${activeTime || 0} seconds
- Key Presses: ${keyPressCount || 0}
- Break Time Taken: ${breakTime || 0} seconds
- Current Flow Score: ${flowScore || 50}

Respond with ONLY a JSON object:
{
  "staminaScore": <number 0-100>,
  "fatigueLevel": <number 0-100>,
  "recommendBreak": <boolean>,
  "recoveryMinutes": <number>,
  "advice": "<brief recommendation>"
}

Consider:
- Fatigue increases with continuous work (>60 min without break)
- Low key presses with high duration = mental fatigue
- Higher flow score = using stamina efficiently
`.trim();

      const analysis = await groq.analyzeWithGroq(staminaPrompt, {
        systemPrompt: 'You are a stamina analysis AI. Respond ONLY with valid JSON.',
        temperature: 0.3,
      });

      logger.info(`[Stamina Analysis] Result: Stamina=${analysis.staminaScore}`);

      return res.json({
        success: true,
        data: {
          staminaScore: Math.round(analysis.staminaScore),
          fatigueLevel: Math.round(analysis.fatigueLevel),
          recommendBreak: analysis.recommendBreak,
          recoveryMinutes: analysis.recoveryMinutes || 15,
          advice: analysis.advice,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (groqError) {
      logger.warn(`⚠️  Stamina Groq error: ${groqError.message}, using fallback`);
      
      // Fallback: simple rule-based stamina calculation
      const sessionMinutes = (sessionDuration || 0) / 60;
      const activeMinutes = (activeTime || 0) / 60;
      const staminaScore = Math.max(0, 100 - Math.min(sessionMinutes * 2, 50) - (breakTime ? 0 : 20));

      return res.json({
        success: true,
        data: {
          staminaScore: Math.round(staminaScore),
          fatigueLevel: Math.min(100, sessionMinutes * 3),
          recommendBreak: sessionMinutes > 45,
          recoveryMinutes: 15,
          advice: 'Take a break to recharge your energy',
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    logger.error('❌ Stamina analysis error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze stamina',
      message: error.message,
    });
  }
}

/**
 * Real-time Distraction Detection using Groq AI
 * 
 * Detects and analyzes distraction patterns and window switches
 * 
 * @param {Request} req - Request object with distraction metrics
 * @param {Response} res - Response object
 */
async function detectDistractions(req, res) {
  try {
    const { windowSwitches, tabSwitches, focusLosses, keyboardGaps, screenTime } = req.body;
    const userId = req.userId;

    logger.info(`[Distraction Detection] User ${userId}: Switches=${windowSwitches}, Gaps=${keyboardGaps}`);

    try {
      // Get Groq client for distraction analysis
      const groq = groqClient;
      
      const distractionPrompt = `
Analyze distraction patterns from this data:

- Window Switches (30 sec): ${windowSwitches || 0}
- Tab Switches (30 sec): ${tabSwitches || 0}
- Focus Losses: ${focusLosses || 0}
- Keyboard Gaps (>2 sec): ${keyboardGaps || 0}
- Active Screen Time: ${screenTime || 0} seconds

Respond with ONLY a JSON object:
{
  "distractionScore": <number 0-100>,
  "focusHealthScore": <number 0-100>,
  "detectedDistractions": <array of strings>,
  "severity": "<low|medium|high>",
  "recommendation": "<brief action to reduce distractions>"
}

Severity levels:
- low: <2 switches, <3 gaps (normal work rhythm)
- medium: 2-5 switches, 3-8 gaps (some distraction)
- high: >5 switches, >8 gaps (significant distractions)
`.trim();

      const analysis = await groq.analyzeWithGroq(distractionPrompt, {
        systemPrompt: 'You are a distraction detector. Respond ONLY with valid JSON.',
        temperature: 0.2,
      });

      logger.info(`[Distraction Detection] Severity=${analysis.severity}`);

      return res.json({
        success: true,
        data: {
          distractionScore: Math.round(analysis.distractionScore),
          focusHealthScore: Math.round(analysis.focusHealthScore),
          detectedDistractions: analysis.detectedDistractions || [],
          severity: analysis.severity || 'medium',
          recommendation: analysis.recommendation,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (groqError) {
      logger.warn(`⚠️  Distraction Groq error: ${groqError.message}, using fallback`);
      
      // Fallback: rule-based distraction scoring
      const totalSwitches = (windowSwitches || 0) + (tabSwitches || 0);
      const distractionScore = Math.min(100, totalSwitches * 10 + (keyboardGaps || 0) * 5);
      const severity = distractionScore > 60 ? 'high' : distractionScore > 30 ? 'medium' : 'low';

      return res.json({
        success: true,
        data: {
          distractionScore: Math.round(distractionScore),
          focusHealthScore: Math.max(0, 100 - distractionScore),
          detectedDistractions: totalSwitches > 5 ? ['Frequent window switching', 'High tab switching'] : [],
          severity,
          recommendation: 'Try closing unnecessary tabs and apps to minimize distractions',
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    logger.error('❌ Distraction detection error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to detect distractions',
      message: error.message,
    });
  }
}

/**
 * Fallback flow analysis using rule-based approach
 * 
 * @param {number} typingCadence - Words per minute
 * @param {number} activeRatio - Percentage of time typing (0-1)
 * @param {number} prevFlowScore - Previous flow score
 * @returns {Object} Flow analysis object
 */
function generateFlowAnalysisFallback(typingCadence, activeRatio, prevFlowScore) {
  const activePercent = activeRatio * 100;
  
  // Flow score calculation: weighted average of metrics
  let flowScore = (prevFlowScore || 50) * 0.3; // Previous score weight
  flowScore += Math.min(typingCadence / 0.4, 100) * 0.4; // Typing cadence (normalize at 40 WPM)
  flowScore += activePercent * 0.3; // Activity ratio
  
  const fatigue = 100 - activePercent; // Higher inactivity = more fatigue
  const distractionRisk = 100 - flowScore; // Risk inverse of flow
  
  return {
    flowScore: Math.round(Math.max(0, Math.min(100, flowScore))),
    fatigueScore: Math.round(Math.max(0, Math.min(100, fatigue))),
    distractionRisk: Math.round(Math.max(0, Math.min(100, distractionRisk))),
    isFlowLikely: flowScore > 65,
    shouldExitFlow: fatigue > 80,
    reasoning: `Flow analysis: ${typingCadence.toFixed(0)} WPM, ${activePercent.toFixed(1)}% active`,
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  sendAIMessage,
  analyzeFlowRealtime,
  analyzeStamina,
  detectDistractions,
};
