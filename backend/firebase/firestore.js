/**
 * Firestore Database Operations
 * 
 * Collections structure:
 * - users/{userId}/
 *   - profile: User profile data
 *   - settings: User preferences
 *   - sessions/{sessionId}: Individual session documents
 *   - stats: Aggregated statistics
 */

import { getDb, getAdmin } from './admin.js';

/**
 * Create or update user profile
 * 
 * @param {string} userId - User ID from Firebase Auth
 * @param {Object} profileData - User profile data
 * @returns {Promise<Object>} Created/updated profile
 */
export async function createOrUpdateUserProfile(userId, profileData = {}) {
  try {
    const db = getDb();
    const admin = getAdmin();
    
    const userProfileRef = db.collection('users').doc(userId);
    const userDoc = await userProfileRef.get();
    
    const profileDoc = {
      email: profileData.email || null,
      displayName: profileData.displayName || null,
      photoURL: profileData.photoURL || null,
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...profileData,
    };
    
    if (!userDoc.exists) {
      // First time user - create profile
      profileDoc.createdAt = admin.firestore.FieldValue.serverTimestamp();
      await userProfileRef.set(profileDoc);
      console.log(`✅ User profile created: ${userId}`);
    } else {
      // Existing user - update profile
      await userProfileRef.update(profileDoc);
      console.log(`✅ User profile updated: ${userId}`);
    }
    
    return {
      id: userId,
      ...profileDoc,
    };
  } catch (error) {
    console.error('❌ Error creating/updating user profile:', error);
    throw new Error(`Failed to save user profile: ${error.message}`);
  }
}

/**
 * Get user profile
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile(userId) {
  try {
    const db = getDb();
    
    const userProfileRef = db.collection('users').doc(userId);
    const userDoc = await userProfileRef.get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    return {
      id: userId,
      ...userDoc.data(),
    };
  } catch (error) {
    console.error(`❌ Error getting user profile ${userId}:`, error);
    throw new Error(`Failed to get user profile: ${error.message}`);
  }
}

/**
 * Save a new session to Firestore under users/{userId}/sessions
 * 
 * @param {string} userId - User ID
 * @param {Object} sessionData - Initial session data
 * @returns {Promise<Object>} Created session with ID
 */
export async function saveSession(userId, sessionData = {}) {
  try {
    const db = getDb();
    const admin = getAdmin();
    
    const sessionDoc = {
      userId,
      status: 'active',
      startTime: admin.firestore.FieldValue.serverTimestamp(),
      endTime: null,
      flowDuration: 0,
      sessionDuration: 0,
      flowScore: 0,
      staminaScore: 50,
      blockedCount: 0,
      totalKeystrokes: 0,
      averageWPM: 0,
      peakFlowScore: 0,
      flowState: 'IDLE',
      metrics: [],
      insights: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...sessionData,
    };

    // Save session under users/{userId}/sessions
    const sessionRef = await db
      .collection('users')
      .doc(userId)
      .collection('sessions')
      .add(sessionDoc);
    
    console.log(`✅ Session created: ${sessionRef.id} for user: ${userId}`);
    
    return {
      id: sessionRef.id,
      ...sessionDoc,
    };
  } catch (error) {
    console.error('❌ Error saving session:', error);
    throw new Error(`Failed to save session: ${error.message}`);
  }
}

/**
 * Update session with real-time metrics
 * 
 * @param {string} userId - User ID
 * @param {string} sessionId - Session document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated session data
 */
