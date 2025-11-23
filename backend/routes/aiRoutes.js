const express = require('express');
const router = express.Router();
const { sendAIMessage, analyzeFlowRealtime, analyzeStamina, detectDistractions } = require('../controllers/aiController');
const { jwtAuth } = require('../middleware/jwtAuth');

// Public endpoints
router.post('/message', sendAIMessage);

// Real-time ML analysis endpoints (requires auth)
// router.post('/analyze-flow', jwtAuth, analyzeFlowRealtime);
// router.post('/analyze-stamina', jwtAuth, analyzeStamina);
// router.post('/detect-distractions', jwtAuth, detectDistractions);

module.exports = router;
