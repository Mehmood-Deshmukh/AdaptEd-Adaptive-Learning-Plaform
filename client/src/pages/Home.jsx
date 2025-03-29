import React, { useEffect, useState } from "react";
import useAuthContext from "../hooks/useAuthContext";
import LearningStyleSurvey from "../components/SurveyComponent";
import {
	BookOpen,
	Map,
	Flame,
	Trophy,
	Crown,
	LogOut,
	User,
	Home as HomeIcon,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Recommendations from "../components/Recommendations";
import RecentQuiz from "./RecentQuiz";

const Home = () => {
	const { state } = useAuthContext();
	const { user } = state;
	const [timeOfDay, setTimeOfDay] = useState("");
	const [showSurvey, setShowSurvey] = useState(!user?.isAssessmentComplete);
	const [learningProfile, setLearningProfile] = useState(null);
	
	useEffect(() => {
		const hour = new Date().getHours();
		if (hour < 12) setTimeOfDay("morning");
		else if (hour < 17) setTimeOfDay("afternoon");
		else setTimeOfDay("evening");

		const savedProfile = localStorage.getItem("learningProfile");
		if (savedProfile) {
			setLearningProfile(JSON.parse(savedProfile));
		}
	}, []);

	const handleSurveyClose = (results) => {
		setShowSurvey(false);
		if (results) {
			setLearningProfile(results);
			localStorage.setItem("learningProfile", JSON.stringify(results));
		}
	};
	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar user={user} />

			<div className="flex-1 overflow-auto mt-3">
				<div className="p-6 max-w-6xl mx-auto">
					<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
						<h1 className="text-2xl font-bold text-gray-900">
							Good {timeOfDay}, {user?.name}!
						</h1>
						<p className="text-gray-600 mt-1">
							Ready to continue your personalized learning
							journey?
						</p>

						<div className="grid grid-cols-3 gap-4 mt-6">
							<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium text-gray-500">
										Streak
									</p>
									<Flame
										size={18}
										className="text-gray-700"
									/>
								</div>
								<p className="text-xl font-bold mt-1 text-black">
									{user?.currentStreak} days
								</p>
							</div>

							<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium text-gray-500">
										XP Points
									</p>
									<Crown
										size={18}
										className="text-gray-700"
									/>
								</div>
								<p className="text-xl font-bold mt-1 text-black">
									{user?.xps}
								</p>
							</div>

							<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium text-gray-500">
										Quizzes
									</p>
									<Trophy
										size={18}
										className="text-gray-700"
									/>
								</div>
								<p className="text-xl font-bold mt-1 text-black">
									{user?.quizzes.length}
								</p>
							</div>
						</div>
					</div>

					<Recommendations />

					<RecentQuiz />

					<div className="bg-white rounded-lg shadow-sm p-6">
						<h2 className="text-xl font-bold text-gray-900 mb-4">
							Learning Style Assessment
						</h2>
						{learningProfile ? (
							<div className="text-black">
								<p>
									Your learning profile has been saved! Here's
									a summary:
								</p>
								<ul className="mt-2 list-disc pl-5">
									{learningProfile.visualLearning > 6 && (
										<li>You're a strong visual learner</li>
									)}
									{learningProfile.auditoryLearning > 6 && (
										<li>
											You benefit from auditory learning
										</li>
									)}
									{learningProfile.kinestheticLearning >
										6 && (
										<li>
											You learn best through hands-on
											activities
										</li>
									)}
								</ul>
								<button
									onClick={() => setShowSurvey(true)}
									className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
								>
									Retake Assessment
								</button>
							</div>
						) : (
							<button
								onClick={() => setShowSurvey(true)}
								className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
							>
								Start Assessment
							</button>
						)}
					</div>
				</div>
			</div>

			{showSurvey && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto p-6">
						<h2 className="text-xl font-bold mb-4">
							Learning Style Assessment
						</h2>
						<LearningStyleSurvey onClose={handleSurveyClose} />
					</div>
				</div>
			)}
		</div>
	);
};

export default Home;
