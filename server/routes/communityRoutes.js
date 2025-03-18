const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth');

const {
    createCommunity,
    getCommunity,
} = require('../controllers/communityController');

router.post('/create', createCommunity);
router.get('/:id', getCommunity);