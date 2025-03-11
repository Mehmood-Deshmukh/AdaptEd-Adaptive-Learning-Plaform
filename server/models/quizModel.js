const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const Question = require("./questionModel");

dotenv.config();
const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  // i am not proud of this
  // difficulty is not used in the prompt, we may use it if we want
  const prompt = `purpose:
    Generate a set of 15 comprehensive multiple-choice questions on the specified topic - ${topic}. The questions should assess both subject knowledge and learning preferences to enable personalized learning experiences.
    Question Distribution:

    4 Beginner-level knowledge questions
    3 Intermediate-level knowledge questions
    2 Advanced-level knowledge questions
    6 Learning style/preference assessment questions (to facilitate collaborative filtering)

    Format Requirements:
    Each question must include:

    1. The question text
    2. 4 answer options (labeled A through D)
    3. The correct answer (letter only)
    4. A concise explanation (1-2 lines) justifying why the correct answer is accurate

    Output Format:
    Provide the output as a JSON array of objects with the following structure:
    [
        {
            "question": "What is the capital of France?",
            "options": ["A) Berlin", "B) Madrid", "C) Paris", "D) Rome"],
            "answer": "C",
            "explanation": "Paris is the capital and most populous city of France."
        },
        // Additional questions follow the same structure
    ]
    "answer" should be a single letter corresponding to the correct option (A, B, C, or D).

    Additional Guidelines:
    Ensure all knowledge questions are factually accurate
    Make learning style questions generalized enough to apply across various topics
    Include questions that help determine prior knowledge levels for better collaborative filtering
    Match question difficulty to the specified level (beginner, intermediate, or advanced)`;

  const result = await model.generateContent(prompt);
  console.log(result);

  const response = result.response;
  let text = response.text();
  text = text.replace("```json\n", "");
  text = text.replace("```", "");
  text = text.replace("```JSON", "");

  const questions = JSON.parse(text);
  console.log(questions);

  let questionIds = [];
  await Promise.all(
    questions.map(async (question) => {
      const newQuestion = new Question({
        question: question.question,
        options: question.options,
        correctOption: question.answer,
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
    title: `Quiz on ${domain}`,
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
