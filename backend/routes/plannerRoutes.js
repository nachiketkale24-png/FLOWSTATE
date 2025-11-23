const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');

router.post('/blocks', plannerController.createPlannerBlock);
router.get('/blocks', plannerController.getPlannerBlocks);
router.get('/blocks/:id', plannerController.getBlockById);
router.put('/blocks/:id', plannerController.updatePlannerBlock);
router.delete('/blocks/:id', plannerController.deletePlannerBlock);

module.exports = router;
