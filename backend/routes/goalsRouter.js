const express = require('express');
const router = express.Router();
const {
  createGoal,
  getUserGoals,
  getGoalById,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
} = require('../controllers/goalsController');

router.post('/', createGoal);
router.get('/', getUserGoals);
router.get('/:id', getGoalById);
router.put('/:id', updateGoal);
router.post('/:id/progress', updateGoalProgress);
router.delete('/:id', deleteGoal);

module.exports = router;
