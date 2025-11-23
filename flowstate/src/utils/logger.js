// src/utils/logger.js - Global Logging System

import { APP_CONFIG } from '../config/appConfig';

/**
 * Log entry storage (in-memory for debug page)
 */
const logHistory = [];
const MAX_LOG_HISTORY = APP_CONFIG.MAX_LOG_ENTRIES || 500;

/**
 * Log listeners for real-time updates
 */
const logListeners = new Set();

/**
 * Add log entry to history
 */
const addToHistory = (entry) => {
  logHistory.unshift(entry); // Add to beginning
  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory.pop(); // Remove oldest
  }
  
  // Notify listeners
  logListeners.forEach(listener => {
    try {
      listener(entry);
    } catch (error) {
      console.error('Log listener error:', error);
    }
  });
};

/**
 * Format timestamp
 */
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

/**
 * Format log message
 */
const formatMessage = (level, category, message, data) => {
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;
  return { timestamp, level, category, message, data, prefix };
};

/**
 * Logger class
 */
class Logger {
  /**
   * Log info message
   */
  info(category, message, data = null) {
    if (!APP_CONFIG.LOG_EVENTS) return;
    
    const entry = formatMessage('info', category, message, data);
    addToHistory(entry);
    console.log(entry.prefix, message, data || '');
  }

  /**
   * Log warning message
   */
  warn(category, message, data = null) {
    if (!APP_CONFIG.LOG_WARNINGS) return;
    
    const entry = formatMessage('warn', category, message, data);
    addToHistory(entry);
    console.warn(entry.prefix, message, data || '');
  }

  /**
   * Log error message
   */
  error(category, message, error = null) {
    if (!APP_CONFIG.LOG_ERRORS) return;
    
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : null;
    
    const entry = formatMessage('error', category, message, errorData);
    addToHistory(entry);
    console.error(entry.prefix, message, error || '');
  }

  /**
   * Log event (user actions, state changes)
   */
  event(category, eventName, data = null) {
    if (!APP_CONFIG.LOG_EVENTS) return;
    
    const entry = formatMessage('event', category, eventName, data);
    addToHistory(entry);
    console.log(entry.prefix, eventName, data || '');
  }

  /**
   * Log metrics (performance, timing)
   */
  metrics(category, metricName, value) {
    if (!APP_CONFIG.LOG_METRICS) return;
    
    const entry = formatMessage('metrics', category, metricName, { value });
    addToHistory(entry);
    console.log(entry.prefix, metricName, value);
  }

  /**
   * Get log history
   */
  getHistory(filter = {}) {
    let filtered = [...logHistory];
    
    if (filter.level) {
      filtered = filtered.filter(entry => entry.level === filter.level);
    }
    
    if (filter.category) {
      filtered = filtered.filter(entry => entry.category === filter.category);
    }
    
    if (filter.limit) {
      filtered = filtered.slice(0, filter.limit);
    }
    
    return filtered;
  }

  /**
   * Clear log history
   */
  clearHistory() {
    logHistory.length = 0;
    this.info('Logger', 'Log history cleared');
  }

  /**
   * Subscribe to log updates
   */
  subscribe(listener) {
    logListeners.add(listener);
    return () => logListeners.delete(listener);
  }

  /**
   * Get statistics
   */
  getStats() {
    const stats = {
      total: logHistory.length,
      errors: 0,
      warnings: 0,
      events: 0,
      info: 0,
    };
    
    logHistory.forEach(entry => {
      stats[entry.level] = (stats[entry.level] || 0) + 1;
    });
    
    return stats;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logInfo = (category, message, data) => logger.info(category, message, data);
export const logWarn = (category, message, data) => logger.warn(category, message, data);
export const logError = (category, message, error) => logger.error(category, message, error);
export const logEvent = (category, eventName, data) => logger.event(category, eventName, data);
export const logMetrics = (category, metricName, value) => logger.metrics(category, metricName, value);

export default logger;
