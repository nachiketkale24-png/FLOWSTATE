# FlowState AI Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FlowContext                              │
│  (React Context - manages state, event listeners, engine loop)   │
└────────┬───────────────────────────────────────────────┬────────┘
         │                                                │
         │ Calls agents every 1 second                    │
         │                                                │
         ▼                                                ▼
┌────────────────────────────────────────────────────────────────┐
│                      AI Agent Layer                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  flowAgent   │  │ distraction  │  │  stamina     │         │
│  │              │  │   Agent      │  │   Agent      │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         ▼                  ▼                  ▼                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │           aiConfig.js (Configuration)                │       │
│  │  - useModelFlowAgent: false (default)                │       │
│  │  - useModelInsightsAgent: false (default)            │       │
│  │  - groqApiKey / openaiApiKey                         │       │
│  └────────────────┬──────────────────┬──────────────────┘       │
│                   │                   │                          │
│      If false ────┘                   └──── If true             │
│           │                                      │               │
│           ▼                                      ▼               │
│  ┌────────────────────┐              ┌────────────────────┐    │
│  │  Rule-Based Logic  │              │  Model-Based Logic │    │
│  │  (Fast, Offline)   │              │  (Groq/GPT API)    │    │
│  │                    │              │                     │    │
│  │  • WPM thresholds  │              │  • LLM prompt      │    │
│  │  • Focus ratios    │              │  • API call        │    │
│  │  • Simple formulas │              │  • JSON parsing    │    │
│  │  • Instant results │              │  • Auto-fallback   │    │
│  └────────────────────┘              └────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Current (Rule-Based Mode)

```
User Types → Keyboard Event → FlowContext
                                   │
                                   ▼
                            Metrics Calculated
                            (WPM, activeRatio)
                                   │
                                   ▼
                            Call analyzeFlow()
                                   │
                                   ▼
                        aiConfig.useModelFlowAgent?
                                   │
                              false │ (default)
                                   ▼
                        analyzeFlowRuleBased()
                         (instant calculation)
                                   │
                                   ▼
                         Return {flowScore, ...}
                                   │
                                   ▼
                        FlowContext updates state
                                   │
                                   ▼
                          UI re-renders instantly
```

### Future (Model-Based Mode)

```
User Types → Keyboard Event → FlowContext
                                   │
                                   ▼
                            Metrics Calculated
                                   │
                                   ▼
                            Call analyzeFlow()
                                   │
                                   ▼
                        aiConfig.useModelFlowAgent?
                                   │
                               true │ (enabled)
                                   ▼
                        analyzeFlowWithModel()
                                   │
                                   ▼
                         Build prompt with metrics
                                   │
                                   ▼
                    POST to api.groq.com/openai/v1/...
                                   │
                            ┌──────┴──────┐
                            │              │
                       Success?           Error?
                            │              │
                            ▼              ▼
                   Parse JSON result    Fallback to
                   from LLM             analyzeFlowRuleBased()
                            │              │
                            └──────┬───────┘
                                   ▼
                         Return {flowScore, ...}
                                   │
                                   ▼
                        FlowContext updates state
                                   │
                                   ▼
                            UI re-renders
```

## Agent Responsibilities

### flowAgent
**Input**: `{ typingCadence, activeRatio, prevFlowScore, flowState }`
**Output**: `{ flowScore, fatigueScore, distractionRisk, isFlowLikely, shouldExitFlow }`
**Called**: Every 1 second by FlowContext engine loop
**Rule-based**: WPM normalization + focus ratio math
**Model-based**: LLM analyzes typing patterns and context

### distractionAgent
**Input**: `{ flowState, distractionRisk }`
**Output**: `{ shouldBlock: boolean, site: string | null }`
**Called**: Every 1 second when in FLOW state
**Rule-based**: Probability-based (3-10% per second)
**Model-based**: Contextual distraction prediction

### staminaAgent
**Input**: `{ sessionDuration, flowDuration, prevStaminaScore }`
**Output**: `{ staminaScore, staminaTrend }`
**Called**: Every 1 second during active session
**Rule-based**: Flow ratio → stamina calculation
**Model-based**: Long-term trend analysis

### insightsAgent
**Input**: `{ sessionDuration, flowDuration, staminaScore }`
**Output**: `string[]` (array of insight strings)
**Called**: Once when session ends (SessionSummary modal)
**Rule-based**: Template-based text generation
**Model-based**: Natural language generation

## Configuration Flags

| Flag | Default | When to Enable | Cost Impact |
|------|---------|----------------|-------------|
| `useModelFlowAgent` | `false` | Want nuanced flow detection | ~0.1¢/hr |
| `useModelInsightsAgent` | `false` | Want conversational feedback | ~0.2¢/session |
| `useModelDistractionAgent` | `false` | Future enhancement | ~0.05¢/hr |
| `useModelStaminaAgent` | `false` | Future enhancement | ~0.05¢/hr |

## File Structure

```
flowstate/
├── src/
│   ├── ai/
│   │   ├── flowAgent.js           (✅ Refactored)
│   │   ├── distractionAgent.js    (✅ Refactored)
│   │   ├── staminaAgent.js        (✅ Refactored)
│   │   └── insightsAgent.js       (✅ Refactored)
│   ├── config/
│   │   ├── aiConfig.js            (✅ Created)
│   │   ├── README.md              (✅ Documentation)
│   │   └── ACTIVATION_GUIDE.js    (✅ Step-by-step)
│   └── context/
│       └── FlowContext.jsx        (No changes needed!)
├── .env.example                   (✅ Template)
└── AI_REFACTOR_SUMMARY.md         (✅ Complete guide)
```

## Benefits of This Architecture

✅ **Zero Breaking Changes**: Public APIs unchanged
✅ **Graceful Degradation**: Auto-fallback on errors
✅ **Cost Control**: Enable models per agent
✅ **Development Friendly**: Rule-based for fast iteration
✅ **Production Ready**: LLM infrastructure scaffolded
✅ **User Choice**: Can toggle models without code changes

## Next Steps

1. **Test Current Setup**: Rule-based mode working perfectly
2. **Get API Key**: https://console.groq.com/keys
3. **Enable Gradually**: Start with insightsAgent (1 call/session)
4. **Monitor Costs**: Groq free tier is generous
5. **Tune Prompts**: Adjust for better results
6. **Scale Up**: Enable flowAgent for real-time LLM analysis
