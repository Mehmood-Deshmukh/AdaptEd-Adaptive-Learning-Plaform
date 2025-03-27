import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import QuizReviewModal from "../components/QuizReviewModal";
import Sidebar from "../components/Sidebar";

const LIMIT=10;

const AllQuizzes = () => {
	const [quizResults, setQuizResults] = useState([]);
	const [selectedQuiz, setSelectedQuiz] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const observer = useRef();
	const { state } = useAuthContext();
	const { user } = state;

	const fetchQuizzes = useCallback(
		async (pageNum) => {
			try {
				setLoading(true);
				const res = await fetch(
					`${import.meta.env.VITE_BACKEND_URL}/api/quiz/user-quiz/${
						user._id
					}?page=${pageNum}&limit=${LIMIT}`,
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

				const newAttempts = data.quizzes.flatMap((quiz) =>
					quiz.attempts.map((attempt) => ({
						...attempt,
						quizTitle: quiz.title || "Untitled Quiz",
						tags: quiz.tags || [],
					}))
				);

				if (pageNum === 1) {
					setQuizResults(newAttempts);
				} else {
					setQuizResults((prev) => [...prev, ...newAttempts]);
				}

				setHasMore(newAttempts.length === LIMIT);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching quizzes:", error);
				setLoading(false);
			}
		},
		[user]
	);

	useEffect(() => {
		if (user) {
			setPage(1);
			fetchQuizzes(1);
		}
	}, [user, fetchQuizzes]);

	const lastQuizElementRef = useCallback(
		(node) => {
			if (loading) return;

			if (observer.current) observer.current.disconnect();

			observer.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasMore) {
					const nextPage = page + 1;
					setPage(nextPage);
					fetchQuizzes(nextPage);
				}
			});

			if (node) observer.current.observe(node);
		},
		[loading, hasMore, fetchQuizzes, page]
	);

	const openModal = (quiz) => {
		setSelectedQuiz(quiz);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedQuiz(null);
	};

	const sortedQuizzes = [...quizResults].sort((a, b) => {
		const dateA = new Date(a.dateCreated || a.date || 0);
		const dateB = new Date(b.dateCreated || b.date || 0);
		return dateB - dateA;
	});

	const formatDate = (dateString) => {
		const options = { year: "numeric", month: "short", day: "numeric" };
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	if (!user) {
		return (
			<div className="flex items-center justify-center h-64">
				<p>Please log in to view your quizzes</p>
			</div>
		);
	}

	return (
		<div className="bg-white flex min-h-screen h-[100vh]">
			<Sidebar user={user} />
			<div className="container flex-1 mx-auto px-4 py-8 overflow-y-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						Your Quiz History
					</h1>
					<Link
						to="/"
						className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 hover:bg-gray-50 transition-all duration-200"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5 mr-2"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Back to Dashboard
					</Link>
				</div>

				{sortedQuizzes.length === 0 && !loading ? (
					<div className="bg-white rounded-lg shadow-md p-8 text-center">
						<h2 className="text-xl text-gray-700 mb-4">
							No quiz attempts yet
						</h2>
						<p className="text-gray-600 mb-6">
							Take a quiz to see your results here
						</p>
						<Link
							to="/quizzes"
							className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
						>
							Explore Quizzes
						</Link>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{sortedQuizzes.map((quiz, index) => {
							// Determine if this is the last element to be observed
							const isLastElement =
								index === sortedQuizzes.length - 1;

							return (
								<div
									key={index}
									ref={
										isLastElement
											? lastQuizElementRef
											: null
									}
									onClick={() => openModal(quiz)}
									className="p-5 bg-white border border-gray-200 rounded-lg shadow-md cursor-pointer hover:border-black transition-all duration-200 hover:shadow-lg flex flex-col justify-between"
								>
									<div>
										<h2 className="text-xl font-bold mb-2 text-gray-900">
											{quiz.quizTitle}
										</h2>
										<div className="flex justify-between items-center mb-3">
											<p className="text-gray-700">
												Score:{" "}
												<span className="font-semibold">
													{quiz.score}
												</span>{" "}
												/ {quiz.answers?.length}
											</p>
											<span className="text-sm text-gray-500">
												{formatDate(
													quiz.dateAttempted ||
														quiz.date
												)}
											</span>
										</div>
										<div className="mb-3 h-1 w-full bg-gray-200 rounded-full">
											<div
												className="h-1 rounded-full bg-black"
												style={{
													width: `${
														(quiz.score /
															quiz.answers
																?.length) *
														100
													}%`,
												}}
											></div>
										</div>
									</div>

									<div>
										{quiz.tags && quiz.tags.length > 0 && (
											<div className="flex flex-wrap mt-2">
												{quiz.tags
													.slice(0, 4)
													.map((tag, tagIndex) => (
														<span
															key={tagIndex}
															className="px-2 py-1 mr-1 mb-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-full text-xs font-medium"
														>
															{tag}
														</span>
													))}
												{quiz.tags.length > 4 && (
													<span className="px-2 py-1 mb-1 text-gray-500 text-xs font-medium">
														+{quiz.tags.length - 4}{" "}
														more
													</span>
												)}
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}

				{loading && (
					<div className="flex justify-center items-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
					</div>
				)}

				{!hasMore && sortedQuizzes.length > 0 && (
					<div className="text-center py-8 text-gray-600">
						You've reached the end of your quiz history
					</div>
				)}
			</div>

			<QuizReviewModal
				quiz={selectedQuiz}
				isOpen={isModalOpen}
				onClose={closeModal}
			/>
		</div>
	);
};

export default AllQuizzes;
