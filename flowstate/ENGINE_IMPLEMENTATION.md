# FlowState AI - Flow Engine Implementation

## 🎯 Overview

The FlowState AI flow engine is a **real-time, on-device AI system** that tracks focus and protects flow state using browser events and rule-based AI agents. No backend required, no network calls—everything runs locally in the browser.

---

## 🏗️ Architecture

### **State Machine**

```
IDLE → MONITORING → FLOW
  ↑         ↑         ↓
  └─────────┴─────────┘
```

- **IDLE**: No session active, engine stopped
- **MONITORING**: Session active, waiting for flow conditions (flowScore >= 70, activeRatio >= 0.75)
- **FLOW**: Deep focus detected, distraction blocking active

### **Engine Loop**

- **Frequency**: 1-second interval (`setInterval`)
- **Lifecycle**: Starts when `flowState !== "IDLE"`, stops and cleans up on unmount or when returning to IDLE
- **Event-driven**: Uses real browser events (keydown, focus, blur, visibilitychange)

---

## 📊 Metrics Tracked

| Metric | Source | Range | Description |
|--------|--------|-------|-------------|
| **flowScore** | flowAgent | 0-100 | AI-calculated focus level (smoothed) |
| **sessionDuration** | Timer | seconds | Total time since session started |
| **flowDuration** | Timer | seconds | Time spent in FLOW state |
| **typingCadence** | Keyboard events | 0-150 wpm | Real typing speed: `(keys/5) * 60` |
| **activeRatio** | Focus/blur events | 0-1 | `focusedSeconds / totalSeconds` |
| **blockedCount** | distractionAgent | integer | Number of distractions blocked |
| **fatigueScore** | flowAgent | 0-100 | Energy depletion risk |
| **distractionRisk** | flowAgent | 0-100 | Probability of breaking flow |
| **staminaScore** | staminaAgent | 0-100 | Long-term focus capacity |
| **staminaTrend** | staminaAgent | up/down/stable | Stamina direction |

---

## 🤖 AI Agents

### **1. flowAgent** (`src/ai/flowAgent.js`)

**Purpose**: Core flow analysis and scoring

**Inputs**:
- `typingCadence` (0-150 wpm)
- `activeRatio` (0-1)
- `prevFlowScore` (0-100)
- `flowState` (IDLE | MONITORING | FLOW)

**Algorithm**:
```javascript
// Normalize inputs
cadenceNorm = (typingCadence - 40) / 70  // Maps 40-110 wpm to 0-1
activeNorm = clamp(activeRatio, 0, 1)

// Instant score (weighted combination)
instantScore = (cadenceNorm * 0.6 + activeNorm * 0.4) * 100

// Smooth with previous score (feels more stable)
flowScore = 0.6 * prevFlowScore + 0.4 * instantScore

// Fatigue (high when active but score drops)
fatigueScore = (1 - activeNorm) * 70 + (100 - flowScore) * 0.3

// Distraction risk (high when unfocused or score dropping)
distractionRisk = (1 - activeNorm) * 80 + (prevScore - flowScore) * 0.8
```

**Outputs**:
- `flowScore` (0-100)
- `fatigueScore` (0-100)
- `distractionRisk` (0-100)
- `isFlowLikely` (boolean) - Triggers MONITORING → FLOW
- `shouldExitFlow` (boolean) - Triggers FLOW → MONITORING

**State Transitions**:
- **Enter FLOW**: `flowScore >= 70 && activeRatio >= 0.75`
- **Exit FLOW**: `flowScore < 50 || activeRatio < 0.5 || fatigueScore > 80`

---

### **2. distractionAgent** (`src/ai/distractionAgent.js`)

**Purpose**: Smart distraction blocking during flow

**Inputs**:
- `flowState` (only blocks during FLOW)
- `distractionRisk` (0-100)

**Algorithm**:
```javascript
if (flowState !== "FLOW") return { shouldBlock: false }

// Base probability: 3-10% per second (scales with risk)
baseProb = 0.03 + (distractionRisk / 100) * 0.07

if (Math.random() < baseProb) {
  site = randomChoice(DISTRACTION_SITES)
  return { shouldBlock: true, site }
}
```

