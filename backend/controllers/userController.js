/**
 * User Controller - MongoDB Version
 */

const User = require('../models/User');
const Session = require('../models/Session');
const logger = require('../utils/logger');

const getUserSessionsList = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 50, skip = 0, status } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const sessions = await Session.find(query)
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await Session.countDocuments(query);

    return res.json({
      success: true,
      message: 'Sessions retrieved successfully',
      data: {
        sessions,
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    logger.error('❌ Error getting sessions:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to get sessions',
    });
  }
};

const getUserStatistics = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('stats displayName email');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NotFoundError',
        message: 'User not found',
      });
    }

    // Get additional stats from sessions
    const recentSessions = await Session.find({ userId, status: 'completed' })
      .sort({ startTime: -1 })
      .limit(10)
      .lean();

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const weekSessions = await Session.find({
      userId,
      status: 'completed',
      startTime: { $gte: last7Days },
    }).lean();

    const weekFlowTime = weekSessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0);
    const weekSessionsCount = weekSessions.length;

    return res.json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        userId: user._id,
        displayName: user.displayName,
        email: user.email,
        stats: user.stats,
        weekStats: {
          totalSessions: weekSessionsCount,
          totalFlowTime: weekFlowTime,
          avgFlowScore: weekSessionsCount > 0
            ? Math.round(weekSessions.reduce((sum, s) => sum + (s.flowScore || 0), 0) / weekSessionsCount)
            : 0,
        },
        recentSessions: recentSessions.slice(0, 5),
      },
    });
  } catch (error) {
    logger.error('❌ Error getting user stats:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to get user statistics',
    });
  }
};

module.exports = {
  getUserSessionsList,
  getUserStatistics,
};
