/**
 * Goals Controller - MongoDB Version
 */

const Goal = require('../models/Goal');
const logger = require('../utils/logger');

const createGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, type, category, target, endDate, priority, tags } = req.body;

    if (!title || !type || !target || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Title, type, target, and endDate are required',
      });
    }

    const goal = new Goal({
      userId,
      title,
      description,
      type,
      category: category || 'custom',
      target,
      endDate: new Date(endDate),
      priority: priority || 'medium',
      tags: tags || [],
    });

    await goal.save();
    logger.info(`✅ Goal created: ${goal._id} for user: ${userId}`);

    return res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal,
    });
  } catch (error) {
    logger.error('❌ Error creating goal:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to create goal',
    });
  }
};

const getUserGoals = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, type, limit = 50 } = req.query;

    const query = { userId };
    if (status) query.status = status;
    if (type) query.type = type;

    const goals = await Goal.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    return res.json({
      success: true,
      message: 'Goals retrieved successfully',
      data: { goals },
    });
  } catch (error) {
    logger.error('❌ Error getting goals:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to get goals',
    });
  }
};

const getGoalById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'NotFoundError',
        message: 'Goal not found',
      });
    }

    return res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    logger.error('❌ Error getting goal:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to get goal',
    });
  }
};

const updateGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const updates = req.body;

    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'NotFoundError',
        message: 'Goal not found',
      });
    }

    // Update allowed fields
    if (updates.title) goal.title = updates.title;
    if (updates.description !== undefined) goal.description = updates.description;
    if (updates.current !== undefined) goal.current = updates.current;
    if (updates.status) goal.status = updates.status;
    if (updates.priority) goal.priority = updates.priority;
    if (updates.tags) goal.tags = updates.tags;
    if (updates.notes !== undefined) goal.notes = updates.notes;

    await goal.save();

    return res.json({
      success: true,
      message: 'Goal updated successfully',
      data: goal,
    });
  } catch (error) {
    logger.error('❌ Error updating goal:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to update goal',
    });
  }
};

const updateGoalProgress = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Progress value is required',
      });
    }

    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'NotFoundError',
        message: 'Goal not found',
      });
    }

    goal.updateProgress(value);
    await goal.save();

    return res.json({
      success: true,
      message: 'Goal progress updated',
      data: {
        goalId: goal._id,
        current: goal.current,
        progress: goal.progress,
        status: goal.status,
      },
    });
  } catch (error) {
    logger.error('❌ Error updating goal progress:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to update goal progress',
    });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({ _id: id, userId });
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'NotFoundError',
        message: 'Goal not found',
      });
    }

    logger.info(`✅ Goal deleted: ${id}`);

    return res.json({
      success: true,
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    logger.error('❌ Error deleting goal:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to delete goal',
    });
  }
};

module.exports = {
  createGoal,
  getUserGoals,
  getGoalById,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
};
