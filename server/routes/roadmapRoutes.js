const express = require('express');
const router = express.Router();

const roadmapController = require('../controllers/roadmapController');
const authenticateUser = require('../middlewares/auth');

router.post('/generate', authenticateUser, roadmapController.generateRoadmap);
router.get('/get', authenticateUser, roadmapController.getRoadmaps);
router.post('/update-checkpoint-status', authenticateUser, roadmapController.updateCheckpointStatus);
router.get('/leaderboard/:roadmapId', authenticateUser, roadmapController.getLeaderboard);

router.post('/feedback', authenticateUser, roadmapController.submitFeedback);
router.get('/feedback/checkpoint/:checkpointId', authenticateUser, roadmapController.getCheckpointFeedback);
router.get('/feedback/user/checkpoint/:checkpointId', authenticateUser, roadmapController.getUserFeedback);

router.get('/leaderboard-insights/:roadmapId', authenticateUser, roadmapController.getLeaderboardInsights);
module.exports = router;