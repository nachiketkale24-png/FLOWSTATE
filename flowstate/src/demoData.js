/**
 * FLOWSTATE Demo Data
 * Complete mock data for full offline demo mode
 */

// ============================================================================
// GLOBAL CONFIG
// ============================================================================

export const DEMO_MODE = true;

// ============================================================================
// DEMO SESSIONS DATA
// ============================================================================

export const demoSessions = [
  {
    id: "demo-session-1",
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    duration: 2700, // 45 minutes
    flowDuration: 2100, // 35 minutes
    flowScore: 78,
    distractionCount: 3,
    keyPressCount: 2450,
    goals: ["Complete project proposal", "Review code changes"],
    notes: "Good focus session, managed to stay in flow for most of the time"
  },
  {
    id: "demo-session-2",
    startTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 62 * 60 * 1000).toISOString(),
    duration: 3720,
    flowDuration: 2880,
    flowScore: 85,
    distractionCount: 1,
    keyPressCount: 3200,
    goals: ["Debug authentication flow"],
    notes: "Excellent session, minimal distractions"
  },
  {
    id: "demo-session-3",
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 38 * 60 * 1000).toISOString(),
    duration: 2280,
    flowDuration: 1560,
    flowScore: 65,
    distractionCount: 7,
    keyPressCount: 1800,
    goals: ["Write documentation"],
    notes: "Struggled with focus, too many notifications"
  },
  {
    id: "demo-session-4",
    startTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 55 * 60 * 1000).toISOString(),
    duration: 3300,
    flowDuration: 2700,
    flowScore: 82,
    distractionCount: 2,
    keyPressCount: 2900,
    goals: ["Code review", "Plan sprint tasks"],
    notes: "Solid productivity, good balance of tasks"
  },
  {
    id: "demo-session-5",
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 42 * 60 * 1000).toISOString(),
    duration: 2520,
    flowDuration: 2100,
    flowScore: 83,
    distractionCount: 2,
    keyPressCount: 2650,
    goals: ["Refactor components"],
    notes: "Great coding session, deep focus achieved"
  },
  {
    id: "demo-session-6",
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 48 * 60 * 1000).toISOString(),
    duration: 2880,
    flowDuration: 2160,
    flowScore: 75,
    distractionCount: 4,
    keyPressCount: 2400,
    goals: ["Team meeting", "Update project status"],
    notes: "Productive meeting and follow-up work"
  },
  {
    id: "demo-session-7",
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 51 * 60 * 1000).toISOString(),
    duration: 3060,
    flowDuration: 2550,
    flowScore: 83,
    distractionCount: 3,
    keyPressCount: 2800,
    goals: ["Design system updates"],
    notes: "Creative work session, good momentum"
  }
];

// ============================================================================
// DEMO ANALYTICS DATA
// ============================================================================

export const demoAnalytics = {
  weeklyFlowTime: [
    { day: 'Mon', minutes: 145 },
    { day: 'Tue', minutes: 180 },
    { day: 'Wed', minutes: 120 },
    { day: 'Thu', minutes: 200 },
    { day: 'Fri', minutes: 165 },
    { day: 'Sat', minutes: 90 },
    { day: 'Sun', minutes: 75 }
  ],
  bestFocusTime: [
    { hour: '6', score: 45 },
    { hour: '7', score: 65 },
    { hour: '8', score: 78 },
    { hour: '9', score: 92 },
    { hour: '10', score: 88 },
    { hour: '11', score: 85 },
    { hour: '12', score: 72 },
    { hour: '13', score: 68 },
    { hour: '14', score: 95 },
    { hour: '15', score: 89 },
    { hour: '16', score: 76 },
    { hour: '17', score: 58 },
    { hour: '18', score: 45 },
    { hour: '19', score: 35 },
    { hour: '20', score: 28 }
  ],
  distractionStats: {
    totalDistractions: 127,
    avgPerSession: 3.2,
    topDistractions: [
      { type: 'Notifications', count: 45, percentage: 35 },
      { type: 'Tab Switching', count: 32, percentage: 25 },
      { type: 'Phone Checks', count: 28, percentage: 22 },
      { type: 'Colleague Interruptions', count: 15, percentage: 12 },
      { type: 'Other', count: 7, percentage: 6 }
    ]
  },
  flowScoreTrend: [
    { date: '2024-11-15', score: 72 },
    { date: '2024-11-16', score: 78 },
    { date: '2024-11-17', score: 65 },
    { date: '2024-11-18', score: 82 },
    { date: '2024-11-19', score: 83 },
    { date: '2024-11-20', score: 75 },
    { date: '2024-11-21', score: 83 }
  ],
  productivityMetrics: {
    totalSessions: 20,
    totalFlowTime: 1240, // minutes
    avgSessionLength: 48, // minutes
    avgFlowScore: 79,
    longestStreak: 5,
    currentStreak: 3,
    totalGoalsCompleted: 15,
    weeklyGoal: 5
  }
};

