const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController');

router.get('/', projectController.getProjectsOverview);
router.get('/get-project/:title', projectController.getProject);

module.exports = router;