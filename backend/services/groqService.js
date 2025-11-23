/**
 * Groq AI Service
 * 
 * Handles integration with Groq's LLM API for AI chat responses
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-70b-versatile';

/**
 * Generate AI response using Groq API
 * 
 * @param {string} userMessage - User's input message
 * @param {string} context - Additional context about user's session
 * @returns {Promise<string>} AI response
 */
export async function generateGroqResponse(userMessage, context = '') {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('Groq API key not configured');
  }

  try {
    const systemPrompt = `You are FlowState AI, a helpful and supportive productivity assistant. You help users understand their focus patterns, improve their productivity, and achieve deep work states.

Be concise but helpful. Use emojis sparingly but effectively. Give actionable advice based on the user's data when available.

${context}`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
      throw new Error('No response from Groq API');
    }

    return aiMessage.trim();
  } catch (error) {
    console.error('❌ Groq API Error:', error.message);
    throw error;
  }
}

/**
 * Check if Groq API is configured
 * 
 * @returns {boolean} True if API key is configured
 */
export function isGroqConfigured() {
  const apiKey = process.env.GROQ_API_KEY;
  return apiKey && apiKey !== 'your_groq_api_key_here';
}
