const express = require('express');
const router = express.Router();

const {
    fetchPublicProfile,
    fetchPublicProfileRoadmaps,
    fetchPublicPosts,
} = require('../controllers/publicProfileController');
const { getUserQuizzes } = require('../controllers/quizController');

router.get('/:userId', fetchPublicProfile);
router.get('/:userId/roadmaps', fetchPublicProfileRoadmaps);
router.get('/:userId/posts', fetchPublicPosts);
router.get('/:userId/quizzes', getUserQuizzes);

module.exports = router;