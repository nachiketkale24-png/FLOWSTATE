# AI Configuration Guide

## Overview

FlowState supports **two modes** for each AI agent:

1. **Rule-based (default)**: Fast, offline, deterministic logic
2. **Model-based (optional)**: Groq/GPT-powered analysis

## Quick Start

### Using Rule-Based Agents (Default)

No configuration needed! Just use the app normally. All agents use local logic.

### Enabling LLM-Based Agents

1. **Get API Keys**:
   - Groq: https://console.groq.com/keys
   - OpenAI: https://platform.openai.com/api-keys

2. **Create `.env` file** in project root:
   ```env
   VITE_GROQ_API_KEY=gsk_your_key_here
   # or
   VITE_OPENAI_API_KEY=sk-your_key_here
   ```

3. **Edit `src/config/aiConfig.js`**:
   ```javascript
   export const aiConfig = {
     // Enable model-based agents
     useModelFlowAgent: true,      // Flow state detection
     useModelInsightsAgent: true,   // Session summaries
     
     // Choose provider
     modelProvider: 'groq',  // or 'openai'
     modelName: 'llama-3.1-70b-versatile',  // or 'gpt-4o-mini'
   };
   ```

4. **Restart dev server**: `npm run dev`

## Agent Comparison

| Agent | Rule-Based | Model-Based |
|-------|-----------|-------------|
| **flowAgent** | WPM + focus ratio thresholds | Contextual flow detection with session history |
| **distractionAgent** | Probability-based blocking (3-10%) | Learns user's distraction patterns |
| **staminaAgent** | Simple flow ratio calculation | Long-term trend analysis |
| **insightsAgent** | Template-based text | Natural language generation |

## Configuration Options

### `useModelFlowAgent`
- **Default**: `false`
- **When to enable**: Want more nuanced flow state detection
- **Cost**: ~0.1-0.3¢ per hour (Groq with Llama 3.1)

### `useModelInsightsAgent`
- **Default**: `false`
- **When to enable**: Want personalized, conversational feedback
- **Cost**: ~0.5-1¢ per session summary

### `useModelDistractionAgent` / `useModelStaminaAgent`
- **Default**: `false`
- **Status**: Scaffolded but not critical for MVP
- **When to enable**: Future enhancements

### Model Selection

**Groq (Recommended)**:
```javascript
modelProvider: 'groq',
modelName: 'llama-3.1-70b-versatile',
```
- ⚡ Very fast (~500-1000 tokens/sec)
- 💰 Extremely cheap (free tier: 30 requests/min)
- ✅ Best for real-time analysis

**OpenAI**:
```javascript
modelProvider: 'openai',
modelName: 'gpt-4o-mini',
```
- 🧠 Slightly better reasoning
- 💰 More expensive (~$0.15 per 1M input tokens)
- ⏱️ Slower response times

## Architecture

Each agent file follows this pattern:

```javascript
// 1. Rule-based implementation (always available)
function analyzeFlowRuleBased(metrics) {
  // Fast local logic
  return results;
}

// 2. Model-based implementation (optional)
async function analyzeFlowWithModel(metrics) {
  try {
    // Build prompt
    // Call Groq/GPT API
    // Return parsed results
  } catch (error) {
    // Fallback to rule-based
    return analyzeFlowRuleBased(metrics);
  }
}

// 3. Public API (auto-selects based on config)
export async function analyzeFlow(metrics) {
  if (aiConfig.useModelFlowAgent && aiConfig.groqApiKey) {
    return await analyzeFlowWithModel(metrics);
  }
  return analyzeFlowRuleBased(metrics);
}
```

## Performance Tuning

```javascript
// In aiConfig.js
maxTokens: 500,      // Lower = faster + cheaper
temperature: 0.7,    // 0.0-1.0 (0=deterministic, 1=creative)
timeout: 5000,       // ms - fallback if model takes too long
```

## Cost Estimates (Groq Llama 3.1 70B)

| Usage Pattern | Requests/Day | Monthly Cost |
|--------------|--------------|--------------|
| Light (1-2 sessions/day) | 50-100 | **FREE** |
| Medium (3-5 sessions/day) | 150-300 | **FREE** |
| Heavy (10+ sessions/day) | 500+ | ~$0.50-1.00 |

## Troubleshooting

### "Model-based analysis not yet implemented"
✅ Expected! This is the fallback message. The scaffolding is ready, just uncomment the API call code when ready.

### No API calls being made
1. Check `.env` file exists and has `VITE_GROQ_API_KEY`
2. Verify `useModelFlowAgent: true` in `aiConfig.js`
3. Restart dev server after `.env` changes

### API errors / timeouts
- Agents automatically fallback to rule-based logic
- Check browser console for error details
- Verify API key is valid and has credits

## Next Steps

**To activate LLM features**:

1. In each agent file, find the TODO comments
2. Uncomment the `fetch()` API call code
3. Test with a real API key
4. Adjust prompts for better results

The infrastructure is ready—just plug in your API keys and uncomment the fetch calls! 🚀
