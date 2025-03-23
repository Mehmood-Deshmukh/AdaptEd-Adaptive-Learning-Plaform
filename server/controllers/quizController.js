const Quiz = require('../models/quizModel');
const QuizAttempt = require('../models/quizAttemptModel');
const User = require('../models/userModel');
const { xpEmitter } = require('../services/xpService');
const { achievementEmitter } = require('../services/achievementService');

const generateQuiz = async (req, res) => {
    try {
        const { title, topic, domain, difficulty, tags } = req.body;
        console.log(title, topic, domain, difficulty, tags);
        const _quiz = await Quiz.generateQuiz(title, topic, domain, difficulty, tags);
        console.log(_quiz);
        const quiz = await Quiz.getQuiz(_quiz._id);

        res.status(200).json({ quiz });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
}

const getQuizResults = async (req, res) => {  
    try {
        const userId = req.params.userId;
        const user = await User.findOne({ _id: userId });
        if (!user) {
            throw new Error('User not found');
        }

        const results = [];
        for (let quiz of user.quizzes) {
            
            const attempts = await QuizAttempt.find({ user: userId, quiz: quiz });
            results.push(attempts);
        }

        console.log(results);

        res.status(200).json({ quizResults: results });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }  
}

// this function should be used when you want to submit a quiz attempt and get results
const submitQuiz = async (req, res) => {
    try {
        const {quizId, answers } = req.body;
        const attempt = await QuizAttempt.createAttempt(quizId, req.userId , answers);

        const percentageScore = (attempt.score / attempt.answers.length) * 100;
        const userId = req.userId;

        
        achievementEmitter.emit('quiz-completed', { 
            userId, 
            score: percentageScore
        });

        xpEmitter.emit('quiz-completed', {
            userId,
            score: attempt.score,
            totalQuestions: answers.length
          });



        res.status(200).json({ attempt });
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
}

const getUserQuizzes = async (req, res) => {
    try {
    const user = await User.findOne({ _id: req.params.userId })
    .populate({
        path: 'quizzes',
        populate: {
            path: 'attempts',
            model: 'QuizAttempt'
        }
    });


        if (!user) {
            throw new Error('User not found');
        }

        res.status(200).json({ quizzes : user.quizzes });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = {
    generateQuiz,
    submitQuiz,
    getQuizResults,
    getUserQuizzes
}