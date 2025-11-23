const express = require('express');
const router = express.Router();
const {
  getAllAchievements,
  getUserAchievements,
  unlockAchievement,
} = require('../controllers/achievementsController');

router.get('/', getAllAchievements);
router.get('/user', getUserAchievements);
router.post('/unlock', unlockAchievement);

module.exports = router;
