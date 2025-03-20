const express = require('express');
const router = express.Router();

const {downloadAttachments} = require('../controllers/attachmentController');

router.get('/:attachmentId', downloadAttachments);

module.exports = router;