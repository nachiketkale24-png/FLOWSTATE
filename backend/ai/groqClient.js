/**
 * Groq AI Client
 * 
 * Integration with Groq API for fast LLM inference
 * Models: llama-3.1-70b-versatile, mixtral-8x7b-32768
 */

const fetch = require('node-fetch');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * Analyze data using Groq LLM
 * 
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Parsed JSON response from model
 */
async function analyzeWithGroq(prompt, options = {}) {
  try {
    // Check if API key is configured
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured in environment variables');
    }

    const {
      model = process.env.AI_MODEL || 'llama-3.1-70b-versatile',
      temperature = parseFloat(process.env.AI_TEMPERATURE) || 0.7,
      maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 500,
      systemPrompt = 'You are an AI assistant specialized in productivity and flow state analysis.',
    } = options;

    console.log(`🤖 Calling Groq API (${model})...`);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
        top_p: 1,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Groq API');
    }

    const content = data.choices[0].message.content.trim();

    console.log(`✅ Groq API response received (${data.usage?.total_tokens || 0} tokens)`);

    // Try to parse as JSON if it looks like JSON
    if (content.startsWith('{') || content.startsWith('[')) {
      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.warn('⚠️  Response is not valid JSON, returning as text');
        return { text: content };
      }
    }

    return { text: content };
  } catch (error) {
    console.error('❌ Groq API error:', error.message);
    throw error;
  }
}

/**
 * Analyze flow state using Groq
 * 
 * @param {Object} metrics - Flow metrics
 * @returns {Promise<Object>} Flow analysis
 */
async function analyzeFlowWithGroq(metrics) {
  const prompt = `
Analyze this flow state based on the following metrics:

- Typing Cadence: ${metrics.typingCadence} WPM
- Active Ratio: ${(metrics.activeRatio * 100).toFixed(1)}%
- Previous Flow Score: ${metrics.prevFlowScore}/100
- Current State: ${metrics.flowState}

Respond with ONLY a JSON object (no markdown, no explanation) with this exact structure:
{
  "flowScore": <number 0-100>,
  "fatigueScore": <number 0-100>,
  "distractionRisk": <number 0-100>,
  "isFlowLikely": <boolean>,
  "shouldExitFlow": <boolean>,
  "reasoning": "<brief explanation>"
}

Consider:
- Flow likely if typing is consistent (>40 WPM) and focus is high (>70%)
- Fatigue increases with prolonged low activity
- Distraction risk high when focus drops suddenly
`.trim();

  return await analyzeWithGroq(prompt, {
    systemPrompt: 'You are a flow state analyzer. Respond ONLY with valid JSON, no markdown formatting.',
    temperature: 0.3, // Lower temperature for more consistent analysis
  });
}

/**
 * Generate insights using Groq
 * 
 * @param {Object} sessionData - Session summary data
 * @returns {Promise<Array<string>>} Array of insight strings
 */
async function generateInsightsWithGroq(sessionData) {
  const flowMinutes = Math.floor(sessionData.flowDuration / 60);
  const sessionMinutes = Math.floor(sessionData.sessionDuration / 60);
  const flowPercent = sessionData.sessionDuration > 0 
    ? Math.round((sessionData.flowDuration / sessionData.sessionDuration) * 100)
    : 0;

  const prompt = `
You are an AI productivity coach. Analyze this focus session and provide 4-6 brief, actionable insights:

Session Summary:
- Total Duration: ${sessionMinutes} minutes
- Flow Time: ${flowMinutes} minutes (${flowPercent}%)
- Flow Score: ${sessionData.flowScore || 0}/100
- Stamina Score: ${sessionData.staminaScore || 50}/100
- Distractions Blocked: ${sessionData.blockedCount || 0}

Respond with ONLY a JSON array of insight strings (no markdown):
["insight 1", "insight 2", "insight 3", "insight 4"]

Each insight should be:
- One sentence (15-30 words)
- Actionable and encouraging
- Specific to the metrics provided
- Focused on improvement or recognition

Examples:
- "Excellent ${flowMinutes}-minute flow session! Your consistency shows strong focus capacity."
- "Consider taking a short break - your stamina score suggests mental fatigue is building."
- "Your distraction blocking worked well. Try scheduling similar sessions at this time."
`.trim();

  const result = await analyzeWithGroq(prompt, {
    systemPrompt: 'You are a productivity coach. Respond ONLY with a JSON array of strings, no markdown formatting.',
    temperature: 0.8, // Higher temperature for creative insights
    maxTokens: 600,
  });

  // Handle both array and object responses
  if (Array.isArray(result)) {
    return result;
  } else if (result.text) {
    // Try to extract JSON array from text
    const match = result.text.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    // Fallback: split by lines
    return result.text.split('\n').filter(line => line.trim().length > 0).slice(0, 6);
  }

  throw new Error('Unexpected response format from Groq API');
}

/**
 * Check if Groq API is configured and working
 * 
 * @returns {Promise<boolean>} True if API is working
 */
async function checkGroqHealth() {
  try {
    if (!GROQ_API_KEY) {
      return false;
    }

    const result = await analyzeWithGroq('Respond with: OK', {
      maxTokens: 10,
    });

    return !!result;
  } catch (error) {
    console.error('Groq health check failed:', error.message);
    return false;
  }
}

module.exports = {
  analyzeWithGroq,
  analyzeFlowWithGroq,
  generateInsightsWithGroq,
  checkGroqHealth,
};