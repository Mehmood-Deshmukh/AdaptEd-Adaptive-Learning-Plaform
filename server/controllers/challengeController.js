const Challenge = require('../models/challengeModel');

const createChallenge = async (req, res) => {
    try {
        const { topic } = req.body;
        console.log(topic);
        const challenge = await Challenge.createChallenge(topic);

        if (!challenge) {
            return res.status(400).json({ message: 'Challenge creation failed' });
        }

        res.status(201).json({ message: 'Challenge created successfully', challenge });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getChallenges = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const challenges = await Challenge.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalChallenges = await Challenge.countDocuments();
        const totalPages = Math.ceil(totalChallenges / limit);

        res.status(200).json({
            challenges,
            totalChallenges,
            totalPages,
            currentPage: page,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const submitCode = async (req, res) => {
    try {
        const { code, challengeId, language } = req.body;
        const result = await Challenge.getOutput(code, challengeId, language);

        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        const expectedResult = await Challenge.getOutput(challenge.idealSolution, challengeId, language);
        if (result.stdout.trim() == expectedResult.stdout.trim()) {
            challenge.review = 'Accepted';
        } else {
            challenge.review = 'Rejected';
        }

        res.status(200).json({
            message: 'Code submitted successfully',
            result,
            expectedOutput: expectedResult.stdout,
            review: challenge.review,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getChallenges,
    createChallenge,
    submitCode,
}