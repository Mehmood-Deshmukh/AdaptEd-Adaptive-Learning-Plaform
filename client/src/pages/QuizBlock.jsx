import { useState, useEffect } from "react";

const QuizBlock = ({ questions, quizId }) => {
  const questionsArray = Array.isArray(questions) ? questions : Object.values(questions);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setUserId(decodedToken.userId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleOptionChange = (optIndex) => {
    setSelectedOptionIndex(optIndex);
  };

  const handleNext = () => {
    if (selectedOptionIndex !== null) {
      const answerLetter = String.fromCharCode(65 + selectedOptionIndex);
      
      // Update the answers array
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = answerLetter;
      setAnswers(updatedAnswers);

      if (currentQuestionIndex < questionsArray.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setSelectedOptionIndex(null);
      } else {
        // Fix: Only submit when we've answered the last question
        handleSubmit(updatedAnswers);
      }
    }
  };

  const handleSubmit = async (finalAnswers) => {
    if (!userId) {
      console.error("User ID not available");
      return;
    }

    // Use the finalAnswers parameter if provided, otherwise use state
    const answersToSubmit = finalAnswers || answers;
    
    // Ensure we have an answer for each question
    if (answersToSubmit.length !== questionsArray.length) {
      console.error("Answer count mismatch:", answersToSubmit.length, "vs", questionsArray.length);
      return;
    }

    setLoading(true);
    setIsSubmitted(true);
    
    try {
      console.log("Submitting:", quizId, answersToSubmit);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ 
          quizId, 
          answers: answersToSubmit 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      const data = await response.json();
      setScore(data.attempt.score);
      setQuizResults(data.attempt);
      console.log(data);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = () => {
    setReviewMode(true);
    setReviewQuestionIndex(0);
  };

  const handleNextReview = () => {
    if (reviewQuestionIndex < quizResults.answers.length - 1) {
      setReviewQuestionIndex(reviewQuestionIndex + 1);
    }
  };

  const handlePrevReview = () => {
    if (reviewQuestionIndex > 0) {
      setReviewQuestionIndex(reviewQuestionIndex - 1);
    }
  };

  const handleRetakeQuiz = () => {
    window.location.reload();
  };

  const currentQuestion = questionsArray[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionsArray.length) * 100;

  const QuizReview = () => {
    if (!quizResults || !quizResults.answers || quizResults.answers.length === 0) {
      return <div>No review data available</div>;
    }

    const currentReview = quizResults.answers[reviewQuestionIndex];
    const reviewProgress = ((reviewQuestionIndex + 1) / quizResults.answers.length) * 100;
    
    // Get the index of the user's answer (e.g. 'A' -> 0, 'B' -> 1)
    const userAnswerIndex = currentReview.answer.charCodeAt(0) - 65;
    
    // Get the index of the correct answer
    const correctAnswerIndex = currentReview.question.correctOption.charCodeAt(0) - 65;

    return (
      <div className="p-8">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Question {reviewQuestionIndex + 1} of {quizResults.answers.length}</span>
            <span>{Math.round(reviewProgress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-black h-1.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${reviewProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="min-h-[120px] mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentReview.question.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-8 min-h-[300px]">
          {currentReview.question.options.map((option, optIndex) => {
            let optionStyle = "border-gray-200";
            let optionBg = "bg-white";
            let circleBg = "bg-gray-100 text-gray-500 border border-gray-300";
            
            // Highlight correct answer
            if (optIndex === correctAnswerIndex) {
              optionStyle = "border-green-500";
              optionBg = "bg-green-50";
              circleBg = "bg-green-500 text-white";
            }
            
            // Show user's incorrect answer
            if (optIndex === userAnswerIndex && userAnswerIndex !== correctAnswerIndex) {
              optionStyle = "border-red-500";
              optionBg = "bg-red-50";
              circleBg = "bg-red-500 text-white";
            }
            
            return (
              <div
                key={optIndex}
                className={`p-4 rounded-lg border ${optionStyle} ${optionBg}`}
              >
                <div className="flex items-center">
                  <div 
                    className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${circleBg}`}
                  >
                    {String.fromCharCode(65 + optIndex)}
                  </div>
                  <span className="text-gray-800 text-lg">{option}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-2">Explanation:</h3>
          <p className="text-gray-600">{currentReview.question.explanation}</p>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevReview}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              reviewQuestionIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            disabled={reviewQuestionIndex === 0}
          >
            Previous
          </button>
          
          <button
            onClick={handleRetakeQuiz}
            className="px-6 py-3 rounded-lg font-medium bg-black text-white hover:bg-gray-800 transition-colors duration-200"
          >
            Take New Quiz
          </button>
          
          <button
            onClick={handleNextReview}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              reviewQuestionIndex === quizResults.answers.length - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            disabled={reviewQuestionIndex === quizResults.answers.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-10 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
        {!isSubmitted ? (
          <div className="p-8">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Question {currentQuestionIndex + 1} of {questionsArray.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-black h-1.5 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="min-h-[120px] mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-4 mb-8 min-h-[300px]">
              {currentQuestion.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  onClick={() => handleOptionChange(optIndex)}
                  className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                    selectedOptionIndex === optIndex
                      ? "border-black bg-gray-100"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center">
                    <div 
                      className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                        selectedOptionIndex === optIndex
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-500 border border-gray-300"
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}
                    </div>
                    <span className="text-gray-800 text-lg">{option}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              className={`w-full py-3 rounded-lg font-medium text-lg transition-colors duration-200 ${
                selectedOptionIndex === null
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              disabled={selectedOptionIndex === null}
            >
              {currentQuestionIndex < questionsArray.length - 1 ? "Next Question" : "Submit Quiz"}
            </button>
          </div>
        ) : (
          <div>
            {loading ? (
              <div className="p-10 text-center py-12">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Processing your submission...</p>
              </div>
            ) : reviewMode ? (
              <QuizReview />
            ) : (
              <div className="p-10 text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed</h2>
                <p className="text-gray-600 mb-6">Thank you for completing the quiz</p>
                
                {score !== null && (
                  <div className="mt-6 mb-6 border-t border-gray-200 pt-6">
                    <div className="inline-block px-6 py-3 bg-gray-100 rounded-lg">
                      <p className="text-gray-500 text-sm uppercase tracking-wide">Your Score</p>
                      <p className="text-4xl font-bold text-black">{score} / {questionsArray.length}</p>
                      <p className="text-gray-500 mt-1">
                        {Math.round((score / questionsArray.length) * 100)}%
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleStartReview}
                    className="px-6 py-3 rounded-lg font-medium bg-black text-white hover:bg-gray-800 transition-colors duration-200"
                  >
                    Review Answers
                  </button>
                  
                  <button
                    onClick={handleRetakeQuiz}
                    className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                  >
                    Take New Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizBlock;