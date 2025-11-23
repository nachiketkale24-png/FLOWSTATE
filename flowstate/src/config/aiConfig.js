/**
 * AI Configuration
 * 
 * Controls whether agents use local rule-based logic or external LLMs.
 * 
 * Rule-based (default):
 * - Fast, offline, deterministic
 * - No API costs
 * - Good for real-time decision making
 * 
 * Model-based (optional):
 * - Slower, requires API calls
 * - More nuanced understanding
 * - Better for complex insights and natural language generation
 */

export const aiConfig = {
  // Flow analysis: should we use LLM for flow state detection?
  useModelFlowAgent: false,
  
  // Distraction blocking: should we use LLM for distraction decisions?
  useModelDistractionAgent: false,
  
  // Stamina tracking: should we use LLM for stamina analysis?
  useModelStaminaAgent: false,
  
  // Insights generation: should we use LLM for session summaries?
  useModelInsightsAgent: false,
  
  // API configuration (populate when enabling model-based agents)
  groqApiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  
  // Model selection
  modelProvider: 'groq', // 'groq' | 'openai'
  modelName: 'llama-3.1-70b-versatile', // or 'gpt-4o-mini'
  
  // Performance tuning
  maxTokens: 500,
  temperature: 0.7,
  timeout: 5000, // ms - fallback to rule-based if model takes too long
};

export default aiConfig;
