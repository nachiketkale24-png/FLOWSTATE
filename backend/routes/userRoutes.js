const express = require('express');
const router = express.Router();
const {
  getUserSessionsList,
  getUserStatistics,
} = require('../controllers/userController');

router.get('/sessions', getUserSessionsList);
router.get('/stats', getUserStatistics);

module.exports = router;