export async function updateSession(userId, sessionId, updates = {}) {
  try {
    const db = getDb();
    const admin = getAdmin();
    
    const sessionRef = db
      .collection('users')
      .doc(userId)
      .collection('sessions')
      .doc(sessionId);
      
    const sessionDoc = await sessionRef.get();
    
    if (!sessionDoc.exists) {
      throw new Error(`Session ${sessionId} not found for user ${userId}`);
    }

    const updateData = {
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // If metrics array is provided, append to existing metrics
    if (updates.metric) {
      updateData.metrics = admin.firestore.FieldValue.arrayUnion(updates.metric);
      delete updateData.metric; // Remove singular metric field
    }

    await sessionRef.update(updateData);
    
    // Fetch updated document
    const updatedDoc = await sessionRef.get();
    
    return {
      id: sessionId,
      ...updatedDoc.data(),
    };
  } catch (error) {
    console.error(`❌ Error updating session ${sessionId}:`, error);
    throw new Error(`Failed to update session: ${error.message}`);
  }
}

/**
 * End a session and finalize metrics
 * 
 * @param {string} userId - User ID
 * @param {string} sessionId - Session document ID
 * @param {Object} finalData - Final session summary
 * @returns {Promise<Object>} Completed session data
 */
export async function endSession(userId, sessionId, finalData = {}) {
  try {
    const db = getDb();
    const admin = getAdmin();
    
    const sessionRef = db
      .collection('users')
      .doc(userId)
      .collection('sessions')
      .doc(sessionId);
      
    const sessionDoc = await sessionRef.get();
    
    if (!sessionDoc.exists) {
      throw new Error(`Session ${sessionId} not found for user ${userId}`);
    }

    const sessionData = sessionDoc.data();
    
    // Calculate session duration if not provided
    const startTime = sessionData.startTime?.toDate?.() || new Date();
    const endTime = new Date();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);

    const finalUpdate = {
      status: 'completed',
      endTime: admin.firestore.FieldValue.serverTimestamp(),
      sessionDuration: finalData.sessionDuration || durationSeconds,
      flowDuration: finalData.flowDuration || sessionData.flowDuration || 0,
      flowScore: finalData.flowScore || sessionData.flowScore || 0,
      staminaScore: finalData.staminaScore || sessionData.staminaScore || 50,
      blockedCount: finalData.blockedCount || sessionData.blockedCount || 0,
      insights: finalData.insights || sessionData.insights || [],
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...finalData,
    };

    await sessionRef.update(finalUpdate);
    
    console.log(`✅ Session ${sessionId} ended. Duration: ${finalUpdate.sessionDuration}s`);
    
    // Fetch final document
    const completedDoc = await sessionRef.get();
    
    return {
      id: sessionId,
      ...completedDoc.data(),
    };
  } catch (error) {
    console.error(`❌ Error ending session ${sessionId}:`, error);
    throw new Error(`Failed to end session: ${error.message}`);
  }
}

/**
 * Get all sessions for a user
 * 
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of sessions to return
 * @returns {Promise<Array>} Array of session documents
 */
