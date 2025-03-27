const express = require('express');
const router = express.Router();

const {
    fetchPublicProfile,
    fetchPublicProfileRoadmaps,
    fetchPublicPosts,
    search
} = require('../controllers/publicProfileController');
const { getUserQuizzes } = require('../controllers/quizController');

router.get('/search', search);
router.get('/user/:userId', fetchPublicProfile);
router.get('/roadmaps/:userId', fetchPublicProfileRoadmaps);
router.get('/posts/:userId', fetchPublicPosts);
router.get('/quizzes/:userId', getUserQuizzes);

module.exports = router;