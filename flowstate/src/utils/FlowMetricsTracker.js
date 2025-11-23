/**
 * Real-Time Flow Metrics Tracker
 * Tracks actual browser events and calculates flow metrics
 */

export class FlowMetricsTracker {
  constructor() {
    // Keystroke tracking
    this.keystrokesThisSecond = 0;
    this.keystrokeHistory = [];
    this.totalKeystrokes = 0;

    // Focus tracking
    this.isWindowFocused = true;
    this.focusedSeconds = 0;
    this.totalSeconds = 0;
    this.windowBlurCount = 0;
    this.windowFocusCount = 0;
    this.lastBlurTime = null;

    // Tab/Window switching
    this.tabSwitchCount = 0;
    this.recentSwitches = [];

    // Mouse/Click tracking
    this.clickCount = 0;
    this.lastClickTime = null;
    this.rapidClickDetected = false;

    // Idle tracking
    this.idleSeconds = 0;
    this.lastActivityTime = Date.now();

    // Session timing
    this.sessionStartTime = null;
    this.flowStateStartTime = null;
    this.flowDuration = 0;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Keystroke monitoring
    window.addEventListener('keydown', () => this.onKeystroke());

    // Window focus/blur
    window.addEventListener('focus', () => this.onWindowFocus());
    window.addEventListener('blur', () => this.onWindowBlur());

    // Visibility API (tab switching)
    document.addEventListener('visibilitychange', () => this.onVisibilityChange());

    // Mouse activity
    window.addEventListener('click', () => this.onMouseClick());
    window.addEventListener('mousemove', () => this.onMouseActivity());

    // Scroll activity
    window.addEventListener('scroll', () => this.onScrollActivity());
  }

  onKeystroke() {
    this.keystrokesThisSecond++;
    this.totalKeystrokes++;
    this.lastActivityTime = Date.now();
    this.idleSeconds = 0;
  }

  onWindowFocus() {
    this.isWindowFocused = true;
    this.windowFocusCount++;
    this.lastActivityTime = Date.now();
    
    if (this.lastBlurTime) {
      const blurDuration = (Date.now() - this.lastBlurTime) / 1000;
      if (blurDuration > 10) {
        // Long blur = possible context switch
        this.tabSwitchCount++;
      }
    }
  }

  onWindowBlur() {
    this.isWindowFocused = false;
    this.windowBlurCount++;
    this.lastBlurTime = Date.now();

    // Track as potential tab switch
    const now = Date.now();
    this.recentSwitches.push(now);
    // Keep only last 60 seconds
    this.recentSwitches = this.recentSwitches.filter(time => now - time < 60000);
  }

  onVisibilityChange() {
    if (document.hidden) {
      this.onWindowBlur();
    } else {
      this.onWindowFocus();
    }
  }

  onMouseClick() {
    this.clickCount++;
    this.lastActivityTime = Date.now();
    
    // Detect rapid clicking (possible distraction)
    if (this.lastClickTime && Date.now() - this.lastClickTime < 500) {
      this.rapidClickDetected = true;
    }
    this.lastClickTime = Date.now();
  }

  onMouseActivity() {
    this.lastActivityTime = Date.now();
    this.idleSeconds = 0;
  }

  onScrollActivity() {
    this.lastActivityTime = Date.now();
  }

  // Called every second by the flow engine
  tick() {
    this.totalSeconds++;

    if (this.isWindowFocused) {
      this.focusedSeconds++;
    }

    // Check for idle
    const timeSinceActivity = Date.now() - this.lastActivityTime;
    if (timeSinceActivity > 5000) {
      // Idle for 5+ seconds
      this.idleSeconds++;
    }

    // Track keystroke history
    this.keystrokeHistory.push(this.keystrokesThisSecond);
    if (this.keystrokeHistory.length > 60) {
      this.keystrokeHistory.shift(); // Keep last 60 seconds
    }

    // Reset per-second counters
    this.keystrokesThisSecond = 0;
  }

