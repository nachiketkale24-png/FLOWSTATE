# FlowState AI - Demo Guide

## 🚀 Quick Start

```powershell
cd flowstate
npm run dev
```

Open browser: **http://localhost:5175/**

---

## 🎯 What You'll See

### **Live Dashboard (9 Metrics)**

1. **Flow Score** (0–100) - AI-analyzed focus level
2. **Session Duration** - Total time tracking
3. **Flow Duration** - Time in FLOW state
4. **Typing Cadence** (50–110 wpm) - Activity signal
5. **Active Ratio** (50–100%) - Engagement level
6. **Distractions Blocked** - AI-prevented interruptions
7. **Fatigue Level** (0–100) - Energy depletion risk
8. **Distraction Risk** (0–100) - Break probability
9. **Focus Stamina** (0–100) - Long-term capacity

### **AI State Transitions**

- **IDLE** → Click "Start Session" → **MONITORING**
- **MONITORING** → When `flowScore >= 70` && `activeRatio >= 0.75` → **FLOW**
- **FLOW** → When `flowScore < 50` or fatigue > 80 → **MONITORING**

### **Distraction Blocking**

- During **FLOW** state only
- 3–10% chance per second (based on distraction risk)
- Shows overlay: "DISTRACTION BLOCKED: youtube.com"
- 3 actions: Return / Override / End Session

### **Session End**

- Click "End Session" from FloatingActions
- Shows SessionSummary modal with:
  - 6-stat grid
  - AI-generated insights (from insightsAgent)
  - "Start New Session" button

---

## 🤖 AI Agents (Local JS)

### **flowAgent.js**
- Analyzes: typing cadence + active ratio
- Outputs: flowScore, fatigueScore, distractionRisk
- Decides: when to enter/exit FLOW

### **distractionAgent.js**
- Monitors: distraction risk + flow state
- Blocks: youtube, instagram, twitter, reddit, netflix
- Probability: 3–10% per second (scales with risk)

### **staminaAgent.js**
- Tracks: session/flow duration ratio
- Builds: long-term focus capacity (stamina)
- Updates: trend (up/down/stable)

### **insightsAgent.js**
- Generates: 2–3 text insights
- Examples:
  - "You spent 12 min in flow (67% of session)"
  - "Strong deep-work block. Repeat this time window."
  - "Focus stamina in strong zone. Handle longer blocks."

---

## 🎨 UI Highlights

### **Glass Morphism + Cyberpunk**
- Dark gradient background (gray-900 → purple-900 → pink-900)
- Cyber grid overlay
- Animated blobs (pulsing purple/pink)

### **3D Floating Cards**
- All metric cards float + glow on hover
- Pulse rings + holographic borders
- Staggered entrance animations

### **Neon Effects**
- Pink/purple text glows
- Progress bars with liquid gradients
- Status badges with neon borders

---

## 📊 Demo Flow (2-Minute Session)

**Minute 1:**
- Session auto-starts
- Metrics update every second
- Flow score climbs (0 → 50 → 70)
- Active ratio fluctuates (0.6 → 0.9)
- **State changes:** MONITORING → FLOW (when score hits 70)

**Minute 2:**
- Flow banner appears (holographic wave effect)
- Distraction blocks may trigger (3–10% chance/sec)
- Fatigue starts rising (if active ratio drops)
- Stamina slowly builds (based on flow duration)
- **Click "End Session"** → SessionSummary modal

---

## 🎤 Judge Demo Script (30 seconds)

> **"FlowState is an AI-powered focus tracker. Four local agents analyze your work patterns in real-time—no server needed for the demo. The flow agent monitors your typing cadence and activity to calculate a focus score. When you hit 70%, it triggers the FLOW state. The distraction agent blocks sites like YouTube based on risk. The stamina agent builds long-term focus capacity. And the insights agent generates personalized suggestions at the end. Later, we can swap these rule-based agents for Groq or GPT calls—same architecture. Let me show you..."**

[Open browser, show dashboard updating, trigger a distraction block, end session to show AI insights]

---

## 🔧 Technical Architecture

**Stack:** React 19 + Tailwind v4 + Vite  
**State:** Context API (FlowContext)  
**Engine:** 1-second loop (analyzes → transitions → updates UI)  
**Agents:** Pure JS modules in `src/ai/`

**Plug-in Ready for Cloud AI:**
```javascript
// Future upgrade (no UI changes needed)
const flowAnalysis = await analyzeFlowWithGroq(metrics);
```

---

## 📁 Key Files

```
src/
├── ai/
│   ├── flowAgent.js          # 50 lines
│   ├── distractionAgent.js   # 20 lines
│   ├── staminaAgent.js       # 30 lines
│   └── insightsAgent.js      # 40 lines
├── context/
│   └── FlowContext.jsx       # 160 lines (engine + state)
├── components/
│   ├── DashboardGrid.jsx     # 9-card metrics
│   ├── SessionSummary.jsx    # AI insights modal
│   └── ...
└── App.jsx
```

Total AI agent code: **~140 lines**  
Total project: **~2000 lines** (including UI)

---

## ✅ Demo Checklist

- [x] Dev server running (port 5175)
- [x] Dashboard shows 9 live metrics
- [x] AI agents integrated (flow, distraction, stamina, insights)
- [x] State transitions work (MONITORING → FLOW)
- [x] Distraction blocking triggers randomly
- [x] Session summary shows AI insights
- [x] All visual effects working (glass, neon, 3D, animations)
- [x] Architecture documented (AI_ARCHITECTURE.md)

**READY TO DEMO! 🎉**

---

## 🚀 Future Enhancements

1. **Groq Integration:** Swap rule-based agents with LLM calls
2. **Real Sensors:** Chrome extension for actual typing/activity data
3. **Firebase Backend:** Store sessions + historical stamina
4. **Mobile App:** React Native version
5. **Team Dashboard:** Multi-user flow tracking
6. **AI Coach:** Voice assistant during flow sessions

---

## 📞 Support

**Architecture:** See `AI_ARCHITECTURE.md`  
**Dev Server:** `npm run dev` (port 5175)  
**Issues:** Check browser console + Vite terminal

**Demo-Ready Status:** ✅ ALL SYSTEMS GO
