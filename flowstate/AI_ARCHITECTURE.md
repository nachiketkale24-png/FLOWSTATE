# FlowState AI Architecture

## 🎯 **Tech Stack (PPT / Demo Pitch)**

**Frontend:** React + Tailwind v4 (Live Flow Dashboard)  
**Flow Engine:** On-device AI agents (JavaScript modules)  
**Data:** In-memory state (later Firebase)  
**Cloud AI:** Groq / GPT plug-ins (same agent functions, future upgrade)

---

## 📐 **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    React UI Components                       │
│  (NavbarStatusBar, DashboardGrid, FlowBanner, etc.)         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   FlowContext.jsx    │ ◄── Global State Management
          │  (Context API)       │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   AI Agent Pipeline  │
          └──────────┬───────────┘
                     │
         ┌───────────┼───────────┬───────────┐
         ▼           ▼           ▼           ▼
    flowAgent   distractionAgent  staminaAgent  insightsAgent
    (analysis)  (blocking)        (training)    (summaries)
```

---

## 🤖 **AI Agents (src/ai/)**

### 1. **flowAgent.js** - Core Flow Analysis
**Inputs:**
- `typingCadence` (50–110 wpm)
- `activeRatio` (0.5–1.0)
- `prevFlowScore` (previous score for smoothing)
- `flowState` (IDLE | MONITORING | FLOW)

**Outputs:**
- `flowScore` (0–100) - AI-analyzed focus level
- `fatigueScore` (0–100) - Energy depletion risk
- `distractionRisk` (0–100) - Break probability
- `isFlowLikely` (boolean) - Should enter FLOW state?
- `shouldExitFlow` (boolean) - Should exit FLOW state?

**Current Implementation:** Rule-based heuristics  
**Future Upgrade:** Groq / GPT API call with same I/O

```javascript
// Future Groq integration (plug-in ready)
const resp = await groq.chat.completions.create({
  messages: [{ role: "user", content: JSON.stringify(metrics) }],
  model: "mixtral-8x7b-32768"
});
return JSON.parse(resp.choices[0].message.content);
```

---

### 2. **distractionAgent.js** - Smart Blocking
**Inputs:**
- `flowState` (only blocks during FLOW)
- `distractionRisk` (from flowAgent)

**Outputs:**
- `shouldBlock` (boolean) - Show overlay?
- `site` (string | null) - e.g., "youtube.com"

**Logic:**
- Base probability: 3–10% per second (scales with risk)
- Sites: youtube, instagram, twitter, reddit, netflix
- Only triggers during FLOW state

---

### 3. **staminaAgent.js** - Focus Training Model
**Inputs:**
- `sessionDuration` (total seconds)
- `flowDuration` (seconds in FLOW)
- `prevStaminaScore` (0–100)

**Outputs:**
- `staminaScore` (0–100) - Long-term focus capacity
- `staminaTrend` ("up" | "down" | "stable")

**Logic:**
- Slowly adapts based on flow ratio
- Target score: 40 + (flowRatio × 60)
- Smoothing factor: 0.7 × prev + 0.3 × target

---

### 4. **insightsAgent.js** - Session Summaries
**Inputs:**
- `sessionDuration`
- `flowDuration`
- `staminaScore`

**Outputs:**
- Array of text insights (strings)

**Example Insights:**
- "You spent 12 min in flow (67% of this session)."
- "This was a strong deep-work block. Try to repeat this time window."
- "Your focus stamina is in a strong zone. You can handle longer flow blocks."

---

## 🔄 **Core Engine Loop (FlowContext.jsx)**

**Runs every 1 second when `flowState !== "IDLE"`**

```javascript
// 1. Generate raw sensor values (simulated for demo)
const typingCadence = generateTypingCadence(); // 50–110 wpm
const activeRatio = generateActiveRatio(); // 0.5–1.0

// 2. AI agent analysis
const flowAnalysis = analyzeFlow({
  typingCadence,
  activeRatio,
  prevFlowScore,
  flowState,
});

