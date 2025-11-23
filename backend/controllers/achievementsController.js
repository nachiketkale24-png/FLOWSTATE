/**
 * Achievements Controller - MongoDB Version
 */

const { Achievement, UserAchievement } = require('../models/Achievement');
const logger = require('../utils/logger');

// Predefined achievements
const ACHIEVEMENTS = [
  {
    key: 'first_session',
    title: 'First Steps',
    description: 'Complete your first flow session',
    icon: '🎯',
    category: 'beginner',
    requirement: { type: 'sessions', value: 1 },
    points: 10,
    rarity: 'common',
  },
  {
    key: 'streak_3',
    title: '3-Day Streak',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'streak', value: 3 },
    points: 25,
    rarity: 'common',
  },
  {
    key: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    category: 'streak',
    requirement: { type: 'streak', value: 7 },
    points: 50,
    rarity: 'rare',
  },
  {
    key: 'flow_master',
    title: 'Flow Master',
    description: 'Achieve a flow score of 90+',
    icon: '🌊',
    category: 'flow',
    requirement: { type: 'flow_score', value: 90 },
    points: 75,
    rarity: 'epic',
  },
  {
    key: 'marathon',
    title: 'Marathon Runner',
    description: 'Complete 10 hours of flow time',
    icon: '🏃',
    category: 'time',
    requirement: { type: 'flow_time', value: 36000 },
    points: 100,
    rarity: 'legendary',
  },
];

// Initialize achievements in database
const initializeAchievements = async () => {
  try {
    for (const achData of ACHIEVEMENTS) {
      await Achievement.findOneAndUpdate(
        { key: achData.key },
        achData,
        { upsert: true, new: true }
      );
    }
    logger.info('✅ Achievements initialized');
  } catch (error) {
    logger.error('❌ Error initializing achievements:', error);
  }
};

const getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ category: 1, points: 1 }).lean();

    return res.json({
      success: true,
      message: 'Achievements retrieved successfully',
      data: { achievements },
    });
  } catch (error) {
    logger.error('❌ Error getting achievements:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to get achievements',
    });
  }
};

const getUserAchievements = async (req, res) => {
  try {
    const userId = req.userId;

    const userAchievements = await UserAchievement.find({ userId })
      .populate('achievementKey')
      .lean();

    const allAchievements = await Achievement.find().lean();

    const enrichedAchievements = allAchievements.map(ach => {
      const userAch = userAchievements.find(ua => ua.achievementKey === ach.key);
      return {
        ...ach,
        unlocked: userAch?.isCompleted || false,
        unlockedAt: userAch?.unlockedAt || null,
        progress: userAch?.progress || 0,
      };
    });

    const stats = {
      total: allAchievements.length,
      unlocked: userAchievements.filter(ua => ua.isCompleted).length,
      points: userAchievements
        .filter(ua => ua.isCompleted)
        .reduce((sum, ua) => {
          const ach = allAchievements.find(a => a.key === ua.achievementKey);
          return sum + (ach?.points || 0);
        }, 0),
    };

    return res.json({
      success: true,
      message: 'User achievements retrieved successfully',
      data: {
        achievements: enrichedAchievements,
        stats,
      },
    });
  } catch (error) {
    logger.error('❌ Error getting user achievements:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to get user achievements',
    });
  }
};

const unlockAchievement = async (req, res) => {
  try {
    const userId = req.userId;
    const { achievementKey } = req.body;

    if (!achievementKey) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Achievement key is required',
      });
    }

    const achievement = await Achievement.findOne({ key: achievementKey });
    if (!achievement) {
      return res.status(404).json({
        success: false,
        error: 'NotFoundError',
        message: 'Achievement not found',
      });
    }

    let userAchievement = await UserAchievement.findOne({ userId, achievementKey });

    if (userAchievement && userAchievement.isCompleted) {
      return res.json({
        success: true,
        message: 'Achievement already unlocked',
        data: { userAchievement },
      });
    }

    if (!userAchievement) {
      userAchievement = new UserAchievement({
        userId,
        achievementKey,
        isCompleted: true,
        progress: achievement.requirement.value,
      });
    } else {
      userAchievement.isCompleted = true;
      userAchievement.progress = achievement.requirement.value;
      userAchievement.unlockedAt = new Date();
    }

    await userAchievement.save();
    logger.info(`✅ Achievement unlocked: ${achievementKey} for user: ${userId}`);

    return res.json({
      success: true,
      message: 'Achievement unlocked!',
      data: {
        achievement: {
          ...achievement.toObject(),
          unlockedAt: userAchievement.unlockedAt,
        },
      },
    });
  } catch (error) {
    logger.error('❌ Error unlocking achievement:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to unlock achievement',
    });
  }
};

module.exports = {
  initializeAchievements,
  getAllAchievements,
  getUserAchievements,
  unlockAchievement,
};
