/**
 * Goal Progress Comparison Utility
 * 
 * Compares previous and current goal progress to identify:
 * - Goals that made progress
 * - Goals that were completed
 */

/**
 * Compare two goal progress snapshots
 * @param {Array} prevProgress - Previous progress snapshot
 * @param {Array} nextProgress - Current progress snapshot
 * @returns {Object} { progressedGoals, completedGoals }
 */
export function compareGoalProgress(prevProgress = [], nextProgress = []) {
  const progressedGoals = [];
  const completedGoals = [];

  // Create a map of previous progress for quick lookup
  const prevMap = new Map();
  prevProgress.forEach(goal => {
    prevMap.set(goal.goalId, goal);
  });

  // Compare each current goal with its previous state
  nextProgress.forEach(currentGoal => {
    const prevGoal = prevMap.get(currentGoal.goalId);

    // Skip if this is a new goal (no previous data)
    if (!prevGoal) {
      return;
    }

    // Check if goal was completed in this session
    if (prevGoal.status !== 'completed' && currentGoal.status === 'completed') {
      completedGoals.push(currentGoal);
      return; // Don't also mark as progressed
    }

    // Check if goal made progress (percentage increased)
    if (currentGoal.percentComplete > prevGoal.percentComplete) {
      // Only notify if progress increased by at least 5%
      const progressDelta = currentGoal.percentComplete - prevGoal.percentComplete;
      if (progressDelta >= 5) {
        progressedGoals.push({
          ...currentGoal,
          progressDelta
        });
      }
    }
  });

  // Sort progressed goals by progress delta (most progress first)
  progressedGoals.sort((a, b) => b.progressDelta - a.progressDelta);

  return {
    progressedGoals,
    completedGoals
  };
}

/**
 * Generate notification messages for goal progress
 * @param {Array} progressedGoals - Goals that made progress
 * @param {Array} completedGoals - Goals that were completed
 * @returns {Array} Array of notification objects
 */
export function generateGoalNotifications(progressedGoals, completedGoals) {
  const notifications = [];

  // Add completion notifications first (higher priority)
  completedGoals.forEach(goal => {
    notifications.push({
      type: 'goalCompleted',
      title: `🏆 Goal Completed: ${goal.title}`,
      message: `${goal.currentValue}/${goal.targetValue} ${goal.unit}`,
      goal
    });
  });

  // Add progress notifications
  progressedGoals.forEach(goal => {
    notifications.push({
      type: 'goalProgress',
      title: `🎯 Goal Progress: ${goal.title}`,
      message: `${goal.currentValue}/${goal.targetValue} ${goal.unit} (${goal.percentComplete}%)`,
      goal
    });
  });

  // Limit to max 3 notifications
  return notifications.slice(0, 3);
}