// 3. State transitions
if (flowState === "MONITORING" && flowAnalysis.isFlowLikely) {
  setFlowState("FLOW"); // Enter flow
}
if (flowAnalysis.shouldExitFlow) {
  setFlowState("MONITORING"); // Exit flow
}

// 4. Stamina update
const stamina = updateStamina({
  sessionDuration,
  flowDuration,
  prevStaminaScore,
});

// 5. Distraction blocking
const decision = decideDistraction({
  flowState,
  distractionRisk,
});
if (decision.shouldBlock) {
  setShowOverlay(true);
  setBlockedSite(decision.site);
}
```

---

## 📊 **Metrics Tracked**

| Metric | Source | Display |
|--------|--------|---------|
| **Flow Score** | flowAgent | Dashboard (purple card) |
| **Fatigue Score** | flowAgent | Dashboard (orange card) |
| **Distraction Risk** | flowAgent | Dashboard (red card) |
| **Stamina Score** | staminaAgent | Dashboard (cyan card) |
| **Session Duration** | Timer | Dashboard + Summary |
| **Flow Duration** | Timer (when flowScore > 70) | Dashboard + Summary |
| **Blocked Count** | distractionAgent | Dashboard + Summary |
| **Typing Cadence** | Simulated (50–110 wpm) | Dashboard |
| **Active Ratio** | Simulated (0.5–1.0) | Dashboard |

---

## 🎨 **UI Components Integration**

### **DashboardGrid.jsx**
- 9-card responsive grid (3×3)
- Displays all metrics with color-coded icons
- Includes AI metrics: Fatigue, Distraction Risk, Stamina

### **SessionSummary.jsx**
- Triggered when `endSession()` called
- Shows 6-stat grid + AI insights
- Uses `generateInsights()` from insightsAgent

### **BlockOverlay.jsx**
- Shows when `showOverlay === true`
- Displays blocked site (e.g., "youtube.com")
- 3 action buttons: "Return to Flow", "Override", "End Session"

---

## 🚀 **Future Groq / GPT Integration**

**Architecture is plug-in ready!** No UI changes needed.

### Replace rule-based logic with API calls:

```javascript
// flowAgent.js (future version)
export async function analyzeFlow(metrics) {
  const resp = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a flow state analyzer. Return JSON with flowScore, fatigueScore, distractionRisk, isFlowLikely, shouldExitFlow."
      },
      {
        role: "user",
        content: JSON.stringify(metrics)
      }
    ],
    model: "mixtral-8x7b-32768",
    temperature: 0.5
  });
  
  return JSON.parse(resp.choices[0].message.content);
}
```

**Same inputs/outputs → UI code unchanged!**

---

## 🎤 **Demo Pitch (15 seconds)**

> **"FlowState uses on-device AI agents to analyze your focus in real-time. Four agents—flow analysis, distraction blocking, stamina training, and insights—run locally in JavaScript. Later, we can plug in Groq or GPT for smarter predictions, but the architecture is the same. React + Tailwind + Local AI → no server needed for demo."**

---

## 📦 **File Structure**

```
flowstate/
├── src/
│   ├── ai/
│   │   ├── flowAgent.js          # Core flow analysis
│   │   ├── distractionAgent.js   # Smart blocking
│   │   ├── staminaAgent.js       # Focus training
│   │   └── insightsAgent.js      # Session summaries
│   ├── context/
│   │   └── FlowContext.jsx       # State + engine loop
│   ├── components/
│   │   ├── DashboardGrid.jsx     # 9-card metrics
│   │   ├── SessionSummary.jsx    # AI insights
│   │   └── ...
│   └── App.jsx
└── AI_ARCHITECTURE.md            # This file
```

---

## ✅ **Status**

- [x] AI agents created (flowAgent, distractionAgent, staminaAgent, insightsAgent)
- [x] FlowContext integrated with agents
- [x] Dashboard shows all 9 metrics (including AI scores)
- [x] SessionSummary uses AI insights
- [x] Architecture is Groq/GPT-ready

**Demo Ready! 🎉**
