import React, { useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { X, PlusCircle, Trash2 } from "lucide-react";
import useAuthContext from "../hooks/useAuthContext";
import { questions, domainSuggestions } from "../utils/lib";

const LearningStyleSurvey = ({ onClose }) => {
	const { dispatch } = useAuthContext();
	const [answers, setAnswers] = useState({});
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [isComplete, setIsComplete] = useState(false);
	const [showModal, setShowModal] = useState(true);
	const [domainInterests, setDomainInterests] = useState([]);
	const [newDomainInterest, setNewDomainInterest] = useState("");
	const toast = useRef(null);



	const handleAddDomainInterest = () => {
		if (newDomainInterest.trim() && !domainInterests.includes(newDomainInterest.trim())) {
			setDomainInterests([...domainInterests, newDomainInterest.trim()]);
			setNewDomainInterest("");
		}
	};

	const handleRemoveDomainInterest = (interest) => {
		setDomainInterests(domainInterests.filter(item => item !== interest));
	};

	const handleAnswer = (value) => {
		const newAnswers = {
			...answers,
			[currentQuestion === questions.length 
				? "domainInterests" 
				: questions[currentQuestion].parameter]: value,
		};
		setAnswers(newAnswers);

		if (currentQuestion < questions.length) {
			setCurrentQuestion(currentQuestion + 1);
		}

		if (currentQuestion === questions.length) {
			setIsComplete(true);
		}
	};

	const handlePrevious = () => {
		if (currentQuestion > 0) {
			setCurrentQuestion(currentQuestion - 1);
		}
	};

	const handleReset = () => {
		setAnswers({});
		setCurrentQuestion(0);
		setIsComplete(false);
		setDomainInterests([]);
	};

	const handleSubmit = async () => {
		try {
			const submissionAnswers = {
				...answers,
				domainInterests: domainInterests
			};

			console.log("Survey results:", submissionAnswers);
			const response = await fetch(
				`${
					import.meta.env.VITE_BACKEND_URL
				}/api/user/update-learning-parameters`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem(
							"token"
						)}`,
					},
					body: JSON.stringify(submissionAnswers),
				}
			);

			if (response.ok) {
				const data = await response.json();
				const user = data.data;

				dispatch({
					type: "UPDATE_USER",
					payload: user,
				});
				toast.current.show({
					severity: "success",
					summary: "Success",
					detail: "Learning style profile updated successfully",
					life: 3000,
				});
			}
		} catch (e) {
			console.log(e);
			toast.current.show({
				severity: "error",
				summary: "Error",
				detail: "Failed to update learning style profile",
				life: 3000,
			});
		} finally {
			setTimeout(() => {
				setShowModal(false);
				if (onClose) onClose(answers);
			}, 1000);
		}
	};

	const handleClose = () => {
		setShowModal(false);
		if (onClose) onClose();
	};

	const calculateResults = () => {
		const categories = {
			visualLearning: "Visual Learning",
			auditoryLearning: "Auditory Learning",
			readingWritingLearning: "Reading/Writing",
			kinestheticLearning: "Kinesthetic Learning",
			challengeTolerance: "Challenge Preference",
			timeCommitment: "Time Commitment",
			learningPace: "Learning Pace",
			socialPreference: "Social Learning",
			feedbackPreference: "Feedback Preference",
			domainInterests: "Domain Interests"
		};

		return Object.entries(answers)
			.filter(([key]) => key !== "domainInterests")
			.map(([key, value]) => ({
				category: categories[key],
				score: value,
			}));
	};

	if (!showModal) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<Toast ref={toast} position="top-right" />
			<div className="bg-white rounded-lg shadow-lg w-full max-w-xl mx-4 relative">
				<div className="flex justify-between items-center border-b border-gray-200 p-4">
					<h2 className="text-xl font-bold text-black">
						Learning Style Assessment
					</h2>
					<button
						onClick={handleClose}
						className="text-black hover:text-gray-700 focus:outline-none"
					>
						<X size={20} />
					</button>
				</div>

				<div className="p-6">
					{!isComplete ? (
						<>
							<div className="mb-6">
								<div className="flex justify-between text-sm text-black mb-2">
									<span>
										Question {currentQuestion + 1} of{" "}
										{questions.length + 1}
									</span>
									<span>
										{Math.round(
											((currentQuestion + 1) /
												(questions.length + 1)) *
												100
										)}
										%
									</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className="bg-black h-2 rounded-full transition-all duration-300"
										style={{
											width: `${
												((currentQuestion + 1) /
													(questions.length + 1)) *
												100
											}%`,
										}}
									></div>
								</div>
							</div>

							{currentQuestion < questions.length ? (
								<>
									<h3 className="text-lg font-medium text-black mb-6">
										{questions[currentQuestion].question}
									</h3>

									<div className="space-y-3 mb-6">
										{questions[currentQuestion].options.map(
											(option) => (
												<button
													key={option.value}
													onClick={() =>
														handleAnswer(option.value)
													}
													className={`w-full py-3 px-4 text-left rounded-md transition-all border text-black ${
														answers[
															questions[currentQuestion]
																.parameter
														] === option.value
															? "border-black bg-gray-100"
															: "border-gray-300 hover:border-gray-500"
													}`}
												>
													{option.text}
												</button>
											)
										)}
									</div>
								</>
							) : (
								<>
									<h3 className="text-lg font-medium text-black mb-4">
										Select Your Domain Interests
									</h3>
									
									{/* Suggestions Grid */}
									<div className="grid grid-cols-3 gap-2 mb-4">
										{domainSuggestions.map((suggestion) => (
											<button
												key={suggestion}
												onClick={() => {
													if (!domainInterests.includes(suggestion)) {
														setDomainInterests([...domainInterests, suggestion]);
													}
												}}
												className={`px-3 py-2 text-xs rounded-md transition-all ${
													domainInterests.includes(suggestion)
														? "bg-black text-white"
														: "bg-gray-200 text-black hover:bg-gray-300"
												}`}
											>
												{suggestion}
											</button>
										))}
									</div>

									{/* Custom Interest Input */}
									<div className="flex space-x-2 mb-4">
										<input
											type="text"
											value={newDomainInterest}
											onChange={(e) => setNewDomainInterest(e.target.value)}
											placeholder="Add custom domain interest"
											className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:border-black"
											onKeyPress={(e) => {
												if (e.key === 'Enter') {
													handleAddDomainInterest();
												}
											}}
										/>
										<button
											onClick={handleAddDomainInterest}
											className="bg-black text-white p-2 rounded-md hover:bg-gray-800"
										>
											<PlusCircle size={20} />
										</button>
									</div>

									{/* Selected Interests */}
									{domainInterests.length > 0 && (
										<div className="flex flex-wrap gap-2 mb-4">
											{domainInterests.map((interest) => (
												<div 
													key={interest} 
													className="flex items-center bg-gray-200 px-3 py-1 rounded-full text-sm"
												>
													{interest}
													<button
														onClick={() => handleRemoveDomainInterest(interest)}
														className="ml-2 text-black hover:text-gray-700"
													>
														<Trash2 size={16} />
													</button>
												</div>
											))}
										</div>
									)}

									{/* Submit Domain Interests */}
									<button
										onClick={() => handleAnswer(domainInterests)}
										className="w-full py-3 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
										disabled={domainInterests.length === 0}
									>
										Complete Survey
									</button>
								</>
							)}

							<div className="flex justify-between mt-4">
								<button
									onClick={handlePrevious}
									className={`px-4 py-2 rounded-md ${
										currentQuestion === 0
											? "bg-gray-200 text-black cursor-not-allowed"
											: "bg-gray-200 text-black hover:bg-gray-300"
									}`}
									disabled={currentQuestion === 0}
								>
									Previous
								</button>
								<button
									onClick={handleClose}
									className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
								>
									Skip for Now
								</button>
							</div>
						</>
					) : (
						<div>
							<h3 className="text-lg font-medium text-black mb-6">
								Your Learning Style Profile
							</h3>
							
							{/* Domain Interests Summary */}
							{answers.domainInterests && (
								<div className="mb-6">
									<h4 className="text-md font-medium text-black mb-2">
										Your Domain Interests
									</h4>
									<div className="flex flex-wrap gap-2">
										{answers.domainInterests.map((interest) => (
											<span 
												key={interest} 
												className="bg-gray-200 px-3 py-1 rounded-full text-sm"
											>
												{interest}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Existing learning style results */}
							<div className="space-y-4 mb-6">
								{calculateResults().map((result) => (
									<div key={result.category} className="mb-2">
										<div className="flex justify-between mb-1">
											<span className="text-black">
												{result.category}
											</span>
											<span className="text-black font-medium">
												{result.score}/10
											</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div
												className="bg-black h-2 rounded-full"
												style={{
													width: `${
														(result.score / 10) *
														100
													}%`,
												}}
											></div>
										</div>
									</div>
								))}
							</div>
							<div className="flex justify-between">
								<button
									onClick={handleReset}
									className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
								>
									Retake Survey
								</button>
								<button
									onClick={handleSubmit}
									className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
								>
									Submit
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default LearningStyleSurvey;