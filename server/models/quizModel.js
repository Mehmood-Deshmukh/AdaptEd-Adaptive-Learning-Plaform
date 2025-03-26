const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const Question = require("./questionModel");

dotenv.config();

const quizSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  questions: [
    {
      type: Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  tags: {
    type: [String],
    default: [],
  },
  topic: {
    type: String,
    trim: true,
  },
  difficulty: {
    type: String,
    required: [true, "Difficulty is required"],
  },
  domain: {
    type: String,
  },
  attempts: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "QuizAttempt",
      },
    ],
    default: [],
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  dateModified: {
    type: Date,
    default: Date.now,
  },
});

// This function should be used when you want to send quiz to the frontend (user)
quizSchema.statics.getQuiz = async function (quizId) {
  return await this.findById(quizId).populate({
    path: "questions",
    select: "-correctOption -explanation",
  });
};

quizSchema.statics.generateQuiz = async function (
  title,
  topic,
  domain,
  difficulty,
  tags
) {

  const result = await axios.post(`${process.env.FLASK_BASE_URL}/api/generate-quiz`, {
    title: title,
    domain: domain,
    topic: topic,
    difficulty: difficulty,
    tags: tags,
  }
  )
  console.log(result.data);
  const questions = result.data.questions;
  console.log(questions);

  let questionIds = [];
  await Promise.all(
    questions.map(async (question) => {
      const newQuestion = new Question({
        question: question.question,
        options: question.options,
        correctOption: question.correctOption,
        explanation: question.explanation,
        domain: domain,
        tags: tags,
      });

      await newQuestion.save();
      console.log(newQuestion._id);
      questionIds.push(newQuestion._id);
    })
  );

  const newQuiz = new this({
    title: `Quiz on ${title}`,
    questions: questionIds,
    tags: tags,
    difficulty: difficulty,
    domain: domain,
    topic: topic,
  });

  await newQuiz.save();
  return newQuiz;
};

module.exports = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
