/**
 * Session Controller - MongoDB Version
 */

const Session = require('../models/Session');
const User = require('../models/User');
const { validateSessionData } = require('../utils/validateSession');
const { generateInsights } = require('../ai/insightsGenerator');
const logger = require('../utils/logger');

const startSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { initialData = {} } = req.body;

    const session = new Session({
      userId,
      flowState: 'IDLE',
      status: 'active',
      ...initialData,
    });

    await session.save();
    logger.info(`✅ Session started: ${session._id} for user: ${userId}`);

    return res.status(201).json({
      success: true,
      message: 'Session started successfully',
      data: {
        sessionId: session._id,
        userId: session.userId,
        status: session.status,
        startTime: session.startTime,
        flowState: session.flowState,
      },
    });
  } catch (error) {
    logger.error('❌ Error starting session:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to start session',
    });
  }
};

const updateSessionMetrics = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { metrics } = req.body;

    if (!id || !metrics) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Session ID and metrics are required',
      });
    }

    const validation = validateSessionData(metrics);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: validation.errors.join(', '),
      });
    }

    const session = await Session.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'NotFoundError',
        message: `Session ${id} not found`,
      });
    }

    if (metrics.flowState) session.flowState = metrics.flowState;
    if (metrics.flowScore !== undefined) session.flowScore = metrics.flowScore;
    if (metrics.attention !== undefined) session.metrics.attention = metrics.attention;
    if (metrics.stamina !== undefined) session.metrics.stamina = metrics.stamina;
    if (metrics.focus !== undefined) session.metrics.focus = metrics.focus;
    if (metrics.arousal !== undefined) session.metrics.arousal = metrics.arousal;

    session.addMetricsSnapshot();
    await session.save();

    return res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: {
        sessionId: session._id,
        metricsCount: session.metricsHistory.length,
        flowScore: session.flowScore,
        flowState: session.flowState,
      },
    });
  } catch (error) {
    logger.error('❌ Error updating session:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to update session',
    });
  }
};

const endSessionWithSummary = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { finalMetrics = {}, notes, taskCompleted } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Session ID is required',
      });
    }

    const session = await Session.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'NotFoundError',
        message: `Session ${id} not found`,
      });
    }

    if (finalMetrics.flowScore !== undefined) session.flowScore = finalMetrics.flowScore;
    if (finalMetrics.attention !== undefined) session.metrics.attention = finalMetrics.attention;
    if (finalMetrics.stamina !== undefined) session.metrics.stamina = finalMetrics.stamina;
    if (finalMetrics.focus !== undefined) session.metrics.focus = finalMetrics.focus;
    
    session.endTime = new Date();
    session.status = 'completed';
    if (notes) session.notes = notes;
    if (taskCompleted) session.taskCompleted = taskCompleted;

    let insights = [];
    try {
      insights = await generateInsights({
        sessionDuration: session.sessionDuration,
        flowScore: session.flowScore,
        metrics: session.metrics,
        metricsHistory: session.metricsHistory,
      });
    } catch (insightError) {
      logger.warn('⚠️  Failed to generate insights:', insightError.message);
      insights = ['Session completed successfully.'];
    }

    session.insights = insights;
    await session.save();

    const user = await User.findById(userId);
    if (user) {
      user.updateStats({
        sessionDuration: session.sessionDuration,
        flowScore: session.flowScore,
      });
      user.updateStreak();
      await user.save();
    }

    logger.info(`✅ Session ended: ${id}`);

    return res.status(200).json({
      success: true,
      message: 'Session ended successfully',
      data: {
        sessionId: session._id,
        userId: session.userId,
        sessionDuration: session.sessionDuration,
        flowScore: session.flowScore,
        metrics: session.metrics,
        insights: session.insights,
        status: session.status,
        startTime: session.startTime,
        endTime: session.endTime,
      },
    });
  } catch (error) {
    logger.error('❌ Error ending session:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to end session',
    });
  }
};

const getSessionById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Session ID is required',
      });
    }

    const session = await Session.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'NotFoundError',
        message: `Session ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    logger.error('❌ Error getting session:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to get session',
    });
  }
};

module.exports = {
  startSession,
  updateSessionMetrics,
  endSessionWithSummary,
  getSessionById,
};
