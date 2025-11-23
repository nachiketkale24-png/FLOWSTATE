/**
 * Example: How to activate Groq LLM for flowAgent
 * 
 * This file shows the exact steps to uncomment and activate model-based agents.
 * Copy this pattern for other agents (distractionAgent, staminaAgent, insightsAgent).
 */

// STEP 1: Already done ✅
// src/config/aiConfig.js has the infrastructure

// STEP 2: Add API key to .env
// Create a .env file in project root:
// VITE_GROQ_API_KEY=gsk_your_actual_key_here

// STEP 3: Enable in config
// Edit src/config/aiConfig.js:
// useModelFlowAgent: true,

// STEP 4: Uncomment API call in flowAgent.js
// Find analyzeFlowWithModel() and uncomment the fetch() block

// Example of what to uncomment:
const EXAMPLE_ACTIVATION = `
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${import.meta.env.VITE_GROQ_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'llama-3.1-70b-versatile',
    messages: [{ role: 'user', content: _prompt }],
    max_tokens: 300,
    temperature: 0.7,
  }),
});

if (!response.ok) {
  throw new Error(\`Groq API error: \${response.statusText}\`);
}

const data = await response.json();
const result = JSON.parse(data.choices[0].message.content);

console.log('[flowAgent] Model response:', result);
return result;
`;

// STEP 5: Restart dev server
// npm run dev

// STEP 6: Test in browser
// 1. Open http://localhost:5175/
// 2. Start a session
// 3. Type something
// 4. Check browser console for "[flowAgent] Model response:"
// 5. Verify flowScore updates based on LLM output

// TESTING TIPS:
// - Console logs will show when model is called vs rule-based
// - If API fails, it automatically falls back to rule-based
// - Monitor network tab to see Groq API calls
// - Check latency (should be <1s with Groq)

// ROLLBACK:
// - Set useModelFlowAgent: false in aiConfig.js
// - Or delete VITE_GROQ_API_KEY from .env
// - App will seamlessly switch back to rule-based

export const ACTIVATION_CHECKLIST = [
  '✅ Created .env with VITE_GROQ_API_KEY',
  '✅ Set useModelFlowAgent: true in aiConfig.js',
  '✅ Uncommented fetch() block in analyzeFlowWithModel()',
  '✅ Restarted dev server',
  '✅ Tested in browser console',
  '✅ Verified model responses',
  '✅ Checked fallback on errors',
];

// Prevent unused variable warning
console.log('Activation guide loaded. Example code length:', EXAMPLE_ACTIVATION.length);
