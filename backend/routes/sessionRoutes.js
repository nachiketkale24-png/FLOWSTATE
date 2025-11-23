const express = require('express');
const router = express.Router();
const {
  startSession,
  updateSessionMetrics,
  endSessionWithSummary,
  getSessionById,
} = require('../controllers/sessionController');

router.post('/start', startSession);
router.post('/:id/update', updateSessionMetrics);
router.post('/:id/end', endSessionWithSummary);
router.get('/:id', getSessionById);

module.exports = router;
