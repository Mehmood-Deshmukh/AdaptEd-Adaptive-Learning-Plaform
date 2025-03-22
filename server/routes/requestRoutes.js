const router = require('express').Router();
const { postRequest, getAllRequest, giveFeedback, getFeedback } = require('../controllers/requestController');
const authenticateUser = require('../middlewares/auth');

router.post('/submit-request/:userId',authenticateUser, postRequest);
router.get('/get-request',authenticateUser, getAllRequest);
router.post('/give-feedback/:userId',authenticateUser, giveFeedback);
router.get('/get-feedback/:userId', authenticateUser, getFeedback);

module.exports = router;