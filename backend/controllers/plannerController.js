/**
 * Planner Controller - MongoDB Version
 */

const PlannerBlock = require('../models/PlannerBlock');
const logger = require('../utils/logger');

const createPlannerBlock = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, date, startTime, endTime, duration, type, priority, tags, color } = req.body;

    if (!title || !date || !startTime || !endTime || !duration) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Title, date, startTime, endTime, and duration are required',
      });
    }

    const block = new PlannerBlock({
      userId,
      title,
      description,
      date: new Date(date),
      startTime,
      endTime,
      duration,
      type: type || 'work',
      priority: priority || 'medium',
      tags: tags || [],
      color: color || '#3B82F6',
    });

    await block.save();
    logger.info(`✅ Planner block created: ${block._id}`);

    return res.status(201).json({
      success: true,
      message: 'Planner block created successfully',
      data: block,
    });
  } catch (error) {
    logger.error('❌ Error creating planner block:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to create planner block',
    });
  }
};

const getPlannerBlocks = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate, type, status } = req.query;

    const query = { userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (type) query.type = type;
    if (status) query.status = status;

    const blocks = await PlannerBlock.find(query)
      .sort({ date: 1, startTime: 1 })
      .lean();

    return res.json({
      success: true,
      message: 'Planner blocks retrieved successfully',
      data: { blocks },
    });
  } catch (error) {
    logger.error('❌ Error getting planner blocks:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to get planner blocks',
    });
  }
};

const getBlockById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const block = await PlannerBlock.findOne({ _id: id, userId });
    if (!block) {
      return res.status(404).json({
        success: false,
        error: 'NotFoundError',
        message: 'Planner block not found',
      });
    }

    return res.json({
      success: true,
      data: block,
    });
  } catch (error) {
    logger.error('❌ Error getting planner block:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to get planner block',
    });
  }
};

const updatePlannerBlock = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const updates = req.body;

    const block = await PlannerBlock.findOne({ _id: id, userId });
    if (!block) {
      return res.status(404).json({
        success: false,
        error: 'NotFoundError',
        message: 'Planner block not found',
      });
    }

    // Update allowed fields
    if (updates.title) block.title = updates.title;
    if (updates.description !== undefined) block.description = updates.description;
    if (updates.date) block.date = new Date(updates.date);
    if (updates.startTime) block.startTime = updates.startTime;
    if (updates.endTime) block.endTime = updates.endTime;
    if (updates.duration) block.duration = updates.duration;
    if (updates.type) block.type = updates.type;
    if (updates.priority) block.priority = updates.priority;
    if (updates.status) block.status = updates.status;
    if (updates.tags) block.tags = updates.tags;
    if (updates.color) block.color = updates.color;
    if (updates.notes !== undefined) block.notes = updates.notes;

    await block.save();

    return res.json({
      success: true,
      message: 'Planner block updated successfully',
      data: block,
    });
  } catch (error) {
    logger.error('❌ Error updating planner block:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to update planner block',
    });
  }
};

const deletePlannerBlock = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const block = await PlannerBlock.findOneAndDelete({ _id: id, userId });
    if (!block) {
      return res.status(404).json({
        success: false,
        error: 'NotFoundError',
        message: 'Planner block not found',
      });
    }

    logger.info(`✅ Planner block deleted: ${id}`);

    return res.json({
      success: true,
      message: 'Planner block deleted successfully',
    });
  } catch (error) {
    logger.error('❌ Error deleting planner block:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: error.message || 'Failed to delete planner block',
    });
  }
};

module.exports = {
  createPlannerBlock,
  getPlannerBlocks,
  getBlockById,
  updatePlannerBlock,
  deletePlannerBlock,
};
