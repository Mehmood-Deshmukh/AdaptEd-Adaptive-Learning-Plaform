const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');

const authenticateUser = require('../middlewares/auth');


router.get('/', authenticateUser, achievementController.getUserAchievements);

router.patch('/:achievementId/notify', authenticateUser,  achievementController.markAchievementAsNotified);

router.post('/check', authenticateUser,  achievementController.checkAllAchievements);

module.exports = router;