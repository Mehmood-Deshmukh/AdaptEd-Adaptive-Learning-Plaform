const mongoose = require('mongoose');
const Quiz = require('./quizModel');
const User = require('./userModel');
const Schema = mongoose.Schema;

const quizAttemptSchema = new Schema({
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [{
        question: {
            type: Schema.Types.ObjectId,
            ref: 'Question'
        },
        answer: {
            type: String
        }
    }],
    score: {
        type: Number,
    },
    dateAttempted: {
        type: Date,
        default: Date.now
    }
});
quizAttemptSchema.statics.createAttempt = async function (quizId, userId, answers) {
    /*
        quizid : id of the quiz
        userId : id of the user
        answers : array of answers submitted by the user
        ex. answers = ['A', 'B', 'C', 'D', ...]
    */

    const quiz = await Quiz.findOne({ _id: quizId }).populate('questions');
    const user = await User.findOne({ _id: userId });

    if (!quiz || !user) {
        throw new Error('Invalid quiz or user');
    }

    console.log(answers, quiz.questions.length);

    if (answers.length !== quiz.questions.length) {
        throw new Error('Invalid number of answers');
    }

    const correctAnswers = quiz.questions.map(question => question.correctOption);

    let answersObj = [];
    const score = answers.reduce((acc, answer, index) => {
        answersObj.push({
            question: quiz.questions[index]._id,
            answer
        });
        return answer === correctAnswers[index] ? acc + 1 : acc;
    }, 0);

    const attempt = new this({
        quiz: quizId,
        user: userId,
        answers: answersObj,
        score
    });

    await attempt.save();


    let avg_quiz_score = user.avg_score ? (user.avg_score * user.quizzes.length + score) / (user.quizzes.length + 1) : 0;
    User.updateOne({ _id: userId }, { $set: { avg_score: avg_quiz_score } });

    user.quizzes.push(quizId);
    await user.save();

    quiz.attempts.push(attempt._id);
    await quiz.save();

    await attempt.populate('answers.question');
    return attempt;
}
module.exports = mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", quizAttemptSchema);