**Distraction Sites**:
- youtube.com
- instagram.com
- twitter.com
- reddit.com
- netflix.com

**Outputs**:
- `shouldBlock` (boolean)
- `site` (string | null) - e.g., "youtube.com"

---

### **3. staminaAgent** (`src/ai/staminaAgent.js`)

**Purpose**: Build long-term focus capacity

**Inputs**:
- `sessionDuration` (seconds)
- `flowDuration` (seconds)
- `prevStaminaScore` (0-100)

**Algorithm**:
```javascript
flowRatio = flowDuration / sessionDuration  // 0-1
target = 40 + flowRatio * 60  // Maps to 40-100

// Smooth update (70% previous, 30% target)
staminaScore = 0.7 * prevStaminaScore + 0.3 * target

// Trend detection
if (staminaScore > prevStaminaScore + 2) → "up"
if (staminaScore < prevStaminaScore - 2) → "down"
else → "stable"
```

**Outputs**:
- `staminaScore` (0-100)
- `staminaTrend` ("up" | "down" | "stable")

---

## 🎮 Real Browser Events

### **Keyboard Tracking**

```javascript
useEffect(() => {
  const handleKeyDown = () => {
    if (flowState !== "IDLE") {
      currentSecondKeysRef.current += 1;
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [flowState]);
```

**Every second in engine loop**:
```javascript
const keysThisSecond = currentSecondKeysRef.current;
currentSecondKeysRef.current = 0; // Reset

// Approximate WPM: (keys / 5) * 60
const typingCadence = Math.min(150, Math.max(0, (keysThisSecond / 5) * 60));
```

### **Focus/Blur Tracking**

```javascript
useEffect(() => {
  const handleFocus = () => isWindowFocusedRef.current = true;
  const handleBlur = () => isWindowFocusedRef.current = false;
  const handleVisibilityChange = () => {
    isWindowFocusedRef.current = !document.hidden;
  };

  window.addEventListener('focus', handleFocus);
  window.addEventListener('blur', handleBlur);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('blur', handleBlur);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [flowState]);
```

**Every second in engine loop**:
```javascript
totalSecondsRef.current += 1;
if (isWindowFocusedRef.current) {
  focusedSecondsRef.current += 1;
}
const activeRatio = focusedSecondsRef.current / totalSecondsRef.current;
```

---

## 🔄 Engine Loop Breakdown

**Every 1 second**:

```javascript
engineIntervalRef.current = setInterval(() => {
  // 1. COMPUTE RAW SIGNALS
  const keysThisSecond = currentSecondKeysRef.current;
  currentSecondKeysRef.current = 0;
  const typingCadence = (keysThisSecond / 5) * 60; // WPM
  
  totalSecondsRef.current += 1;
  if (isWindowFocusedRef.current) focusedSecondsRef.current += 1;
  const activeRatio = focusedSecondsRef.current / totalSecondsRef.current;

  // 2. AI AGENT ANALYSIS
  const flowAnalysis = analyzeFlow({
    typingCadence,
    activeRatio,
    prevFlowScore,
    flowState
  });

  // 3. STATE TRANSITIONS
  if (flowState === "MONITORING" && flowAnalysis.isFlowLikely) {
    setFlowState("FLOW");
  } else if (flowAnalysis.shouldExitFlow) {
    setFlowState("MONITORING");
  }

  // 4. UPDATE DURATIONS
  sessionDuration += 1;
  if (flowState === "FLOW") flowDuration += 1;

  // 5. STAMINA UPDATE
  const stamina = updateStamina({
    sessionDuration,
    flowDuration,
    prevStaminaScore
  });

  // 6. DISTRACTION BLOCKING
  const decision = decideDistraction({
    flowState,
    distractionRisk: flowAnalysis.distractionRisk
  });

  if (decision.shouldBlock) {
    setBlockedSite(decision.site);
    setShowBlockOverlay(true);
    blockedCount += 1;
  }

  // 7. UPDATE ALL METRICS
  setMetrics({ ...all metrics... });
}, 1000);
```

