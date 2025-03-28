import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import useAuthContext from "../hooks/useAuthContext";
import PostItem from "../components/PostItem";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import {
	Award,
	BookOpen,
	Users,
	UserPlus,
	ChevronDown,
	Star,
	AtSign,
	CircleUser,
	Flame,
	Medal,
	Target,
} from "lucide-react";
import UserBadge from "./UserBadge";
import RoadmapDetails from "./RoadmapDetails";
import XpCircle from "./XpCircle";

const PublicProfile = () => {
	const navigate = useNavigate();
	const { userId } = useParams();
	const { state, dispatch } = useAuthContext();
	const { user: currentUser } = state;

	const [profile, setProfile] = useState(null);
	const [roadmaps, setRoadmaps] = useState([]);
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isFollowing, setIsFollowing] = useState(false);

	const [pagination, setPagination] = useState({
		posts: { currentPage: 1, totalPages: 1, hasMore: false },
		roadmaps: { currentPage: 1, totalPages: 1, hasMore: false },
	});

	const fetchPublicProfile = async (postsPage = 1, roadmapsPage = 1) => {
		try {
			setLoading(true);
			const profileResponse = await axios.get(
				`${
					import.meta.env.VITE_BACKEND_URL
				}/api/publicprofile/user/${userId}`
			);

			const roadmapsResponse = await axios.get(
				`${
					import.meta.env.VITE_BACKEND_URL
				}/api/publicprofile/roadmaps/${userId}`,
				{
					params: { page: roadmapsPage, limit: 4 },
				}
			);

			const postsResponse = await axios.get(
				`${
					import.meta.env.VITE_BACKEND_URL
				}/api/publicprofile/posts/${userId}`,
				{
					params: { page: postsPage, limit: 3 },
				}
			);

			setProfile(profileResponse.data.data);

			if (postsPage === 1) {
				setPosts(postsResponse.data.data.posts);
			} else {
				setPosts((prev) => [...prev, ...postsResponse.data.data.posts]);
			}

			if (roadmapsPage === 1) {
				setRoadmaps(roadmapsResponse.data.data.roadmaps);
			} else {
				setRoadmaps((prev) => [
					...prev,
					...roadmapsResponse.data.data.roadmaps,
				]);
			}

			setPagination({
				posts: {
					currentPage: postsResponse.data.data.currentPage,
					totalPages: postsResponse.data.data.totalPages,
					hasMore:
						postsResponse.data.data.currentPage <
						postsResponse.data.data.totalPages,
				},
				roadmaps: {
					currentPage: roadmapsResponse.data.data.currentPage,
					totalPages: roadmapsResponse.data.data.totalPages,
					hasMore:
						roadmapsResponse.data.data.currentPage <
						roadmapsResponse.data.data.totalPages,
				},
			});

			setIsFollowing(
				currentUser?.following?.some(
					(followedUser) => followedUser === userId
				)
			);

			setLoading(false);
		} catch (error) {
			console.error("Error fetching public profile:", error);
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPublicProfile();
	}, [userId, currentUser]);

	const loadMorePosts = () => {
		fetchPublicProfile(
			pagination.posts.currentPage + 1,
			pagination.roadmaps.currentPage
		);
	};

	const loadMoreRoadmaps = () => {
		fetchPublicProfile(
			pagination.posts.currentPage,
			pagination.roadmaps.currentPage + 1
		);
	};

	const handleFollow = async () => {
		try {
			const updatedUser = JSON.parse(JSON.stringify(currentUser));
			
			const updatedProfile = { ...profile };
	
			const endpoint = isFollowing
				? `${import.meta.env.VITE_BACKEND_URL}/api/user/unfollow`
				: `${import.meta.env.VITE_BACKEND_URL}/api/user/follow`;
	
			if (isFollowing) {
				updatedUser.following = updatedUser.following.filter(
					(id) => id !== userId
				);
				updatedProfile.followers = updatedProfile.followers.filter(
					(id) => id !== currentUser._id
				);
			} else {
				updatedUser.following.push(userId);
				updatedProfile.followers.push(currentUser._id);
			}
	
			setIsFollowing(!isFollowing);
			setProfile(updatedProfile);
	
			dispatch({
				type: "UPDATE_USER",
				payload: updatedUser,
			});
	
			await axios.post(
				endpoint,
				{ userId: userId },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
		} catch (error) {
			console.error("Error following/unfollowing:", error);
	
			setIsFollowing((prev) => !prev);
	
			const revertedProfile = { ...profile };
			if (isFollowing) {
				if (!revertedProfile.followers.includes(currentUser._id)) {
					revertedProfile.followers.push(currentUser._id);
				}
			} else {
				revertedProfile.followers = revertedProfile.followers.filter(
					(id) => id !== currentUser._id
				);
			}
	
			setProfile(revertedProfile);
	
			const revertedUser = JSON.parse(JSON.stringify(currentUser));
			if (isFollowing) {
				if (!revertedUser.following.includes(userId)) {
					revertedUser.following.push(userId);
				}
			} else {
				revertedUser.following = revertedUser.following.filter(
					(id) => id !== userId
				);
			}
	
			dispatch({
				type: "UPDATE_USER",
				payload: revertedUser,
			});
		}
	};

	if (loading && !profile) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-xl font-semibold text-red-600 p-8 border border-red-200 rounded-lg bg-red-50">
					Profile not found
				</div>
			</div>
		);
	}

	const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${profile.name}`;

	const memberSince = new Date(profile.createdAt).toLocaleDateString(
		"en-US",
		{
			year: "numeric",
			month: "long",
			day: "numeric",
		}
	);

	const formattedQuizScore = profile.avg_quiz_score
		? Number(profile.avg_quiz_score).toFixed(1)
		: "0";

	return (
		<div className="bg-white text-black min-h-screen flex h-[100vh]">
			<Sidebar user={currentUser} />
			<div className="flex-1 overflow-y-auto h-full py-4">
				<div className="max-w-6xl mx-auto shadow-lg rounded-2xl">
					<div className="w-full h-48 bg-black rounded-t-2xl relative">
						<div className="absolute -bottom-22 left-16">
							<div className="relative">
								<img
									src={avatarUrl}
									alt={`${profile.name}'s avatar`}
									className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
								/>
								<span className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 border-4 border-white rounded-full"></span>
							</div>
						</div>
					</div>

					<div className="bg-white px-4 pb-6">
						<div className="flex flex-wrap pt-20 sm:pt-6">
							<div className="w-full sm:w-48"></div>

							<div className="w-full sm:flex-1 sm:pl-4 flex flex-wrap justify-between items-start">
								<div>
									<div className="flex items-center gap-3">
										<h1 className="text-3xl font-bold">
											{profile.name}
										</h1>
										<UserBadge level={profile.level} />
									</div>
									<div className="flex flex-wrap items-center gap-x-4 mt-1">
										<p className="text-gray-600 flex items-center">
											<CircleUser
												size={16}
												className="mr-12"
											/>{" "}
											Member since {memberSince}
										</p>
										{profile.communities &&
											profile.communities.length > 0 && (
												<p className="text-gray-600 flex items-center cursor-pointer"
													onClick={() => navigate(`/community/${profile.communities[0]._id}`)}
												>
													<Users
														size={16}
														className="mr-1"
													/>
													{
														profile.communities[0]
															.name
													}
													{profile.communities
														.length > 1 && (
														<span>
															{" "}
															and{" "}
															{profile.communities
																.length -
																1}{" "}
															more
														</span>
													)}
												</p>
											)}
									</div>
								</div>

								{currentUser && currentUser._id !== userId && (
									<button
										onClick={handleFollow}
										className={`px-6 py-2.5 rounded-md transition-colors flex items-center gap-2 shadow-sm mt-4 sm:mt-0 ${
											isFollowing
												? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
												: "bg-black text-white hover:bg-gray-800"
										}`}
									>
										{isFollowing ? (
											<>
												<Users size={18} /> Unfollow
											</>
										) : (
											<>
												<UserPlus size={18} /> Follow
											</>
										)}
									</button>
								)}
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 mb-4">
							<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
								<div>
									<h3 className="text-gray-500 text-sm uppercase tracking-wide font-medium">
										XP Level
									</h3>
									<div className="flex items-center gap-1.5 mt-1">
										<Award
											size={18}
											className="text-gray-700"
										/>
										<span className="text-2xl font-bold">
											{profile.level}
										</span>
									</div>
								</div>
								<XpCircle xp={profile.xps} />
							</div>

							<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
								<div>
									<h3 className="text-gray-500 text-sm uppercase tracking-wide font-medium">
										Followers
									</h3>
									<div className="flex items-center gap-1.5 mt-1">
										<Users
											size={18}
											className="text-gray-700"
										/>
										<span className="text-2xl font-bold">
											{profile.followers.length}
										</span>
									</div>
								</div>
								<div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
									<Users
										size={24}
										className="text-gray-700"
									/>
								</div>
							</div>

							<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
								<div>
									<h3 className="text-gray-500 text-sm uppercase tracking-wide font-medium">
										Following
									</h3>
									<div className="flex items-center gap-1.5 mt-1">
										<UserPlus
											size={18}
											className="text-gray-700"
										/>
										<span className="text-2xl font-bold">
											{profile.following.length}
										</span>
									</div>
								</div>
								<div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
									<UserPlus
										size={24}
										className="text-gray-700"
									/>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
							<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
								<div>
									<h3 className="text-gray-500 text-sm uppercase tracking-wide font-medium">
										Avg Quiz Score
									</h3>
									<div className="flex items-center gap-1.5 mt-1">
										<Target
											size={18}
											className="text-gray-700"
										/>
										<span className="text-2xl font-bold">
											{formattedQuizScore}
										</span>
										<span className="text-sm text-gray-500 self-end mb-1">
											/10
										</span>
									</div>
								</div>
								<div className="relative h-14 w-14">
									<div className="absolute inset-0 rounded-full bg-gray-100 flex items-center justify-center">
										<svg
											className="w-full h-full"
											viewBox="0 0 36 36"
										>
											<circle
												cx="18"
												cy="18"
												r="16"
												fill="none"
												className="stroke-gray-200"
												strokeWidth="3"
											></circle>
											<circle
												cx="18"
												cy="18"
												r="16"
												fill="none"
												className="stroke-black"
												strokeWidth="3"
												strokeDasharray={`${
													(profile.avg_quiz_score /
														10) *
													100
												} 100`}
												strokeDashoffset="25"
												transform="rotate(-90 18 18)"
											></circle>
											<text
												x="18"
												y="20"
												textAnchor="middle"
												className="text-xs font-bold"
											>
												{formattedQuizScore}
											</text>
										</svg>
									</div>
								</div>
							</div>

							<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
								<div>
									<h3 className="text-gray-500 text-sm uppercase tracking-wide font-medium">
										Current Streak
									</h3>
									<div className="flex items-center gap-1.5 mt-1">
										<Flame
											size={18}
											className="text-gray-700"
										/>
										<span className="text-2xl font-bold">
											{profile.currentStreak || 0}
										</span>
										<span className="text-sm text-gray-500 self-end mb-1">
											days
										</span>
									</div>
								</div>
								<div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
									<Flame
										size={24}
										className={
											profile.currentStreak > 0
												? "text-gray-700"
												: "text-gray-400"
										}
									/>
								</div>
							</div>

							<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
								<div>
									<h3 className="text-gray-500 text-sm uppercase tracking-wide font-medium">
										Best Streak
									</h3>
									<div className="flex items-center gap-1.5 mt-1">
										<Medal
											size={18}
											className="text-gray-700"
										/>
										<span className="text-2xl font-bold">
											{profile.maxStreak || 0}
										</span>
										<span className="text-sm text-gray-500 self-end mb-1">
											days
										</span>
									</div>
								</div>
								<div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
									<Medal
										size={24}
										className={
											profile.maxStreak > 0
												? "text-gray-700"
												: "text-gray-400"
										}
									/>
								</div>
							</div>
						</div>

						<div className="mb-10">
							<h2 className="text-xl font-semibold mb-5 flex items-center border-b pb-3">
								<BookOpen className="mr-2" strokeWidth={2} />
								<span>Learning Roadmaps</span>
							</h2>

							<div className="space-y-4">
								{roadmaps.length > 0 ? (
									roadmaps.map((roadmap) => (
										<RoadmapDetails
											key={roadmap._id}
											roadmap={roadmap}
										/>
									))
								) : (
									<div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
										<BookOpen
											size={48}
											className="mx-auto text-gray-400 mb-2"
										/>
										<p className="text-gray-500">
											No roadmaps available
										</p>
									</div>
								)}
							</div>

							{pagination.roadmaps.hasMore && (
								<div className="mt-6 text-center">
									<button
										onClick={loadMoreRoadmaps}
										className="px-6 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto"
									>
										<ChevronDown size={18} />
										Load More Roadmaps
									</button>
								</div>
							)}
						</div>

						<div className="mb-8">
							<h2 className="text-xl font-semibold mb-5 flex items-center border-b pb-3">
								<Star className="mr-2" strokeWidth={2} />
								<span>Posts</span>
							</h2>

							<div className="space-y-6">
								{posts.length > 0 ? (
									posts.map((post) => (
										<PostItem key={post._id} post={post} />
									))
								) : (
									<div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
										<Star
											size={48}
											className="mx-auto text-gray-400 mb-2"
										/>
										<p className="text-gray-500">
											No posts available
										</p>
									</div>
								)}
							</div>

							{pagination.posts.hasMore && (
								<div className="mt-6 text-center">
									<button
										onClick={loadMorePosts}
										className="px-6 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto"
									>
										<ChevronDown size={18} />
										Load More Posts
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PublicProfile;