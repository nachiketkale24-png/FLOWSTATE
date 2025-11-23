/**
 * Planner API Client
 * 
 * API calls for planner blocks management
 */

import { get, post, put, del } from './client';

/**
 * Get planner blocks (next 14 days)
 */
export async function getPlannerBlocks() {
  const response = await get('/api/goals/planner/blocks');
  if (response.success) {
    return response.data || [];
  }
  return [];
}

/**
 * Create a new planner block
 */
export async function createPlannerBlock(blockData) {
  return await post('/api/goals/planner/blocks', blockData);
}

/**
 * Update an existing planner block
 */
export async function updatePlannerBlock(blockId, updates) {
  return await put(`/api/goals/planner/blocks/${blockId}`, updates);
}

/**
 * Delete a planner block
 */
export async function deletePlannerBlock(blockId) {
  return await del(`/api/goals/planner/blocks/${blockId}`);
}

/**
 * Attach a session to a planner block
 */
export async function attachSessionToBlock(blockId, sessionId) {
  return await post(`/api/goals/planner/blocks/${blockId}/attach-session`, { sessionId });
}