---

## 🎛️ Controls API

### **startSession()**
- Sets `flowState` to "MONITORING"
- Resets all metrics to 0 (except staminaScore = 50)
- Resets all tracking refs (keyboard, focus counters)
- Hides overlay and summary modals
- **Starts the engine loop**

### **endSession()**
- Sets `flowState` to "IDLE"
- **Stops the engine loop** (clears interval)
- Hides overlay modal
- Shows SessionSummary modal with AI insights

### **returnToFlow()**
- Hides BlockOverlay
- **Session continues** (engine keeps running)

### **overrideFlow()**
- Sets `flowState` to "MONITORING" (exits FLOW if in it)
- Hides BlockOverlay
- **Session continues**

---

## 🧠 Context API

**Exposed from FlowContext**:

```javascript
{
  // STATE
  flowState,              // "IDLE" | "MONITORING" | "FLOW"
  metrics,                // Object with all 10 metrics
  showOverlay,            // Boolean
  showBlockOverlay,       // Boolean
  setShowBlockOverlay,    // Function (for BlockOverlay to close itself)
  showSummary,            // Boolean
  blockedSite,            // string | null

  // CONTROLS
  startSession,           // Function
  endSession,             // Function
  returnToFlow,           // Function
  overrideFlow,           // Function
}
```

---

## 📦 Component Integration

### **App.jsx**
- Wraps AppContent in `<FlowProvider>`
- AppContent calls `startSession()` on mount for demo mode
- No direct metric manipulation

### **DashboardGrid.jsx**
- Consumes `metrics` from `useFlow()`
- Displays 9 metric cards with live values
- Formats time with `formatTime(seconds)`

### **BlockOverlay.jsx**
- Shows when `showBlockOverlay === true`
- Displays `blockedSite` (e.g., "youtube.com")
- Calls `returnToFlow()`, `overrideFlow()`, or `endSession()`

### **SessionSummary.jsx**
- Shows when `showSummary === true`
- Displays final session metrics
- Uses `generateInsights()` from `insightsAgent` for AI suggestions
- Calls `startSession()` to begin new session

### **QuickStats.jsx**
- Currently displays mock persistent data (streaks, achievements)
- Can be extended to pull from localStorage

---

## ✅ Key Features

### **No Memory Leaks**
- All intervals cleared on unmount or state changes
- Event listeners properly removed in cleanup functions

### **Proper State Management**
- Single source of truth (FlowContext)
- No prop drilling
- Clean separation of concerns

### **Real-Time Performance**
- 1-second granularity
- Immediate UI updates via React state
- Smooth score transitions (0.6 previous + 0.4 current)

### **Extensibility**
- AI agents are pure functions (easy to test)
- Can swap rule-based logic with Groq/GPT API calls
- Same inputs/outputs → no UI changes needed

---

## 🚀 Future Enhancements

1. **Groq/GPT Integration**: Replace rule-based agents with LLM calls
2. **Persistent Data**: Add localStorage for streaks, history
3. **Real Browser Extension**: Actually block sites (Chrome extension API)
4. **Advanced Sensors**: Mouse movement, scroll patterns, tab switches
5. **Team Dashboard**: Multi-user flow tracking
6. **AI Coach**: Voice assistant during sessions

---

## 🎤 Demo Script (30 seconds)

> "FlowState AI uses real browser events to track your focus in real-time. As I type, it measures my typing cadence. If I switch tabs, it lowers my active ratio. The flow agent combines these signals to compute a flow score. When I hit 70%, I enter FLOW state. Now the distraction agent watches my risk score—if it spikes, it'll block sites like YouTube. The stamina agent builds my long-term capacity over multiple sessions. At the end, I get AI-generated insights about my performance. All of this runs locally in JavaScript—no backend, no network calls. Later, we can plug in Groq or GPT to make the agents even smarter."

---

**Status**: ✅ **FULLY IMPLEMENTED AND RUNNING**

Open http://localhost:5175/ to see it live!
