const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.get('/global-summary', feedbackController.getAllFeedbackSummary);


module.exports = router;