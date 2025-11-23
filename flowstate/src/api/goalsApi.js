/**
 * Goals API Client
 * 
 * API calls for goals management
 */

import { get, post, put, del } from './client';

/**
 * Get all goals for current user
 */
export async function getGoals() {
  const response = await get('/api/goals');
  if (response.success) {
    return response.data || [];
  }
  return [];
}

/**
 * Create a new goal
 */
export async function createGoal(goalData) {
  return await post('/api/goals', goalData);
}

/**
 * Update an existing goal
 */
export async function updateGoal(goalId, updates) {
  return await put(`/api/goals/${goalId}`, updates);
}

/**
 * Delete a goal
 */
export async function deleteGoal(goalId) {
  return await del(`/api/goals/${goalId}`);
}

/**
 * Toggle pin status of a goal
 */
export async function togglePinGoal(goalId) {
  return await post(`/api/goals/${goalId}/toggle-pin`);
}

/**
 * Get progress for all active goals
 */
export async function getGoalsProgress() {
  const response = await get('/api/goals/progress');
  if (response.success) {
    return response.data || [];
  }
  return [];
}

/**
 * Force recalculate all goals
 */
export async function recalculateGoals() {
  return await post('/api/goals/recalculate');
}
