const express = require('express');
const router = express.Router();

const { recordEngagement } = require('../controllers/engagementController');

router.post('/record', recordEngagement);

module.exports = router;