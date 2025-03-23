const express = require('express');
const router = express.Router();
const xpController = require('../controllers/xpController');
const authenticateUser = require('../middlewares/auth');


router.get('/history', authenticateUser, xpController.getXpHistory);

module.exports = router;