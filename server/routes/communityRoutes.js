const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth');

const {
    createCommunity,
    getCommunity,
} = require('../controllers/communityController');

router.post('/create', authenticateUser, createCommunity);
router.get('/:id',authenticateUser, getCommunity);