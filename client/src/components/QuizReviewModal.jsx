import { useState } from "react";

const QuizReviewModal = ({ quiz, isOpen, onClose }) => {
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);

  if (!isOpen || !quiz) return null;

  const handleNextReview = () => {
    if (reviewQuestionIndex < quiz.answers.length - 1) {
      setReviewQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevReview = () => {
    if (reviewQuestionIndex > 0) {
      setReviewQuestionIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {quiz.quizTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Question {reviewQuestionIndex + 1} of{" "}
              {quiz.answers.length}
            </span>
            <span>
              {Math.round(
                ((reviewQuestionIndex + 1) /
                  quiz.answers.length) *
                  100
              )}
              % Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{
                width: `${
                  ((reviewQuestionIndex + 1) /
                    quiz.answers.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4 text-gray-900">
          {quiz.answers[reviewQuestionIndex]?.question
            ?.question || "No question available"}
        </h3>

        <div className="space-y-4 mb-6">
          {quiz.answers[
            reviewQuestionIndex
          ]?.question?.options?.map((option, optIndex) => {
            const userAnswerIndex =
              (quiz.answers[
                reviewQuestionIndex
              ]?.answer?.charCodeAt(0) ?? 65) - 65;
            const correctAnswerIndex =
              (quiz.answers[
                reviewQuestionIndex
              ]?.question?.correctOption?.charCodeAt(0) ??
                65) - 65;

            let optionStyle = "border-gray-200";
            let optionBg = "bg-white";
            let circleBg =
              "bg-gray-100 text-gray-600 border border-gray-300";

            if (optIndex === correctAnswerIndex) {
              optionStyle = "border-green-500";
              optionBg = "bg-green-50";
              circleBg = "bg-green-500 text-white";
            }

            if (
              optIndex === userAnswerIndex &&
              userAnswerIndex !== correctAnswerIndex
            ) {
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
                    className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${circleBg} font-medium`}
                  >
                    {String.fromCharCode(
                      65 + optIndex
                    )}
                  </div>
                  <span className="text-gray-800 text-lg">
                    {option}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-2">
            Explanation:
          </h3>
          <p className="text-gray-700">
            {quiz.answers[reviewQuestionIndex]
              ?.question?.explanation ||
              "No explanation available"}
          </p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrevReview}
            className={`px-6 py-3 rounded-lg flex items-center ${
              reviewQuestionIndex === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            disabled={reviewQuestionIndex === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Previous
          </button>

          <button
            onClick={handleNextReview}
            className={`px-6 py-3 rounded-lg flex items-center ${
              reviewQuestionIndex ===
              quiz.answers.length - 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            disabled={
              reviewQuestionIndex ===
              quiz.answers.length - 1
            }
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizReviewModal;