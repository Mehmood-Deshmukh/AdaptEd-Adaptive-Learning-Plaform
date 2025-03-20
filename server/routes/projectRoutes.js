const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController');

router.get('/', projectController.getProjectsOverview);
router.get('/projects-markdown/:title', projectController.getProjectMarkdown);

module.exports = router;