  // Calculate typing cadence (WPM approximation)
  getTypingCadence() {
    if (this.keystrokeHistory.length === 0) return 0;
    
    const avgKeysPerSecond = this.keystrokeHistory.reduce((a, b) => a + b, 0) / this.keystrokeHistory.length;
    // Approximate: 5 keys = 1 word
    return Math.round(avgKeysPerSecond * 12); // * 60 / 5
  }

  // Calculate active ratio
  getActiveRatio() {
    if (this.totalSeconds === 0) return 0;
    return Math.round((this.focusedSeconds / this.totalSeconds) * 100);
  }

  // Calculate distraction risk
  getDistractionRisk() {
    let risk = 0;

    // Recent tab switches (high risk)
    if (this.recentSwitches.length > 10) {
      risk += 40;
    } else if (this.recentSwitches.length > 5) {
      risk += 20;
    }

    // Idle time (medium risk)
    if (this.idleSeconds > 30) {
      risk += 30;
    } else if (this.idleSeconds > 15) {
      risk += 15;
    }

    // Low activity (low-medium risk)
    const recentActivity = this.keystrokeHistory.slice(-10).reduce((a, b) => a + b, 0);
    if (recentActivity < 5 && this.totalSeconds > 10) {
      risk += 10;
    }

    // Rapid clicks (possible distraction)
    if (this.rapidClickDetected) {
      risk += 15;
      this.rapidClickDetected = false; // Reset
    }

    return Math.min(risk, 100);
  }

  // Calculate flow score
  getFlowScore() {
    const activeRatio = this.getActiveRatio();
    const typingCadence = this.getTypingCadence();
    const distractionRisk = this.getDistractionRisk();

    // Flow formula
    let score = 0;
    score += activeRatio * 0.4; // 40% weight
    score += Math.min((typingCadence / 60) * 100, 100) * 0.3; // 30% weight
    score += (100 - distractionRisk) * 0.3; // 30% weight

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  // Get complete metrics snapshot
  getMetrics() {
    return {
      flowScore: this.getFlowScore(),
      sessionDuration: this.totalSeconds,
      flowDuration: this.flowDuration,
      typingCadence: this.getTypingCadence(),
      activeRatio: this.getActiveRatio(),
      distractionRisk: this.getDistractionRisk(),
      windowBlurCount: this.windowBlurCount,
      windowFocusCount: this.windowFocusCount,
      tabsSwitched: this.tabSwitchCount,
      totalKeystrokes: this.totalKeystrokes,
      clickCount: this.clickCount,
      idleSeconds: this.idleSeconds,
      timestamp: Date.now(),
    };
  }

  // Start tracking flow state
  enterFlowState() {
    this.flowStateStartTime = Date.now();
  }

  // Exit flow state
  exitFlowState() {
    if (this.flowStateStartTime) {
      const duration = (Date.now() - this.flowStateStartTime) / 1000;
      this.flowDuration += duration;
      this.flowStateStartTime = null;
    }
  }

  // Start new session
  start() {
    this.sessionStartTime = Date.now();
    this.isWindowFocused = document.hasFocus();
    this.lastActivityTime = Date.now();
  }

  // Stop tracking
  stop() {
    // Exit flow state if active
    if (this.flowStateStartTime) {
      this.exitFlowState();
    }
  }

  // Start tracking flow state (legacy - kept for compatibility)
  startSession() {
    this.start();
    this.reset();
  }

  // Reset all counters
  reset() {
    this.keystrokesThisSecond = 0;
    this.keystrokeHistory = [];
    this.totalKeystrokes = 0;
    this.focusedSeconds = 0;
    this.totalSeconds = 0;
    this.windowBlurCount = 0;
    this.windowFocusCount = 0;
    this.tabSwitchCount = 0;
    this.recentSwitches = [];
    this.clickCount = 0;
    this.idleSeconds = 0;
    this.flowDuration = 0;
    this.isWindowFocused = true;
  }

  // Cleanup
  destroy() {
    this.stop();
    // Note: Event listeners are added to window/document globally
    // In production, store handlers and remove them here
    // For now, they'll be garbage collected when tracker is destroyed
  }
}