// ============================================================================
// DEMO ACHIEVEMENTS DATA
// ============================================================================

export const demoAchievements = [
  {
    id: "first-session",
    title: "First Steps",
    description: "Complete your first focus session",
    icon: "🎯",
    tier: "bronze",
    unlocked: true,
    unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 100,
    maxProgress: 1
  },
  {
    id: "flow-master",
    title: "Flow Master",
    description: "Achieve flow score above 80 for 5 sessions",
    icon: "🌊",
    tier: "gold",
    unlocked: true,
    unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 100,
    maxProgress: 5
  },
  {
    id: "streak-warrior",
    title: "Streak Warrior",
    description: "Maintain a 5-day productivity streak",
    icon: "🔥",
    tier: "silver",
    unlocked: true,
    unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 100,
    maxProgress: 5
  },
  {
    id: "distraction-blocker",
    title: "Distraction Blocker",
    description: "Block 50 distractions in total",
    icon: "🛡️",
    tier: "silver",
    unlocked: true,
    unlockedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 100,
    maxProgress: 50
  },
  {
    id: "goal-crusher",
    title: "Goal Crusher",
    description: "Complete 10 goals",
    icon: "💪",
    tier: "bronze",
    unlocked: false,
    progress: 7,
    maxProgress: 10
  },
  {
    id: "marathon-runner",
    title: "Marathon Runner",
    description: "Complete a 2-hour focus session",
    icon: "🏃",
    tier: "gold",
    unlocked: false,
    progress: 90,
    maxProgress: 120
  },
  {
    id: "consistency-king",
    title: "Consistency King",
    description: "Complete sessions for 30 consecutive days",
    icon: "👑",
    tier: "platinum",
    unlocked: false,
    progress: 12,
    maxProgress: 30
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    description: "Ask the AI assistant 25 questions",
    icon: "🤖",
    tier: "bronze",
    unlocked: false,
    progress: 18,
    maxProgress: 25
  }
];

// ============================================================================
// DEMO GOALS DATA
// ============================================================================

export const demoGoals = [
  {
    id: "goal-1",
    title: "Complete React Project",
    description: "Finish the FLOWSTATE React application with all features",
    category: "Development",
    priority: "High",
    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 85,
    status: "In Progress",
    tasks: [
      { id: "task-1", title: "Implement dashboard", completed: true },
      { id: "task-2", title: "Add analytics charts", completed: true },
      { id: "task-3", title: "Create demo mode", completed: false },
      { id: "task-4", title: "Test all features", completed: false }
    ]
  },
  {
    id: "goal-2",
    title: "Learn Advanced React Patterns",
    description: "Master hooks, context, and performance optimization",
    category: "Learning",
    priority: "Medium",
    targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 60,
    status: "In Progress",
    tasks: [
      { id: "task-5", title: "Study custom hooks", completed: true },
      { id: "task-6", title: "Learn context patterns", completed: true },
      { id: "task-7", title: "Practice performance optimization", completed: false }
    ]
  },
  {
    id: "goal-3",
    title: "Improve Daily Productivity",
    description: "Establish consistent productivity habits",
    category: "Personal",
    priority: "High",
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 75,
    status: "In Progress",
    tasks: [
      { id: "task-8", title: "Set up morning routine", completed: true },
      { id: "task-9", title: "Track daily goals", completed: true },
      { id: "task-10", title: "Review weekly progress", completed: false },
      { id: "task-11", title: "Adjust habits based on data", completed: false }
    ]
  }
];

