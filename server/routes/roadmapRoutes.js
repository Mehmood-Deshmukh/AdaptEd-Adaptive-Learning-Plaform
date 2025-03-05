const express = require('express');
const router = express.Router();

const roadmapController = require('../controllers/roadmapController');
const authenticateUser = require('../middlewares/auth');

router.post('/generate', authenticateUser, roadmapController.generateRoadmap);
router.get('/get', authenticateUser, roadmapController.getRoadmaps);
router.post('/update-checkpoint-status', authenticateUser, roadmapController.updateCheckpointStatus);

module.exports = router;