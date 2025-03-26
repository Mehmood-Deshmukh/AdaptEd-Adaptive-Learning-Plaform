const Quiz = require("../models/quizModel");
const QuizAttempt = require("../models/quizAttemptModel");
const User = require("../models/userModel");
const { xpEmitter } = require("../services/xpService");
const { achievementEmitter } = require("../services/achievementService");

const generateQuiz = async (req, res) => {
	try {
		const { title, topic, domain, difficulty, tags } = req.body;
		console.log(title, topic, domain, difficulty, tags);
		const _quiz = await Quiz.generateQuiz(
			title,
			topic,
			domain,
			difficulty,
			tags
		);
		const quiz = await Quiz.getQuiz(_quiz._id);

		res.status(200).json({ quiz });
	} catch (e) {
		res.status(500).json({
			success: false,
			message: e.message,
		});
	}
};

const getQuizResults = async (req, res) => {
	try {
		const userId = req.params.userId;
		const user = await User.findOne({ _id: userId });
		if (!user) {
			throw new Error("User not found");
		}

		const results = [];
		for (let quiz of user.quizzes) {
			const attempts = await QuizAttempt.find({
				user: userId,
				quiz: quiz,
			});
			results.push(attempts);
		}

		console.log(results);

		res.status(200).json({ quizResults: results });
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

// this function should be used when you want to submit a quiz attempt and get results
const submitQuiz = async (req, res) => {
	try {
		const { quizId, answers } = req.body;
		const attempt = await QuizAttempt.createAttempt(
			quizId,
			req.userId,
			answers
		);

		const percentageScore = (attempt.score / attempt.answers.length) * 100;
		const userId = req.userId;

		achievementEmitter.emit("quiz-completed", {
			userId,
			score: percentageScore,
		});

		xpEmitter.emit("quiz-completed", {
			userId,
			score: attempt.score,
			totalQuestions: answers.length,
		});

		res.status(200).json({ attempt });
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

const getUserQuizzes = async (req, res) => {
	try {
		/*
        const user = await User.findOne({ _id: req.params.userId }).populate({
			path: "quizzes",
			match: {},
			options: { sort: { dateCreated: -1 }, limit: 3 },
			populate: {
				path: "attempts",
				populate: {
					path: "answers.question",
					select: "question correctOption explanation options",
				},
			},
		});
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        res.status(200).json({
			quizzes: user.quizzes,
			totalQuizzes: user.quizzes.length,
		});
        */
		const user = await User.findOne({ _id: req.params.userId });
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 3;
		const skip = (page - 1) * limit;

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// new quiz ids will be pushed to the end of the array
		// so we need to slice the array from the end
        const quizIds = user.quizzes.reverse().slice(skip, skip + limit);
        console.log(quizIds.length);

		if (quizIds.length === 0) {
			return res.status(200).json({
				quizzes: [],
				totalQuizzes: 0,
			});
		}

		const quizzes = await Quiz.find({ _id: { $in: quizIds } })
            .populate({
				path: "attempts",
				populate: {
					path: "answers.question",
					select: "question correctOption explanation options",
				},
			})
            .sort({ dateCreated: -1 })
            .limit(limit)
            ;

		return res.status(200).json({
			quizzes,
			totalQuizzes: quizzes.length,
		});
	} catch (error) {
		console.error("Error fetching user quizzes:", error);
		res.status(500).json({
			message: "Internal server error",
			error: error.message,
		});
	}
};

module.exports = {
	generateQuiz,
	submitQuiz,
	getQuizResults,
	getUserQuizzes,
};
