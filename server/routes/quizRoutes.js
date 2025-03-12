const { generateQuiz, submitQuiz, getQuizResults, getUserQuizzes } = require('../controllers/quizController');
const authenticateUser = require('../middlewares/auth');
const router = require('express').Router();

router.post('/generate', authenticateUser, generateQuiz);
router.post('/submit', authenticateUser, submitQuiz);
router.get('/quiz-results/:userId', authenticateUser, getQuizResults);
router.get('/user-quiz/:userId', authenticateUser, getUserQuizzes);

module.exports = router;