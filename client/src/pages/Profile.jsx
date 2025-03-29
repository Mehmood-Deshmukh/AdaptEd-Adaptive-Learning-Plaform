import React, { useEffect, useRef, useState } from "react";
import useAuthContext from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { motion, AnimatePresence } from "framer-motion";
import {
	Eye,
	EyeOff,
	Lock,
	Mail,
	X,
	Award,
	Brain,
	Flame,
	Trophy,
	Target,
	Rocket,
	Zap,
	Star,
	GraduationCap,
	FileEdit,
	Users,
	Crown,
	Calendar,
	Medal,
	UserPlus,
	HelpCircle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

const ProfilePage = () => {
	const { state } = useAuthContext();
	const { user } = state;
	const navigate = useNavigate();
	const [showForgotPasswordModal, setShowForgotPasswordModal] =
		useState(false);
	const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
	const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
	const [achievements, setAchievements] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	// Reset password modal states
	const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
	const [resetToken, setResetToken] = useState("");
	const [resetEmail, setResetEmail] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

	const toast = useRef(null);

	const iconMap = {
		Trophy: Trophy,
		Award: Award,
		Star: Star,
		Rocket: Rocket,
		GraduationCap: GraduationCap,
		FileEdit: FileEdit,
		Users: Users,
		Crown: Crown,
		Flame: Flame,
		Calendar: Calendar,
		Medal: Medal,
		UserPlus: UserPlus,
	};

	const AchievementIcon = ({ iconName, size = 36 }) => {
		const IconComponent = iconMap[iconName] || HelpCircle;
		return <IconComponent size={size} />;
	};

	useEffect(() => {
		const fetchAchievements = async () => {
			try {
				setIsLoading(true);
				const token = localStorage.getItem("token");

				const response = await fetch(
					`${import.meta.env.VITE_BACKEND_URL}/api/achievements`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!response.ok) {
					throw new Error("Failed to fetch achievements");
				}

				const data = await response.json();

				if (data.success && data.data) {
					setAchievements(data.data);
				} else {
					throw new Error(
						data.message || "Failed to load achievements"
					);
				}
			} catch (error) {
				console.error("Error fetching achievements:", error);
				toast.current.show({
					severity: "error",
					summary: "Error",
					detail: "Failed to load achievements. Please try again later.",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchAchievements();
	}, []);

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const handleForgotPassword = async (e) => {
		e.preventDefault();
		try {
			setForgotPasswordLoading(true);
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/user/forgot-password`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: forgotPasswordEmail,
					}),
				}
			);
			const data = await response.json();
			if (data.status === "success") {
				toast.current.show({
					severity: "success",
					summary: "Success",
					detail: "Reset instructions sent to your email",
				});
				setShowForgotPasswordModal(false);
				setResetEmail(forgotPasswordEmail);
				setShowResetPasswordModal(true);
			} else {
				toast.current.show({
					severity: "error",
					summary: "Error",
					detail: data.message || "Failed to process request",
				});
			}
			setForgotPasswordLoading(false);
		} catch (error) {
			toast.current.show({
				severity: "error",
				summary: "Error",
				detail: "An error occurred. Please try again later.",
			});
			setForgotPasswordLoading(false);
		}
	};

	const handleResetPassword = async (e) => {
		e.preventDefault();
		try {
			setResetPasswordLoading(true);
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/user/reset-password`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: resetEmail,
						token: resetToken,
						password: newPassword,
					}),
				}
			);
			const data = await response.json();
			if (data.status === "success") {
				toast.current.show({
					severity: "success",
					summary: "Success",
					detail: "Password reset successfully",
				});
				setShowResetPasswordModal(false);
			} else {
				toast.current.show({
					severity: "error",
					summary: "Error",
					detail: data.message || "Failed to reset password",
				});
			}
			setResetPasswordLoading(false);
		} catch (error) {
			toast.current.show({
				severity: "error",
				summary: "Error",
				detail: "An error occurred. Please try again later.",
			});
			setResetPasswordLoading(false);
		}
	};

	// Animation variants
	const backdropVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
	};

	const modalVariants = {
		hidden: {
			opacity: 0,
			y: -50,
			scale: 0.95,
		},
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: { type: "spring", damping: 25, stiffness: 500 },
		},
		exit: {
			opacity: 0,
			y: 50,
			scale: 0.95,
			transition: { duration: 0.2 },
		},
	};

	// Function to handle token input - only allow 6 alphanumeric characters and auto-capitalize
	const handleTokenChange = (e) => {
		const value = e.target.value
			.replace(/[^a-zA-Z0-9]/g, "")
			.slice(0, 6)
			.toUpperCase();
		setResetToken(value);
	};

	// Handle backdrop click to close modals
	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			if (showForgotPasswordModal) setShowForgotPasswordModal(false);
			if (showResetPasswordModal) setShowResetPasswordModal(false);
		}
	};

	// Get username for avatar from user's name
	const avatarUsername = encodeURIComponent(user.name);
	const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${avatarUsername}`;

	// Display only the first 3 roadmaps with option to view all
	const displayedRoadmaps =
		user.roadmaps && user.roadmaps.length > 0
			? user.roadmaps.slice(0, 3)
			: [];

	const hasMoreRoadmaps = user.roadmaps && user.roadmaps.length > 3;
	const totalRoadmaps = user.roadmaps ? user.roadmaps.length : 0;

	// Function to determine progress color class
	const getProgressColorClass = (progress) => {
		if (progress < 30) return "text-red-500";
		if (progress < 70) return "text-yellow-500";
		return "text-green-500";
	};

	return (
		<div className="h-[100vh] bg-gray-50 flex ">
			<Toast ref={toast} />
			<Sidebar user={user} />
			<div className="max-w-6xl mx-auto my-4 overflow-scroll">
				{/* Profile Card */}
				<div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
					{/* Header with Avatar */}
					<div className="bg-black text-white p-8 relative">
						<div className="flex flex-col md:flex-row items-start md:items-center justify-between">
							<div className="flex items-center gap-6">
								<div className="relative">
									<img
										src={avatarUrl}
										alt={`${user.name}'s avatar`}
										className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
										loading="lazy"
									/>
								</div>
								<div>
									<h1 className="text-3xl font-bold mb-1">
										{user.name}
									</h1>
									<p className="text-gray-300 text-sm">
										Member since{" "}
										{formatDate(user.createdAt)}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Content */}
					<div className="p-6 md:p-8">
						<div className="space-y-10">
							{/* Personal Information Section */}
							<div>
								<h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3 flex items-center mb-6">
									<svg
										className="w-5 h-5 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										></path>
									</svg>
									Personal Information
								</h2>
								<div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-8">
									<div className="bg-gray-50 p-4 rounded-lg">
										<h3 className="text-sm font-medium text-gray-500 mb-2">
											Email Address
										</h3>
										<p className="text-md text-gray-900 font-medium">
											{user.email}
										</p>
									</div>
									<div className="bg-gray-50 p-4 rounded-lg">
										<h3 className="text-sm font-medium text-gray-500 mb-2">
											Account ID
										</h3>
										<p className="text-md text-gray-900 font-medium truncate">
											{user._id || "ID12345678"}
										</p>
									</div>
								</div>
							</div>

							{/* Learning Progress Section */}
							<div>
								<h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3 flex items-center mb-6">
									<svg
										className="w-5 h-5 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
										></path>
									</svg>
									Learning Progress
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="bg-gray-50 p-4 rounded-lg text-center">
										<h3 className="text-sm font-medium text-gray-500 mb-2">
											Average Quiz Score
										</h3>
										<p className="text-2xl font-bold text-gray-900">
											{user.avg_quiz_score
												? user.avg_quiz_score.toFixed(1)
												: 0}
											/10
										</p>
									</div>
									<div className="bg-gray-50 p-4 rounded-lg text-center">
										<h3 className="text-sm font-medium text-gray-500 mb-2">
											Current Streak
										</h3>
										<p className="text-2xl font-bold text-gray-900">
											{user.currentStreak || 0} days
										</p>
									</div>
									<div className="bg-gray-50 p-4 rounded-lg text-center">
										<h3 className="text-sm font-medium text-gray-500 mb-2">
											Max Streak
										</h3>
										<p className="text-2xl font-bold text-gray-900">
											{user.maxStreak || 0} days
										</p>
									</div>
								</div>
								<div className="mt-6 text-center">
									<button
										onClick={() => navigate("/")}
										className="inline-flex items-center px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
									>
										View Learning Dashboard
										<svg
											className="ml-2 w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M9 5l7 7-7 7"
											></path>
										</svg>
									</button>
								</div>
							</div>

							<div className="bg-white rounded-xl p-8">
								<h2 className="text-2xl font-bold text-black flex items-center mb-8 border-b border-gray-100 pb-4">
									<svg
										className="w-6 h-6 mr-3 text-black"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
										></path>
									</svg>
									Achievements
								</h2>

								<style jsx>{`
									.hex-container {
										position: relative;
										width: 84px;
										height: 96px;
										margin: 0 auto;
										perspective: 800px;
									}

									.hex-outer {
										clip-path: polygon(
											50% 0%,
											100% 25%,
											100% 75%,
											50% 100%,
											0% 75%,
											0% 25%
										);
										position: absolute;
										inset: 0;
										transition: all 0.3s
											cubic-bezier(
												0.175,
												0.885,
												0.32,
												1.275
											);
									}

									.hex-inner {
										clip-path: polygon(
											50% 0%,
											100% 25%,
											100% 75%,
											50% 100%,
											0% 75%,
											0% 25%
										);
										position: absolute;
										inset: 3px;
										display: flex;
										align-items: center;
										justify-content: center;
										transition: all 0.3s ease;
									}

									.achievement-item:hover .hex-outer {
										transform: translateZ(15px)
											rotateX(10deg) rotateY(10deg);
									}

									.achievement-item:hover .hex-shadow {
										transform: translateY(8px) scale(0.95);
										opacity: 0.7;
										filter: blur(20px);
									}

									.hex-shadow {
										position: absolute;
										inset: 5px;
										background: rgba(0, 0, 0, 0.75);
										filter: blur(15px);
										transform: translateY(5px) scale(0.9);
										opacity: 0.5;
										z-index: -1;
										transition: all 0.3s ease;
									}
								`}</style>

								{isLoading ? (
									<div className="flex justify-center items-center py-10">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
									</div>
								) : (
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
										{achievements.map((achievement) => (
											<div
												key={achievement.id}
												className="achievement-item transition-all duration-300 hover:-translate-y-2 group"
											>
												<div className="hex-container mb-4">
													{/* Shadow element */}
													<div className="hex-shadow"></div>

													<div
														className={`
                              hex-outer 
                              ${
									achievement.isUnlocked
										? "bg-black shadow-[0_18px_30px_-10px_rgba(0,0,0,0.6),0_6px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]"
										: "bg-gray-300 shadow-[0_12px_20px_-8px_rgba(0,0,0,0.25),0_4px_8px_rgba(0,0,0,0.2)]"
								}
                            `}
													></div>

													<div
														className={`
                              hex-inner
                              ${
									achievement.isUnlocked
										? "bg-white shadow-[inset_0_3px_6px_rgba(0,0,0,0.1)]"
										: "bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
								}
                            `}
													>
														<div
															className={`
                                relative z-10
                                transition-all duration-300
                                ${
									achievement.isUnlocked
										? "text-black text-opacity-90 scale-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
										: "text-gray-400 text-opacity-60 scale-90"
								}
                                group-hover:scale-110 group-hover:rotate-[5deg] 
                              `}
														>
															<AchievementIcon
																iconName={
																	achievement.icon
																}
																size={36}
																color={
																	achievement.isUnlocked
																		? "#000000"
																		: "#6B7280"
																}
															/>
														</div>

														{!achievement.isUnlocked && (
															<div className="absolute inset-0 flex items-center justify-center z-[10]">
																<svg
																	className="w-5 h-5 text-gray-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
																	xmlns="http://www.w3.org/2000/svg"
																	viewBox="0 0 20 20"
																	fill="black"
																>
																	<path
																		fillRule="evenodd"
																		d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
																		clipRule="evenodd"
																	/>
																</svg>
															</div>
														)}
													</div>
												</div>

												<div className="text-center">
													<h3
														className={`
                              text-sm font-semibold
                              ${
									achievement.isUnlocked
										? "text-black"
										: "text-gray-500"
								}
                            `}
													>
														{achievement.name}
													</h3>

													<div className="h-10">
														{achievement.isUnlocked && (
															<div className="mt-1">
																<span className="text-xs font-medium bg-black text-white px-2 py-1 rounded-full">
																	+
																	{
																		achievement.xp
																	}{" "}
																	XP
																</span>
															</div>
														)}
													</div>

													<p className="text-xs text-gray-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
														{
															achievement.description
														}
													</p>
												</div>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Roadmaps Section */}
							<div>
								<h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3 flex items-center mb-6">
									<svg
										className="w-5 h-5 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
										></path>
									</svg>
									My Roadmaps
								</h2>

								{displayedRoadmaps.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{displayedRoadmaps.map((roadmap) => (
											<div
												key={roadmap._id}
												className="bg-white border border-gray-200 shadow-sm rounded-lg p-5 hover:shadow-md transition-shadow duration-200"
											>
												<div className="flex justify-between items-start">
													<h3 className="font-medium text-lg text-gray-900 mb-2">
														{roadmap.mainTopic}
													</h3>
													<span
														className={`text-sm font-medium ${getProgressColorClass(
															roadmap.totalProgress
														)}`}
													>
														{roadmap.totalProgress}%
														Complete
													</span>
												</div>
												<p className="text-gray-600 text-sm line-clamp-2 mb-3">
													{roadmap.description}
												</p>
												<div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
													<div
														className="bg-black h-2.5 rounded-full"
														style={{
															width: `${roadmap.totalProgress}%`,
														}}
													></div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="bg-gray-50 rounded-lg p-8 text-center">
										<svg
											className="w-12 h-12 text-gray-400 mx-auto mb-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											></path>
										</svg>
										<p className="text-gray-500 mb-4">
											You haven't created any roadmaps
											yet.
										</p>
										<button
											onClick={() =>
												navigate("/roadmaps-generator")
											}
											className="inline-flex items-center px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
										>
											Create Your First Roadmap
											<svg
												className="ml-2 w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M12 6v6m0 0v6m0-6h6m-6 0H6"
												></path>
											</svg>
										</button>
									</div>
								)}

								{hasMoreRoadmaps && (
									<div className="mt-6 text-center">
										<button
											onClick={() =>
												navigate("/roadmap-generator")
											}
											className="inline-flex items-center px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium mr-3"
										>
											View All {totalRoadmaps} Roadmaps
											<svg
												className="ml-2 w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M9 5l7 7-7 7"
												></path>
											</svg>
										</button>
										<button
											onClick={() =>
												navigate("/roadmap-generator")
											}
											className="inline-flex items-center px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
										>
											Create New Roadmap
											<svg
												className="ml-2 w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M12 6v6m0 0v6m0-6h6m-6 0H6"
												></path>
											</svg>
										</button>
									</div>
								)}

								{displayedRoadmaps.length > 0 &&
									!hasMoreRoadmaps && (
										<div className="mt-6 text-center">
											<button
												onClick={() =>
													navigate(
														"/roadmap-generator"
													)
												}
												className="inline-flex items-center px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
											>
												Create New Roadmap
												<svg
													className="ml-2 w-4 h-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="2"
														d="M12 6v6m0 0v6m0-6h6m-6 0H6"
													></path>
												</svg>
											</button>
										</div>
									)}
							</div>

							{/* Account Management */}
							<div>
								<h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3 flex items-center mb-6">
									<svg
										className="w-5 h-5 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
										></path>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										></path>
									</svg>
									Account Management
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<button
										onClick={() => {
											setShowForgotPasswordModal(true);
											setForgotPasswordEmail(user.email);
										}}
										className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
									>
										<svg
											className="w-5 h-5 mr-3 text-gray-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
											></path>
										</svg>
										<span className="text-gray-900 font-medium">
											Change Password
										</span>
									</button>
									<button className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
										<svg
											className="w-5 h-5 mr-3 text-gray-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											></path>
										</svg>
										<span className="text-gray-900 font-medium">
											Help & Support
										</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Forgot Password Modal with AnimatePresence */}
			<AnimatePresence>
				{showForgotPasswordModal && (
					<motion.div
						className="fixed inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center z-50"
						initial="hidden"
						animate="visible"
						exit="hidden"
						variants={backdropVariants}
						onClick={handleBackdropClick}
					>
						<motion.div
							className="bg-white rounded-xl p-6 w-full max-w-md mx-4 relative"
							variants={modalVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
						>
							<button
								className="absolute top-4 right-4"
								onClick={() =>
									setShowForgotPasswordModal(false)
								}
							>
								<X className="h-5 w-5 text-gray-600" />
							</button>
							<h3 className="text-xl font-bold text-black mb-4">
								Reset your password
							</h3>
							<p className="text-gray-600 mb-6">
								Enter your email address and we'll send you
								instructions to reset your password.
							</p>

							<form
								onSubmit={handleForgotPassword}
								className="space-y-4"
							>
								<div className="space-y-2">
									<label
										htmlFor="forgotPasswordEmail"
										className="block text-sm font-medium text-gray-800"
									>
										Email Address
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<Mail className="h-5 w-5 text-gray-600" />
										</div>
										<input
											id="forgotPasswordEmail"
											type="email"
											value={forgotPasswordEmail}
											onChange={(e) =>
												setForgotPasswordEmail(
													e.target.value
												)
											}
											placeholder="Enter your email"
											className="w-full pl-10 pr-3 py-3 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
											required
										/>
									</div>
								</div>

								<button
									type="submit"
									className={`w-full flex justify-center items-center py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150 ease-in-out ${
										forgotPasswordLoading
											? "opacity-75 cursor-not-allowed"
											: ""
									}`}
									disabled={forgotPasswordLoading}
								>
									{forgotPasswordLoading ? (
										<span className="flex items-center">
											<svg
												className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
											Sending...
										</span>
									) : (
										"Send Reset Instructions"
									)}
								</button>
							</form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Reset Password Modal with AnimatePresence */}
			<AnimatePresence>
				{showResetPasswordModal && (
					<motion.div
						className="fixed inset-0 backdrop-blur-md  bg-black/60 flex items-center justify-center z-50"
						initial="hidden"
						animate="visible"
						exit="hidden"
						variants={backdropVariants}
						onClick={handleBackdropClick}
					>
						<motion.div
							className="bg-white rounded-xl p-6 w-full max-w-md mx-4 relative"
							variants={modalVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
						>
							<button
								className="absolute top-4 right-4"
								onClick={() => setShowResetPasswordModal(false)}
							>
								<X className="h-5 w-5 text-gray-600" />
							</button>
							<h3 className="text-xl font-bold text-black mb-4">
								Set new password
							</h3>
							<p className="text-gray-600 mb-6">
								Enter the 6-digit alphanumeric token from your
								email and create a new password.
							</p>

							<form
								onSubmit={handleResetPassword}
								className="space-y-4"
							>
								<div className="space-y-2">
									<label
										htmlFor="resetEmail"
										className="block text-sm font-medium text-gray-800"
									>
										Email Address
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<Mail className="h-5 w-5 text-gray-600" />
										</div>
										<input
											id="resetEmail"
											type="email"
											value={resetEmail}
											onChange={(e) =>
												setResetEmail(e.target.value)
											}
											placeholder="Enter your email"
											className="w-full pl-10 pr-3 py-3 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
											required
										/>
									</div>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="resetToken"
										className="block text-sm font-medium text-gray-800"
									>
										Reset Token (6 characters)
									</label>
									<div className="flex justify-center">
										<input
											id="resetToken"
											type="text"
											value={resetToken}
											onChange={handleTokenChange}
											placeholder="Enter 6-digit token"
											className="w-full px-3 py-3 text-center text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black tracking-wider font-medium text-lg"
											maxLength={6}
											required
											autoComplete="off"
										/>
									</div>
									<p className="text-xs text-gray-500 mt-1">
										Enter the 6 character alphanumeric token
										sent to your email
									</p>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="newPassword"
										className="block text-sm font-medium text-gray-800"
									>
										New Password
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<Lock className="h-5 w-5 text-gray-600" />
										</div>
										<input
											id="newPassword"
											type={
												showNewPassword
													? "text"
													: "password"
											}
											value={newPassword}
											onChange={(e) =>
												setNewPassword(e.target.value)
											}
											placeholder="Create new password"
											className="w-full pl-10 pr-10 py-3 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
											required
										/>
										<button
											type="button"
											className="absolute inset-y-0 right-0 pr-3 flex items-center"
											onClick={() =>
												setShowNewPassword(
													!showNewPassword
												)
											}
										>
											{showNewPassword ? (
												<EyeOff className="h-5 w-5 text-gray-600" />
											) : (
												<Eye className="h-5 w-5 text-gray-600" />
											)}
										</button>
									</div>
								</div>

								<button
									type="submit"
									className={`w-full flex justify-center items-center py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150 ease-in-out ${
										resetPasswordLoading
											? "opacity-75 cursor-not-allowed"
											: ""
									}`}
									disabled={resetPasswordLoading}
								>
									{resetPasswordLoading ? (
										<span className="flex items-center">
											<svg
												className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
											Resetting...
										</span>
									) : (
										"Reset Password"
									)}
								</button>

								<div className="text-center mt-4">
									<button
										type="button"
										className="text-sm text-gray-600 hover:text-black"
										onClick={() =>
											setShowResetPasswordModal(false)
										}
									>
										Back to login
									</button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default ProfilePage;
