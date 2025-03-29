const express = require('express');
const router = express.Router();

const {
    getChallenges,
    createChallenge,    
    submitCode
} = require('../controllers/challengeController');

router.get("/", getChallenges);
router.post("/create", createChallenge);
router.post('/submit', submitCode);

module.exports = router;