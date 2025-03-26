import { useEffect, useState } from "react";
import useAuthContext from "../hooks/useAuthContext";

const RecentQuiz = () => {
    const [quizResults, setQuizResults] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { state } = useAuthContext();
    const { user } = state;

    useEffect(() => {
        const fetchRecentQuizzes = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/quiz/user-quiz/${user._id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    }
                });

                const data = await res.json();
                const allAttempts = data.quizzes.flatMap(quiz =>
                    quiz.attempts.map(attempt => ({
                        ...attempt,
                        quizTitle: quiz.title || 'Untitled Quiz',
                        tags: quiz.tags || []
                    }))
                );

                setQuizResults(allAttempts);
            } catch (error) {
                console.log(error);
            }
        };

        if (user) {
            fetchRecentQuizzes();
        }
    }, [user]);

    const openModal = (quiz) => {
        setSelectedQuiz(quiz);
        setReviewQuestionIndex(0);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedQuiz(null);
    };

    const handleNextReview = () => {
        if (reviewQuestionIndex < selectedQuiz.answers.length - 1) {
            setReviewQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevReview = () => {
        if (reviewQuestionIndex > 0) {
            setReviewQuestionIndex(prev => prev - 1);
        }
    };

    if (!quizResults || quizResults.length === 0) {
        return <div>No quiz results available</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-2xl font-bold mb-4">Recent Quizzes</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizResults.map((quiz, index) => (
                    <div
                        key={index}
                        onClick={() => openModal(quiz)}
                        className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg cursor-pointer hover:border-gray-400 transition"
                    >
                        <h2 className="text-lg font-bold">{quiz.quizTitle}</h2>
                        <p className="text-gray-600">Score: {quiz.score} / {quiz.answers.length}</p>

                        <div className="mt-2">
                            <span className="font-bold text-gray-700">Tags:</span>
                            <div className="flex flex-wrap mt-1">
                                {quiz.tags.length > 0 ? (
                                    quiz.tags.map((tag, tagIndex) => (
                                        <span
                                            key={tagIndex}
                                            className="px-2 py-1 mr-2 mb-2 bg-gray-300 text-black rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500">No tags</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && selectedQuiz && (
                <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">{selectedQuiz.quizTitle}</h2>
                            <button onClick={closeModal} className="text-gray-600 hover:text-gray-800">✕</button>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between text-sm text-gray-500 mb-2">
                                <span>Question {reviewQuestionIndex + 1} of {selectedQuiz.answers.length}</span>
                                <span>{Math.round(((reviewQuestionIndex + 1) / selectedQuiz.answers.length) * 100)}% Complete</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                    className="bg-black h-1.5 rounded-full transition-all duration-300 ease-in-out"
                                    style={{ width: `${((reviewQuestionIndex + 1) / selectedQuiz.answers.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Question */}
                        <h3 className="text-xl font-bold mb-4">
                            {selectedQuiz.answers[reviewQuestionIndex]?.question?.question || "No question available"}
                        </h3>

                        {/* Options */}
                        <div className="space-y-4 mb-6">
                            {selectedQuiz.answers[reviewQuestionIndex]?.question?.options?.map((option, optIndex) => {
                                const userAnswerIndex = (selectedQuiz.answers[reviewQuestionIndex]?.answer?.charCodeAt(0) ?? 65) - 65;
                                const correctAnswerIndex = (selectedQuiz.answers[reviewQuestionIndex]?.correctOption?.charCodeAt(0) ?? 65) - 65;

                                let optionStyle = "border-gray-200";
                                let optionBg = "bg-white";
                                let circleBg = "bg-gray-100 text-gray-500 border border-gray-300";

                                if (optIndex === correctAnswerIndex) {
                                    optionStyle = "border-green-500";
                                    optionBg = "bg-green-50";
                                    circleBg = "bg-green-500 text-white";
                                }

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
                                            <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${circleBg}`}>
                                                {String.fromCharCode(65 + optIndex)}
                                            </div>
                                            <span className="text-gray-800 text-lg">{option}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Explanation */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="font-bold text-gray-700 mb-2">Explanation:</h3>
                            <p className="text-gray-600">
                                {selectedQuiz.answers[reviewQuestionIndex]?.question?.explanation || "No explanation available"}
                            </p>
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex justify-between">
                            <button
                                onClick={handlePrevReview}
                                className={`px-6 py-3 rounded-lg ${reviewQuestionIndex === 0 ? "bg-gray-200 text-gray-400" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                                disabled={reviewQuestionIndex === 0}
                            >
                                Previous
                            </button>

                            <button
                                onClick={handleNextReview}
                                className={`px-6 py-3 rounded-lg ${reviewQuestionIndex === selectedQuiz.answers.length - 1 ? "bg-gray-200 text-gray-400" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                                disabled={reviewQuestionIndex === selectedQuiz.answers.length - 1}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentQuiz;
