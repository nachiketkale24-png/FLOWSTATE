/**
 * Session Validation Utilities - CommonJS
 */

function validateSessionData(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Session data must be an object'] };
  }

  const numericFields = [
    'typingCadence',
    'activeRatio',
    'flowScore',
    'sessionDuration',
    'flowDuration',
    'staminaScore',
    'fatigueScore',
    'distractionRisk',
  ];

  numericFields.forEach(field => {
    if (data.hasOwnProperty(field)) {
      const value = data[field];
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${field} must be a valid number`);
      } else if (value < 0) {
        errors.push(`${field} cannot be negative`);
      }
    }
  });

  const scoreFields = ['flowScore', 'staminaScore', 'fatigueScore', 'distractionRisk'];
  scoreFields.forEach(field => {
    if (data.hasOwnProperty(field)) {
      const value = data[field];
      if (typeof value === 'number' && (value < 0 || value > 100)) {
        errors.push(`${field} must be between 0 and 100`);
      }
    }
  });

  if (data.hasOwnProperty('activeRatio')) {
    const value = data.activeRatio;
    if (typeof value === 'number' && (value < 0 || value > 1)) {
      errors.push('activeRatio must be between 0 and 1');
    }
  }

  const validFlowStates = ['IDLE', 'MONITORING', 'FLOW'];
  if (data.hasOwnProperty('flowState')) {
    if (!validFlowStates.includes(data.flowState)) {
      errors.push(`flowState must be one of: ${validFlowStates.join(', ')}`);
    }
  }

  if (data.sessionDuration && data.flowDuration) {
    if (data.flowDuration > data.sessionDuration) {
      errors.push('flowDuration cannot exceed sessionDuration');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateSessionData,
};