// ============================================================================
// DEMO ASSISTANT RESPONSES
// ============================================================================

export const demoAssistantResponses = {
  // Flow-related queries
  "flow": "Your current flow score of 82 indicates strong focus! You're in the optimal zone where productivity peaks. Keep maintaining this momentum - you're doing great!",
  "focus": "Based on your patterns, your best focus times are between 2-3 PM. Try scheduling important tasks during these windows for maximum productivity.",
  "distraction": "I've noticed you get distracted most by notifications. Consider enabling Do Not Disturb mode during focus sessions to minimize interruptions.",

  // Analytics queries
  "analytics": "Your weekly analytics show excellent progress! You've completed 7 sessions this week with an average flow score of 79. Your longest streak is 5 days, and you're on track with 3 current streak days.",
  "progress": "Great progress this week! You've achieved 85% completion on your React project goal and 60% on learning advanced React patterns. Keep up the momentum!",
  "trends": "Your flow score has been trending upward over the past week. Your best performance days are Tuesday and Thursday, with average scores above 80.",

  // Goals queries
  "goals": "You have 3 active goals: React project (85% complete), learning React patterns (60% complete), and daily productivity habits (75% complete). You're making excellent progress!",
  "productivity": "Your productivity metrics are strong! Average session length is 48 minutes with 79% flow score. You've completed 15 goals total and are maintaining a 3-day streak.",

  // General queries
  "help": "I'm your FlowState AI assistant! I can help you with: flow analysis, productivity tips, goal tracking, distraction management, and performance insights. What would you like to know?",
  "tips": "Here are 3 quick tips: 1) Schedule deep work during your peak focus hours (2-3 PM), 2) Take short breaks every 45-60 minutes, 3) Minimize notifications during focus sessions.",
  "break": "You've been working for 48 minutes continuously. I recommend taking a 5-10 minute break to recharge. This will help maintain your focus and prevent fatigue."
};

// ============================================================================
// DEMO USER PROFILE
// ============================================================================

export const demoUser = {
  id: "demo-user",
  name: "Demo User",
  email: "demo@flowstate.app",
  avatar: null,
  joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  settings: {
    theme: "dark",
    notifications: true,
    webcamEnabled: true,
    autoStartSessions: false,
    sessionDuration: 45,
    breakDuration: 5
  },
  stats: {
    totalSessions: 20,
    totalFlowTime: 1240,
    currentStreak: 3,
    longestStreak: 5,
    avgFlowScore: 79,
    totalGoalsCompleted: 15
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function generateDemoMetrics() {
  // Generate realistic but varying metrics for live updates
  const baseFlowScore = 75 + Math.random() * 20; // 75-95
  const typingCadence = 35 + Math.random() * 30; // 35-65 WPM
  const activeRatio = 0.7 + Math.random() * 0.25; // 70-95%

  return {
    flowScore: Math.round(baseFlowScore),
    typingCadence: Math.round(typingCadence),
    activeRatio: Math.round(activeRatio * 100) / 100,
    attentionScore: 75 + Math.random() * 20, // 75-95
    fatigueScore: 20 + Math.random() * 30, // 20-50
    distractionRisk: 10 + Math.random() * 20 // 10-30
  };
}

export function getDemoAssistantResponse(message) {
  const lowerMessage = message.toLowerCase();

  // Check for keyword matches
  for (const [keyword, response] of Object.entries(demoAssistantResponses)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }

  // Default response
  return "I'm here to help you optimize your productivity! Ask me about your flow scores, productivity tips, goals progress, or any other questions about improving your focus and efficiency.";
}

export function updateDemoGoalProgress(goalId, newProgress) {
  const goal = demoGoals.find(g => g.id === goalId);
  if (goal) {
    goal.progress = Math.min(100, Math.max(0, newProgress));
    if (goal.progress >= 100) {
      goal.status = "Completed";
    }
  }
  return demoGoals;
}