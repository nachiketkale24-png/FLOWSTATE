// src/config/appConfig.js - Global App Configuration

/**
 * Centralized configuration for FlowState AI
 * Controls demo mode, feature flags, and system behavior
 */

// Check if Firebase is actually configured
const isFirebaseConfigured = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return apiKey && apiKey !== 'your_api_key_here' && apiKey !== '';
};

// App Configuration
export const APP_CONFIG = {
  // Version
  VERSION: '1.0.0-final',
  APP_NAME: 'FlowState AI',
  
  // Modes - Use real data if Firebase configured, else localStorage
  DEMO_MODE: !isFirebaseConfigured(), 
  ENABLE_FIRESTORE: isFirebaseConfigured(),
  ENABLE_FIREBASE_AUTH: isFirebaseConfigured(),
  
  // Features
  ENABLE_AI_TRACKING: true,
  ENABLE_WEBCAM_DETECTION: true,
  ENABLE_KEYBOARD_TRACKING: true,
  ENABLE_MOUSE_TRACKING: true,
  ENABLE_IDLE_DETECTION: true,
  
  // Logging
  LOG_ERRORS: true,
  LOG_WARNINGS: true,
  LOG_EVENTS: true,
  LOG_METRICS: false, // Too verbose, disable in prod
  
  // Timing (ms)
  METRICS_UPDATE_INTERVAL: 1000, // 1 second
  DB_SYNC_INTERVAL: 5000, // 5 seconds
  SESSION_AUTOSAVE_INTERVAL: 30000, // 30 seconds
  IDLE_TIMEOUT: 60000, // 1 minute
  
  // Limits
  MAX_SESSIONS_HISTORY: 100,
  MAX_LOG_ENTRIES: 500,
  SESSION_LIST_PAGE_SIZE: 20,
  
  // Demo Data
  DEMO_USER_ID: 'demo-user',
  DEMO_USERNAME: 'Demo User',
  
  // API
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  API_TIMEOUT: 10000, // 10 seconds
  
  // Error Recovery
  AUTO_RECOVER_FROM_ERRORS: true,
  FALLBACK_TO_DEMO_ON_ERROR: true,
  RETRY_FAILED_REQUESTS: true,
  MAX_RETRY_ATTEMPTS: 3,
};

/**
 * Get current mode status
 */
export const getModeStatus = () => ({
  isDemoMode: APP_CONFIG.DEMO_MODE,
  isFirestoreEnabled: APP_CONFIG.ENABLE_FIRESTORE,
  isAuthEnabled: APP_CONFIG.ENABLE_FIREBASE_AUTH,
  isAITrackingEnabled: APP_CONFIG.ENABLE_AI_TRACKING,
  version: APP_CONFIG.VERSION,
});

/**
 * Check if feature is enabled
 */
export const isFeatureEnabled = (featureName) => {
  return APP_CONFIG[`ENABLE_${featureName.toUpperCase()}`] ?? false;
};

/**
 * Get demo user info
 */
export const getDemoUser = () => ({
  uid: APP_CONFIG.DEMO_USER_ID,
  email: 'demo@flowstate.ai',
  displayName: APP_CONFIG.DEMO_USERNAME,
  photoURL: null,
  isDemo: true,
});

/**
 * Check if running in development
 */
export const isDevelopment = () => {
  return import.meta.env.DEV;
};

/**
 * Check if running in production
 */
export const isProduction = () => {
  return import.meta.env.PROD;
};

export default APP_CONFIG;
