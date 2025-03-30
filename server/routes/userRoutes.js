const express = require('express');
const userController = require('../controllers/userController');
const authenticateUser = require("../middlewares/auth")
const router = express.Router();

router.post('/update-learning-parameters', authenticateUser, userController.updateLearningParameters);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.get('/check-auth', userController.checkAuth);
router.post('/join-community', authenticateUser, userController.joinCommunity);
router.post('/leave-community', authenticateUser, userController.leaveCommunity);
router.get('/get-recommendations',  authenticateUser, userController.getRecommendations);
router.post('/follow', authenticateUser, userController.followUser);
router.post('/unfollow', authenticateUser, userController.unfollowUser);
router.get('/update-guide-status', authenticateUser, userController.updateIsGuideComplete);

module.exports = router;