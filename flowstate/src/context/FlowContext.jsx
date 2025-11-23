// src/context/FlowContext.jsx - COMPLETE VERSION WITH ALL INTEGRATIONS
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { analyzeFlow } from "../ai/flowAgent";
import { detectDistraction } from "../ai/distractionAgent";
import { updateStamina } from "../ai/staminaAgent";
import { evaluateDistractionSignals } from "../ai/distractionDetector";
import { startSession as apiStartSession, updateSessionMetrics, endSession as apiEndSession } from "../api/sessionApi";
import { checkAchievements } from "../api/achievementsApi";
import { getGoalsProgress } from "../api/goalsApi";
import { generateInsights } from "../api/flowApi";
import { compareGoalProgress, generateGoalNotifications } from "../utils/compareGoalProgress";
import { FlowMetricsTracker } from "../utils/FlowMetricsTracker";
import { WebcamDistraction } from "../utils/WebcamDistraction";
import { logger } from "../utils/logger";
import { dbClient } from "../services/dbClient";
import { APP_CONFIG } from "../config/appConfig";
import { generateDemoMetrics, demoSessions, demoAnalytics, demoAchievements, demoGoals } from "../demoData";

const FlowContext = createContext();

export const useFlow = () => useContext(FlowContext);

export const FlowProvider = ({ children }) => {
  const [flowState, setFlowState] = useState("IDLE"); // IDLE | MONITORING | FLOW
  const [blockedSite, setBlockedSite] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessionInsights, setSessionInsights] = useState([]);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [webcamStatus, setWebcamStatus] = useState('disabled'); // disabled | loading | active | error
  
  // Use ref to persist goal progress between sessions without triggering re-renders
  const previousGoalsProgress = useRef([]);
  const [completedGoalsThisSession, setCompletedGoalsThisSession] = useState([]);
  const [progressedGoalsThisSession, setProgressedGoalsThisSession] = useState([]);

  const [metrics, setMetrics] = useState(() => {
    // Initialize with demo data if in demo mode
    if (APP_CONFIG.DEMO_MODE) {
      const demoMetrics = generateDemoMetrics();
      return {
        flowScore: demoMetrics.flowScore,
        sessionDuration: 0,
        flowDuration: 0,
        typingCadence: demoMetrics.typingCadence,
        activeRatio: demoMetrics.activeRatio,
        blockedCount: 0,
        fatigueScore: demoMetrics.fatigueScore,
        distractionRisk: demoMetrics.distractionRisk,
        staminaScore: 50,
        staminaTrend: "stable",
        distractionEvents: 0,
        lastDistractionReason: null,
        focusStabilityScore: 100,
        attentionScore: demoMetrics.attentionScore,
        faceNotDetectedSeconds: 0,
        lookingAwaySeconds: 0,
      };
    }
    return {
      flowScore: 0,
      sessionDuration: 0,
      flowDuration: 0,
      typingCadence: 0,
      activeRatio: 0,
      blockedCount: 0,
      fatigueScore: 0,
      distractionRisk: 0,
      staminaScore: 50,
      staminaTrend: "stable",
      distractionEvents: 0,
      lastDistractionReason: null,
      focusStabilityScore: 100,
      attentionScore: 100,
      faceNotDetectedSeconds: 0,
      lookingAwaySeconds: 0,
    };
  });

  const [showOverlay, setShowOverlay] = useState(false);
  const [showBlockOverlay, setShowBlockOverlay] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Refs for real-time tracking
  const metricsTrackerRef = useRef(null);
  const webcamTrackerRef = useRef(null);
  const engineIntervalRef = useRef(null);
  const lastMetricsUploadRef = useRef(0);
  const METRICS_UPLOAD_INTERVAL = 5000; // Upload every 5 seconds

  // Initialize trackers on mount
  useEffect(() => {
    logger.info('FlowContext', 'Initializing trackers');
    metricsTrackerRef.current = new FlowMetricsTracker();
    webcamTrackerRef.current = new WebcamDistraction();
    
    return () => {
      logger.info('FlowContext', 'Cleaning up trackers');
      if (webcamTrackerRef.current) {
        webcamTrackerRef.current.stop();
      }
      if (metricsTrackerRef.current) {
        metricsTrackerRef.current.stop();
      }
    };
  }, []);

  // ---------- CORE ENGINE LOOP (1s) ----------
  useEffect(() => {
    if (flowState === "IDLE") {
      if (engineIntervalRef.current) {
        clearInterval(engineIntervalRef.current);
        engineIntervalRef.current = null;
      }
      return;
    }

    engineIntervalRef.current = setInterval(() => {
      const tracker = metricsTrackerRef.current;
      
      // Use demo metrics if in demo mode
      let trackerMetrics;
      if (APP_CONFIG.DEMO_MODE) {
        const demoMetrics = generateDemoMetrics();
        trackerMetrics = {
          typingCadence: demoMetrics.typingCadence,
          activeRatio: demoMetrics.activeRatio,
          distractionRisk: demoMetrics.distractionRisk,
          idleSeconds: 0,
          tabsSwitched: Math.floor(Math.random() * 3),
          lastBlurTime: Date.now() - Math.random() * 10000
        };
      } else {
        if (!tracker) return;
        tracker.tick();
        trackerMetrics = tracker.getMetrics();
      }
      
      // Get webcam metrics if enabled
      let webcamMetrics = { attentionScore: 100, isDistracted: false, distractionReason: null, faceNotDetectedSeconds: 0, lookingAwaySeconds: 0 };
      if (APP_CONFIG.DEMO_MODE) {
        // Use demo webcam metrics
        const demoAttention = 75 + Math.random() * 20;
        webcamMetrics = {
          attentionScore: Math.round(demoAttention),
          isDistracted: Math.random() < 0.1, // 10% chance of distraction
          distractionReason: Math.random() < 0.1 ? "Looking away from screen" : null,
          faceNotDetectedSeconds: 0,
          lookingAwaySeconds: Math.random() < 0.1 ? Math.floor(Math.random() * 5) : 0
        };
      } else if (webcamEnabled && webcamTrackerRef.current && webcamTrackerRef.current.isRunning) {
        webcamMetrics = webcamTrackerRef.current.getMetrics();
      }
      
      const { typingCadence, activeRatio, distractionRisk } = trackerMetrics;
      const wasWindowBlurredRecently = Date.now() - tracker.lastBlurTime < 5000;

      setMetrics((prev) => {
        // Distraction detection (browser + webcam)
        const distractionAnalysis = evaluateDistractionSignals({
          typingCadence,
          activeRatio,
          flowState,
          wasWindowBlurredRecently,
          idleSeconds: tracker.idleSeconds,
          tabSwitchCountLastMinute: tracker.tabsSwitched,
          webcamDistracted: webcamMetrics.isDistracted,
          attentionScore: webcamMetrics.attentionScore,
        });

        // AI agent analysis
        const flowAnalysis = analyzeFlow({
          typingCadence,
          activeRatio,
          prevFlowScore: prev.flowScore,
          flowState,
        });

        // Handle distraction events (browser + webcam)
        let newDistractionEvents = prev.distractionEvents;
        let newLastDistractionReason = prev.lastDistractionReason;
        let adjustedFlowScore = flowAnalysis.flowScore;

        if (distractionAnalysis.distractionTriggered || webcamMetrics.isDistracted) {
          newDistractionEvents += 1;
          newLastDistractionReason = webcamMetrics.isDistracted 
            ? webcamMetrics.distractionReason 
            : distractionAnalysis.distractionReason;
          
          if (flowState === "FLOW") {
            adjustedFlowScore = Math.max(0, adjustedFlowScore - 10);
          }
        }

        // State transitions
        if (flowState === "MONITORING" && flowAnalysis.isFlowLikely) {
          setFlowState("FLOW");
        } else if (flowAnalysis.shouldExitFlow || ((distractionAnalysis.distractionTriggered || webcamMetrics.isDistracted) && flowState === "FLOW")) {
          setFlowState("MONITORING");
        }

        const newSessionDuration = prev.sessionDuration + 1;
        const newFlowDuration = flowState === "FLOW" ? prev.flowDuration + 1 : prev.flowDuration;

        const stamina = updateStamina({
          sessionDuration: newSessionDuration,
          flowDuration: newFlowDuration,
          prevStaminaScore: prev.staminaScore,
        });

        const decision = detectDistraction({
          flowState,
          distractionRisk: flowAnalysis.distractionRisk,
        });

        if (decision.shouldBlock) {
          setBlockedSite(decision.site);
          setShowBlockOverlay(true);
          setShowOverlay(true);

          return {
            ...prev,
            sessionDuration: newSessionDuration,
            flowDuration: newFlowDuration,
            typingCadence,
            activeRatio,
            flowScore: adjustedFlowScore,
            fatigueScore: flowAnalysis.fatigueScore,
            distractionRisk: flowAnalysis.distractionRisk,
            staminaScore: stamina.staminaScore,
            staminaTrend: stamina.staminaTrend,
            blockedCount: prev.blockedCount + 1,
            distractionEvents: newDistractionEvents,
            lastDistractionReason: newLastDistractionReason,
            focusStabilityScore: distractionAnalysis.focusStabilityScore,
            attentionScore: webcamMetrics.attentionScore,
            faceNotDetectedSeconds: webcamMetrics.faceNotDetectedSeconds || 0,
            lookingAwaySeconds: webcamMetrics.lookingAwaySeconds || 0,
          };
        }

        return {
          ...prev,
          sessionDuration: newSessionDuration,
          flowDuration: newFlowDuration,
          typingCadence,
          activeRatio,
          flowScore: adjustedFlowScore,
          fatigueScore: flowAnalysis.fatigueScore,
          distractionRisk: flowAnalysis.distractionRisk,
          staminaScore: stamina.staminaScore,
          staminaTrend: stamina.staminaTrend,
          distractionEvents: newDistractionEvents,
          lastDistractionReason: newLastDistractionReason,
          focusStabilityScore: distractionAnalysis.focusStabilityScore,
          attentionScore: webcamMetrics.attentionScore,
          faceNotDetectedSeconds: webcamMetrics.faceNotDetectedSeconds || 0,
          lookingAwaySeconds: webcamMetrics.lookingAwaySeconds || 0,
        };
      });

      // Upload metrics to backend every 5 seconds (skip in demo mode)
      const now = Date.now();
      if (!APP_CONFIG.DEMO_MODE && currentSessionId && now - lastMetricsUploadRef.current >= METRICS_UPLOAD_INTERVAL) {
        lastMetricsUploadRef.current = now;
        
        setMetrics((currentMetrics) => {
          updateSessionMetrics(currentSessionId, {
            ...currentMetrics,
            ...trackerMetrics,
            sessionDuration: currentMetrics.sessionDuration,
            flowDuration: currentMetrics.flowDuration,
          }).catch((error) => {
            console.warn('Failed to upload metrics to backend:', error.message);
          });
          return currentMetrics;
        });
      }
    }, 1000);

    return () => {
      if (engineIntervalRef.current) {
        clearInterval(engineIntervalRef.current);
        engineIntervalRef.current = null;
      }
    };
  }, [flowState, currentSessionId, webcamEnabled]);

  // ---------- WEBCAM CONTROLS ----------
  const toggleWebcam = async () => {
    if (!webcamTrackerRef.current) return;
    
    if (webcamEnabled) {
      webcamTrackerRef.current.stop();
      setWebcamEnabled(false);
      setWebcamStatus('disabled');
    } else {
      setWebcamStatus('loading');
      const success = await webcamTrackerRef.current.start();
      if (success) {
        setWebcamEnabled(true);
        setWebcamStatus('active');
      } else {
        setWebcamEnabled(false);
        setWebcamStatus('error');
      }
    }
  };

  // ---------- CONTROLS ----------
  const startSession = async () => {
    logger.event('FlowContext', 'Starting session');
    setFlowState("MONITORING");
    setShowSummary(false);
    setShowOverlay(false);
    setShowBlockOverlay(false);
    setSessionInsights([]);
    
    // Initialize metrics with demo data if in demo mode
    const initialMetrics = APP_CONFIG.DEMO_MODE ? (() => {
      const demoMetrics = generateDemoMetrics();
      return {
        flowScore: demoMetrics.flowScore,
        sessionDuration: 0,
        flowDuration: 0,
        typingCadence: demoMetrics.typingCadence,
        activeRatio: demoMetrics.activeRatio,
        blockedCount: 0,
        fatigueScore: demoMetrics.fatigueScore,
        distractionRisk: demoMetrics.distractionRisk,
        staminaScore: 50,
        staminaTrend: "stable",
        distractionEvents: 0,
        lastDistractionReason: null,
        focusStabilityScore: 100,
        attentionScore: demoMetrics.attentionScore,
        faceNotDetectedSeconds: 0,
        lookingAwaySeconds: 0,
      };
    })() : {
      flowScore: 0,
      sessionDuration: 0,
      flowDuration: 0,
      typingCadence: 0,
      activeRatio: 0,
      blockedCount: 0,
      fatigueScore: 0,
      distractionRisk: 0,
      staminaScore: 50,
      staminaTrend: "stable",
      distractionEvents: 0,
      lastDistractionReason: null,
      focusStabilityScore: 100,
      attentionScore: 100,
      faceNotDetectedSeconds: 0,
      lookingAwaySeconds: 0,
    };

    setMetrics(initialMetrics);

    if (!APP_CONFIG.DEMO_MODE) {
      if (metricsTrackerRef.current) {
        metricsTrackerRef.current.reset();
        metricsTrackerRef.current.start();
      }
      if (webcamEnabled && webcamTrackerRef.current) {
        webcamTrackerRef.current.reset();
      }
    }
    lastMetricsUploadRef.current = 0;

    if (APP_CONFIG.DEMO_MODE) {
      // Use local session ID for demo mode
      setCurrentSessionId(`demo-${Date.now()}`);
      logger.event('FlowContext', 'Demo session started');
    } else {
      try {
        const response = await apiStartSession({
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });
        
        if (response && response.sessionId) {
          setCurrentSessionId(response.sessionId);
          logger.event('FlowContext', 'Session started on backend', { sessionId: response.sessionId });
        }
      } catch (error) {
        logger.error('FlowContext', 'Failed to start session on backend', error);
        // Continue with local session
        setCurrentSessionId(`local-${Date.now()}`);
      }
    }
  };

  const endSession = async () => {
    logger.event('FlowContext', 'Ending session', { sessionId: currentSessionId });
    
    const finalMetrics = APP_CONFIG.DEMO_MODE ? metrics : (metricsTrackerRef.current ? {
      ...metrics,
      ...metricsTrackerRef.current.getMetrics(),
    } : { ...metrics });
    
    if (!APP_CONFIG.DEMO_MODE && metricsTrackerRef.current) {
      metricsTrackerRef.current.stop();
    }
    
    setFlowState("IDLE");
    setShowOverlay(false);
    setShowBlockOverlay(false);

    if (currentSessionId) {
      if (APP_CONFIG.DEMO_MODE) {
        // Save demo session to localStorage
        const demoSession = {
          id: currentSessionId,
          startTime: new Date(Date.now() - finalMetrics.sessionDuration * 1000).toISOString(),
          endTime: new Date().toISOString(),
          duration: finalMetrics.sessionDuration,
          flowDuration: finalMetrics.flowDuration,
          flowScore: finalMetrics.flowScore,
          distractionCount: finalMetrics.distractionEvents,
          keyPressCount: Math.floor(finalMetrics.typingCadence * finalMetrics.sessionDuration / 60),
          goals: ["Demo session"],
          notes: `Demo session completed with ${finalMetrics.flowScore}% flow score`
        };

        const existingSessions = JSON.parse(localStorage.getItem('demoSessions') || '[]');
        existingSessions.push(demoSession);
        localStorage.setItem('demoSessions', JSON.stringify(existingSessions.slice(-20))); // Keep last 20

        // Generate demo insights
        const demoInsights = [
          `Great session! You maintained ${Math.round(finalMetrics.flowDuration / finalMetrics.sessionDuration * 100)}% flow time.`,
          `Your average flow score was ${finalMetrics.flowScore} - ${finalMetrics.flowScore > 80 ? 'excellent' : finalMetrics.flowScore > 60 ? 'good' : 'needs improvement'}.`,
          `You experienced ${finalMetrics.distractionEvents} distraction${finalMetrics.distractionEvents !== 1 ? 's' : ''} during this session.`,
          `Consider taking short breaks every 45-60 minutes to maintain peak performance.`
        ];
        setSessionInsights(demoInsights);

        logger.event('FlowContext', 'Demo session saved to localStorage');
      } else {
        try {
          // Save to database using dbClient
          await dbClient.saveSession(null, finalMetrics);
          logger.event('FlowContext', 'Session saved to database', { sessionId: currentSessionId });

          const response = await apiEndSession(currentSessionId, finalMetrics);
          
          if (response && response.insights) {
            setSessionInsights(response.insights);
          }

          const aiInsights = await generateInsights(finalMetrics);
          if (aiInsights && aiInsights.length > 0) {
            setSessionInsights((prev) => [...prev, ...aiInsights]);
          }

          try {
            const achievementResponse = await checkAchievements();
            if (achievementResponse && achievementResponse.newAchievements && achievementResponse.newAchievements.length > 0) {
              window.dispatchEvent(
                new CustomEvent('newAchievements', { 
                  detail: achievementResponse.newAchievements 
                })
              );
            }
          } catch (error) {
            logger.error('FlowContext', 'Failed to check achievements', error);
          }

          try {
            const currentGoalsProgress = await getGoalsProgress();
            const { progressedGoals, completedGoals } = compareGoalProgress(
              previousGoalsProgress.current,
              currentGoalsProgress
            );

            setCompletedGoalsThisSession(completedGoals);
            setProgressedGoalsThisSession(progressedGoals);

            if (progressedGoals.length > 0 || completedGoals.length > 0) {
              const goalNotifications = generateGoalNotifications(progressedGoals, completedGoals);
              
              if (goalNotifications.length > 0) {
                setTimeout(() => {
                  window.dispatchEvent(
                    new CustomEvent('goalProgress', { 
                      detail: goalNotifications 
                    })
                  );
                }, 400);
              }
            }

            previousGoalsProgress.current = currentGoalsProgress;
          } catch (error) {
            logger.error('FlowContext', 'Failed to check goal progress', error);
          }
        } catch (error) {
          logger.error('FlowContext', 'Failed to end session', error);
        }
      }
    }

    setCurrentSessionId(null);
    setShowSummary(true);
  };

  const returnToFlow = () => {
    setShowOverlay(false);
    setShowBlockOverlay(false);
  };

  const overrideFlow = () => {
    setFlowState("MONITORING");
    setShowOverlay(false);
    setShowBlockOverlay(false);
  };

  return (
    <FlowContext.Provider
      value={{
        flowState,
        metrics,
        showOverlay,
        showBlockOverlay,
        setShowBlockOverlay,
        showSummary,
        blockedSite,
        sessionInsights,
        currentSessionId,
        sessionDuration: metrics.sessionDuration,
        completedGoalsThisSession,
        progressedGoalsThisSession,
        webcamEnabled,
        webcamStatus,
        toggleWebcam,
        startSession,
        endSession,
        returnToFlow,
        overrideFlow,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
};
