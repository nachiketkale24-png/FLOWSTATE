/**
 * Logger Utility
 * 
 * Structured logging with levels and timestamps
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

/**
 * Get formatted timestamp
 * 
 * @returns {string} ISO timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Get colored output for log level
 * 
 * @param {string} level - Log level
 * @returns {string} Colored level string
 */
function getColoredLevel(level) {
  const colors = {
    DEBUG: '\x1b[36m', // Cyan
    INFO: '\x1b[32m',  // Green
    WARN: '\x1b[33m',  // Yellow
    ERROR: '\x1b[31m', // Red
  };
  const reset = '\x1b[0m';
  
  return `${colors[level] || ''}${level}${reset}`;
}

/**
 * Format log message
 * 
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {string} Formatted log message
 */
function formatLogMessage(level, message, meta = {}) {
  const timestamp = getTimestamp();
  const coloredLevel = getColoredLevel(level);
  
  let logMessage = `[${timestamp}] ${coloredLevel}: ${message}`;
  
  if (Object.keys(meta).length > 0) {
    logMessage += ` ${JSON.stringify(meta)}`;
  }
  
  return logMessage;
}

/**
 * Log debug message
 * 
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
export function debug(message, meta = {}) {
  if (CURRENT_LOG_LEVEL <= LOG_LEVELS.DEBUG) {
    console.log(formatLogMessage('DEBUG', message, meta));
  }
}

/**
 * Log info message
 * 
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
export function info(message, meta = {}) {
  if (CURRENT_LOG_LEVEL <= LOG_LEVELS.INFO) {
    console.log(formatLogMessage('INFO', message, meta));
  }
}

/**
 * Log warning message
 * 
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
export function warn(message, meta = {}) {
  if (CURRENT_LOG_LEVEL <= LOG_LEVELS.WARN) {
    console.warn(formatLogMessage('WARN', message, meta));
  }
}

/**
 * Log error message
 * 
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata (can include error object)
 */
export function error(message, meta = {}) {
  if (CURRENT_LOG_LEVEL <= LOG_LEVELS.ERROR) {
    console.error(formatLogMessage('ERROR', message, meta));
    
    // Log stack trace if error object is provided
    if (meta.error && meta.error.stack) {
      console.error(meta.error.stack);
    }
  }
}

/**
 * Log HTTP request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} duration - Request duration in ms
 */
export function logRequest(req, res, duration) {
  const meta = {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
  };
  
  if (res.statusCode >= 500) {
    error(`Request failed: ${req.method} ${req.path}`, meta);
  } else if (res.statusCode >= 400) {
    warn(`Client error: ${req.method} ${req.path}`, meta);
  } else {
    info(`Request: ${req.method} ${req.path}`, meta);
  }
}

/**
 * Log session event
 * 
 * @param {string} event - Event type
 * @param {string} sessionId - Session ID
 * @param {Object} meta - Additional metadata
 */
export function logSession(event, sessionId, meta = {}) {
  info(`Session ${event}: ${sessionId}`, meta);
}

/**
 * Log AI operation
 * 
 * @param {string} operation - Operation type
 * @param {Object} meta - Additional metadata
 */
export function logAI(operation, meta = {}) {
  info(`AI operation: ${operation}`, meta);
}

/**
 * Create request logger middleware
 * 
 * @returns {Function} Express middleware
 */
export function createRequestLogger() {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Log when response finishes
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logRequest(req, res, duration);
    });
    
    next();
  };
}

/**
 * Log performance metric
 * 
 * @param {string} operation - Operation name
 * @param {number} duration - Duration in ms
 * @param {Object} meta - Additional metadata
 */
export function logPerformance(operation, duration, meta = {}) {
  const message = `Performance: ${operation} completed in ${duration}ms`;
  
  if (duration > 1000) {
    warn(message, { ...meta, slow: true });
  } else {
    debug(message, meta);
  }
}

/**
 * Create performance timer
 * 
 * @param {string} operation - Operation name
 * @returns {Function} Function to call when operation completes
 */
export function startTimer(operation) {
  const startTime = Date.now();
  
  return (meta = {}) => {
    const duration = Date.now() - startTime;
    logPerformance(operation, duration, meta);
    return duration;
  };
}

export default {
  debug,
  info,
  warn,
  error,
  logRequest,
  logSession,
  logAI,
  logPerformance,
  startTimer,
  createRequestLogger,
};