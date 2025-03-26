import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import QuizReviewModal from "../components/QuizReviewModal";

const RecentQuiz = () => {
	const [quizResults, setQuizResults] = useState([]);
	const [selectedQuiz, setSelectedQuiz] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { state } = useAuthContext();
	const { user } = state;

	useEffect(() => {
		const fetchRecentQuizzes = async () => {
			try {
				const res = await fetch(
					`${import.meta.env.VITE_BACKEND_URL}/api/quiz/user-quiz/${
						user._id
					}?page=1&limit=3`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${localStorage.getItem(
								"token"
							)}`,
						},
					}
				);

				const data = await res.json();

				const allAttempts = data.quizzes.flatMap((quiz) =>
					quiz.attempts.map((attempt) => ({
						...attempt,
						quizTitle: quiz.title || "Untitled Quiz",
						tags: quiz.tags || [],
					}))
				);
				
				const limitedAttempts = allAttempts.slice(0, 3);
				
				setQuizResults(limitedAttempts);
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
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedQuiz(null);
	};

	if (!quizResults || quizResults.length === 0) {
		return <div>No quiz results available</div>;
	}

	return (
		<div className="bg-white rounded-lg shadow p-6 mb-6">
			<h1 className="text-2xl font-bold mb-6 text-gray-900">Recent Quizzes</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{quizResults.map((quiz, index) => (
					<div
						key={index}
						onClick={() => openModal(quiz)}
						className="p-5 bg-white border border-gray-200 rounded-lg shadow-md cursor-pointer hover:border-black transition-all duration-200 hover:shadow-lg flex flex-col justify-between min-h-[200px]"
					>
						<div>
							<h2 className="text-xl font-bold mb-2 text-gray-900">{quiz.quizTitle}</h2>
							<p className="text-gray-700 mb-3">
								Score: <span className="font-semibold">{quiz.score}</span> / {quiz.answers.length}
							</p>
						</div>

						<div>
							{quiz.tags && quiz.tags.length > 0 && (
								<div className="flex flex-wrap mt-2">
									{quiz.tags.slice(0, 4).map((tag, tagIndex) => (
										<span
											key={tagIndex}
											className="px-2 py-1 mr-1 mb-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-full text-xs font-medium"
										>
											{tag}
										</span>
									))}
									{quiz.tags.length > 4 && (
										<span className="px-2 py-1 mb-1 text-gray-500 text-xs font-medium">
											+{quiz.tags.length - 4} more
										</span>
									)}
								</div>
							)}
						</div>
					</div>
				))}
			</div>

			<div className="flex justify-center mt-8">
				<Link 
					to="/quizzes"
					className="flex items-center px-6 py-3 border border-gray-300 rounded-md bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm font-medium"
				>
					View All Quizzes 
					<svg 
						xmlns="http://www.w3.org/2000/svg" 
						className="h-5 w-5 ml-2" 
						fill="none" 
						viewBox="0 0 24 24" 
						stroke="currentColor"
					>
						<path 
							strokeLinecap="round" 
							strokeLinejoin="round" 
							strokeWidth={2} 
							d="M14 5l7 7m0 0l-7 7m7-7H3" 
						/>
					</svg>
				</Link>
			</div>

			<QuizReviewModal 
				quiz={selectedQuiz} 
				isOpen={isModalOpen} 
				onClose={closeModal} 
			/>
		</div>
	);
};

export default RecentQuiz;