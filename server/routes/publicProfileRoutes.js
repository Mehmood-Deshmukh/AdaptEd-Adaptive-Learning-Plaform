const express = require('express');
const router = express.Router();

const {
    fetchPublicProfile,
    fetchPublicProfileRoadmaps,
    fetchPublicPosts,
    searchUsers
} = require('../controllers/publicProfileController');
const { getUserQuizzes } = require('../controllers/quizController');

router.get('/:userId', fetchPublicProfile);
router.get('/:userId/roadmaps', fetchPublicProfileRoadmaps);
router.get('/:userId/posts', fetchPublicPosts);
router.get('/:userId/quizzes', getUserQuizzes);
router.get('/search', searchUsers);

module.exports = router;