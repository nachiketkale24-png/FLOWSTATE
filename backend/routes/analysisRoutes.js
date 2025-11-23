const express = require('express');
const router = express.Router();
const {
  analyzeFlowMetrics,
  generateSessionInsights,
} = require('../controllers/analysisController');

router.post('/flow', analyzeFlowMetrics);
router.post('/insights', generateSessionInsights);

module.exports = router;
