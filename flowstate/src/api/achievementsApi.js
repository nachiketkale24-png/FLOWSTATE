/**
 * Achievements API
 * 
 * Handles achievement fetching and progress tracking
 */

import { get, post } from './client';

/**
 * Get all available achievements
 */
export async function getAllAchievements() {
  try {
    const response = await get('/api/achievements');
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Failed to fetch achievements:', error.message);
    throw error;
  }
}

/**
 * Get user's unlocked achievements
 */
export async function getUserAchievements() {
  try {
    const response = await get('/api/achievements/user');
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Failed to fetch user achievements:', error.message);
    throw error;
  }
}

/**
 * Check and award new achievements
 */
export async function checkAchievements() {
  try {
    const response = await post('/api/achievements/check');
    return response.success ? response.data : { newAchievements: [], totalUnlocked: 0, totalAvailable: 0 };
  } catch (error) {
    console.error('Failed to check achievements:', error.message);
    throw error;
  }
}

/**
 * Get achievement progress
 */
export async function getAchievementProgress() {
  try {
    const response = await get('/api/achievements/progress');
    return response.success ? response.data : { achievements: [], stats: {} };
  } catch (error) {
    console.error('Failed to fetch achievement progress:', error.message);
    throw error;
  }
}

/**
 * Mark achievement as seen
 */
export async function markAchievementSeen(achievementId) {
  try {
    const response = await post(`/api/achievements/${achievementId}/seen`);
    return response.success;
  } catch (error) {
    console.error('Failed to mark achievement as seen:', error.message);
    throw error;
  }
}