export async function getUserSessions(userId, limit = 50) {
  try {
    const db = getDb();
    
    const sessionsRef = db
      .collection('users')
      .doc(userId)
      .collection('sessions')
      .orderBy('startTime', 'desc')
      .limit(limit);
    
    const snapshot = await sessionsRef.get();
    
    if (snapshot.empty) {
      console.log(`📭 No sessions found for user: ${userId}`);
      return [];
    }

    const sessions = [];
    snapshot.forEach(doc => {
      sessions.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    console.log(`✅ Retrieved ${sessions.length} sessions for user: ${userId}`);
    
    return sessions;
  } catch (error) {
    console.error(`❌ Error getting sessions for user ${userId}:`, error);
    throw new Error(`Failed to get user sessions: ${error.message}`);
  }
}

/**
 * Get a single session by ID
 * 
 * @param {string} userId - User ID
 * @param {string} sessionId - Session document ID
 * @returns {Promise<Object>} Session document
 */
export async function getSession(userId, sessionId) {
  try {
    const db = getDb();
    
    const sessionRef = db
      .collection('users')
      .doc(userId)
      .collection('sessions')
      .doc(sessionId);
      
    const sessionDoc = await sessionRef.get();
    
    if (!sessionDoc.exists) {
      throw new Error(`Session ${sessionId} not found for user ${userId}`);
    }
    
    return {
      id: sessionId,
      ...sessionDoc.data(),
    };
  } catch (error) {
    console.error(`❌ Error getting session ${sessionId}:`, error);
    throw new Error(`Failed to get session: ${error.message}`);
  }
}

/**
 * Delete a session (admin only)
 * 
 * @param {string} userId - User ID
 * @param {string} sessionId - Session document ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteSession(userId, sessionId) {
  try {
    const db = getDb();
    
    await db
      .collection('users')
      .doc(userId)
      .collection('sessions')
      .doc(sessionId)
      .delete();
    
    console.log(`🗑️ Session ${sessionId} deleted`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error deleting session ${sessionId}:`, error);
    throw new Error(`Failed to delete session: ${error.message}`);
  }
}

/**
 * Get session statistics for a user
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User statistics
 */
export async function getUserStats(userId) {
  try {
    const sessions = await getUserSessions(userId, 100);
    
    const stats = {
      totalSessions: sessions.length,
      totalFlowTime: 0,
      totalSessionTime: 0,
      averageFlowScore: 0,
      averageStamina: 0,
      totalDistractions: 0,
      lastSession: null,
    };

    if (sessions.length === 0) {
      return stats;
    }

    let flowScoreSum = 0;
    let staminaSum = 0;

    sessions.forEach(session => {
      stats.totalFlowTime += session.flowDuration || 0;
      stats.totalSessionTime += session.sessionDuration || 0;
      stats.totalDistractions += session.blockedCount || 0;
      flowScoreSum += session.flowScore || 0;
      staminaSum += session.staminaScore || 0;
    });

    stats.averageFlowScore = Math.round(flowScoreSum / sessions.length);
    stats.averageStamina = Math.round(staminaSum / sessions.length);
    stats.lastSession = sessions[0]; // Most recent

    return stats;
  } catch (error) {
    console.error(`❌ Error getting stats for user ${userId}:`, error);
    throw new Error(`Failed to get user stats: ${error.message}`);
  }
}

/**
 * Get user settings
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User settings
 */
export async function getUserSettings(userId) {
  try {
    const db = getDb();
    
    const settingsRef = db
      .collection('users')
      .doc(userId)
      .collection('settings')
      .doc('preferences');
      
    const settingsDoc = await settingsRef.get();
    
    if (!settingsDoc.exists) {
      // Return default settings
      return {
        flowThresholds: {
          enterFlow: 70,
          exitFlow: 40,
        },
        distractionBlocking: {
          enabled: true,
          blockedSites: [],
        },
        notifications: {
          flowStart: true,
          flowEnd: true,
          breaks: true,
        },
      };
    }
    
    return settingsDoc.data();
  } catch (error) {
    console.error(`❌ Error getting settings for user ${userId}:`, error);
    throw new Error(`Failed to get user settings: ${error.message}`);
  }
}

/**
 * Update user settings
 * 
 * @param {string} userId - User ID
 * @param {Object} settings - Settings to update
 * @returns {Promise<Object>} Updated settings
 */
export async function updateUserSettings(userId, settings = {}) {
  try {
    const db = getDb();
    const admin = getAdmin();
    
    const settingsRef = db
      .collection('users')
      .doc(userId)
      .collection('settings')
      .doc('preferences');
    
    const updateData = {
      ...settings,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await settingsRef.set(updateData, { merge: true });
    
    console.log(`✅ Settings updated for user: ${userId}`);
    
    const updatedDoc = await settingsRef.get();
    return updatedDoc.data();
  } catch (error) {
    console.error('Failed to update user settings:', error.message);
    throw new Error(`Failed to update user settings: ${error.message}`);
  }
}

/**
 * Get user achievements
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of unlocked achievements
 */
export async function getUserAchievements(userId) {
  try {
    const db = getDb();
    
    const achievementsRef = db
      .collection('users')
      .doc(userId)
      .collection('achievements');
      
    const snapshot = await achievementsRef.get();
    
    if (snapshot.empty) {
      return [];
    }
    
    const achievements = [];
    snapshot.forEach(doc => {
      achievements.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return achievements;
  } catch (error) {
    console.error(`Error getting achievements for user ${userId}:`, error);
    throw new Error(`Failed to get user achievements: ${error.message}`);
  }
}

/**
 * Award achievement to user
 * 
 * @param {string} userId - User ID
 * @param {Object} achievement - Achievement data
 * @returns {Promise<Object>} Awarded achievement
 */
export async function awardAchievement(userId, achievement) {
  try {
    const db = getDb();
    const admin = getAdmin();
    
    const achievementRef = db
      .collection('users')
      .doc(userId)
      .collection('achievements')
      .doc(achievement.id);
    
    // Check if already awarded
    const existingDoc = await achievementRef.get();
    if (existingDoc.exists) {
      return existingDoc.data();
    }
    
    const achievementDoc = {
      ...achievement,
      unlockedAt: admin.firestore.FieldValue.serverTimestamp(),
      seen: false,
    };
    
    await achievementRef.set(achievementDoc);
    
    console.log(`Achievement awarded: ${achievement.id} to user: ${userId}`);
    
    return achievementDoc;
  } catch (error) {
    console.error(`Error awarding achievement to user ${userId}:`, error);
    throw new Error(`Failed to award achievement: ${error.message}`);
  }
}

/**
 * Mark achievement as seen
 * 
 * @param {string} userId - User ID
 * @param {string} achievementId - Achievement ID
 * @returns {Promise<boolean>} Success status
 */
export async function markAchievementSeen(userId, achievementId) {
  try {
    const db = getDb();
    const admin = getAdmin();
    
    await db
      .collection('users')
      .doc(userId)
      .collection('achievements')
      .doc(achievementId)
      .update({
        seen: true,
        seenAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    
    return true;
  } catch (error) {
    console.error(`Error marking achievement as seen:`, error);
    throw new Error(`Failed to mark achievement as seen: ${error.message}`);
  }
}