/**
 * Analysis Controller - CommonJS Version
 */

const { generateInsights } = require('../ai/insightsGenerator');
const logger = require('../utils/logger');

const analyzeFlowMetrics = async (req, res) => {
  try {
    const metrics = req.body;

    // Simple flow analysis based on metrics
    const flowScore = metrics.flowScore || 0;
    let flowState = 'IDLE';

    if (flowScore >= 80) {
      flowState = 'DEEP_FLOW';
    } else if (flowScore >= 60) {
      flowState = 'FLOW';
    } else if (flowScore >= 40) {
      flowState = 'WARMING_UP';
    }

    return res.json({
      success: true,
      data: {
        flowState,
        flowScore,
        analysis: `Current flow state: ${flowState}`,
      },
    });
  } catch (error) {
    logger.error('❌ Flow analysis error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze flow metrics',
      message: error.message,
    });
  }
};

const generateSessionInsights = async (req, res) => {
  try {
    const sessionData = req.body;

    const insights = await generateInsights(sessionData);

    return res.json({
      success: true,
      data: {
        insights,
        generated: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('❌ Insights generation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate insights',
      message: error.message,
    });
  }
};

module.exports = {
  analyzeFlowMetrics,
  generateSessionInsights,
};
