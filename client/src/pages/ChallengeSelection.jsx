import React, { useState } from "react";
import { ArrowLeft, Award, BookOpen, Brain } from "lucide-react";
import Sidebar from "../components/Sidebar";
import useAuthContext from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

// Ts straight up ai generated and i am embarrassed
const GameModeSelection = ({ onSelectMode, onBack }) => {
	const navigate = useNavigate();
	const { state } = useAuthContext();
	const { user } = state;
	const [hoveredCard, setHoveredCard] = useState(null);

	const gameModes = [
		{
			id: "challenge",
			title: "Coding Challenge",
			description: "Test your coding skills with real-world problems",
			icon: <Award size={48} />,
			stats: { difficulty: 4, xpReward: 50 },
			path: "/challenge",
		},
		{
			id: "quiz",
			title: "Knowledge Quiz",
			description: "Quick questions to test your understanding",
			icon: <BookOpen size={48} />,
			stats: { difficulty: 2, xpReward: 30 },
			path: "/quiz-generator",
		},
		{
			id: "subjective",
			title: "Conceptual Analysis",
			description: "Dive deeper into theoretical concepts",
			icon: <Brain size={48} />,
			stats: { difficulty: 3, xpReward: 40 },
			path: "/subjective-answers"
		},
	];

	const renderProgressBar = (value) => {
		const bars = [];
		for (let i = 0; i < 5; i++) {
			bars.push(
				<div
					key={i}
					className={`h-2 w-4 rounded-sm ${
						i < value ? "bg-gray-900" : "bg-gray-300"
					}`}
				/>
			);
		}
		return <div className="flex gap-1">{bars}</div>;
	};

	return (
		<div className="min-h-screen h-[100vh] bg-white flex flex-row w-full">
			<Sidebar user={user} />
			<div className="w-full max-w-5xl mx-auto mt-15 flex-1">
				<div className="flex items-center mb-8">
					<button
						onClick={onBack}
						className="flex items-center justify-center h-10 w-10 rounded-full bg-black text-white hover:bg-gray-800 transition-colors mr-4"
					>
						<ArrowLeft size={18} />
					</button>
					<h1 className="text-3xl font-bold">
						Select Your Challenge
					</h1>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{gameModes.map((mode) => (
						<div
							key={mode.id}
							className={`
                relative bg-white border-2 rounded-xl p-6 transition-all duration-300 cursor-pointer
                ${
					hoveredCard === mode.id
						? "border-black shadow-xl -translate-y-2"
						: "border-gray-200 shadow-md"
				}
              `}
							onMouseEnter={() => setHoveredCard(mode.id)}
							onMouseLeave={() => setHoveredCard(null)}
							onClick={() => onSelectMode(mode.id)}
						>
							<div className="flex flex-col h-full">
								<div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
									{mode.icon}
								</div>

								<h2 className="text-xl font-bold mb-2">
									{mode.title}
								</h2>
								<p className="text-gray-600 mb-6">
									{mode.description}
								</p>

								<div className="mt-auto space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-500">
											Difficulty
										</span>
										{renderProgressBar(
											mode.stats.difficulty
										)}
									</div>

									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-500">
											XP Reward
										</span>
										<span className="font-bold">
											{mode.stats.xpReward} XP
										</span>
									</div>
								</div>

								<div
									className={`
                                        absolute bottom-6 left-0 right-0 flex justify-center
                                        transition-opacity duration-300
                                        ${hoveredCard === mode.id ? "opacity-100" : "opacity-0"}
										`}
									onClick={() => navigate(mode.path)}
								>
									<div className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold">
										Start Now
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="mt-12 border-t border-gray-200 pt-6">
					<h2 className="text-xl font-semibold mb-4">
						Your Progress
					</h2>
					<div className="flex gap-4">
						<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex-1">
							<div className="text-3xl font-bold">42%</div>
							<div className="text-sm text-gray-600">
								Overall Completion
							</div>
						</div>
						<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex-1">
							<div className="text-3xl font-bold">{user.xps}</div>
							<div className="text-sm text-gray-600">
								Total XP
							</div>
						</div>
						<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex-1">
							<div className="text-3xl font-bold">7</div>
							<div className="text-sm text-gray-600">
								Challenges Completed
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GameModeSelection;
