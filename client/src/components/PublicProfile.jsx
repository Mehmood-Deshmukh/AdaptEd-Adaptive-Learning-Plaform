import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import useAuthContext from "../hooks/useAuthContext";
import PostItem from "../components/PostItem";
import Sidebar from "./Sidebar";
import { FiChevronDown, FiChevronUp, FiBook, FiAward } from "react-icons/fi";
import UserBadge from "./UserBadge";
import RoadmapDetails from "./RoadmapDetails";
import XpCircle from "./XpCircle";

const PublicProfile = () => {
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
				`${import.meta.env.VITE_BACKEND_URL}/api/publicprofile/${userId}`
			);

			const roadmapsResponse = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/api/publicprofile/${userId}/roadmaps`,
				{
					params: { page: roadmapsPage, limit: 4 },
				}
			);

			const postsResponse = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/api/publicprofile/${userId}/posts`,
				{
					params: { page: postsPage, limit: 3 },
				}
			);

			setProfile(profileResponse.data.data);
			
			if (postsPage === 1) {
				setPosts(postsResponse.data.data.posts);
			} else {
				setPosts(prev => [...prev, ...postsResponse.data.data.posts]);
			}
			
			if (roadmapsPage === 1) {
				setRoadmaps(roadmapsResponse.data.data.roadmaps);
			} else {
				setRoadmaps(prev => [...prev, ...roadmapsResponse.data.data.roadmaps]);
			}

			setPagination({
				posts: {
					currentPage: postsResponse.data.data.currentPage,
					totalPages: postsResponse.data.data.totalPages,
					hasMore: postsResponse.data.data.currentPage < postsResponse.data.data.totalPages
				},
				roadmaps: {
					currentPage: roadmapsResponse.data.data.currentPage,
					totalPages: roadmapsResponse.data.data.totalPages,
					hasMore: roadmapsResponse.data.data.currentPage < roadmapsResponse.data.data.totalPages
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
		fetchPublicProfile(pagination.posts.currentPage + 1, pagination.roadmaps.currentPage);
	};

	const loadMoreRoadmaps = () => {
		fetchPublicProfile(pagination.posts.currentPage, pagination.roadmaps.currentPage + 1);
	};

	const handleFollow = async () => {
		try {
			dispatch({
				type: "UPDATE_FOLLOWING",
				payload: isFollowing
					? currentUser.following.filter((id) => id !== userId)
					: [...currentUser.following, userId],
			});

			setIsFollowing(!isFollowing);

			await axios.post(
				`${import.meta.env.VITE_BACKEND_URL}/api/follow/${userId}`
			);
		} catch (error) {
			console.error("Error following/unfollowing:", error);
			dispatch({
				type: "UPDATE_FOLLOWING",
				payload: isFollowing
					? [...currentUser.following, userId]
					: currentUser.following.filter((id) => id !== userId),
			});
			setIsFollowing((prev) => !prev);
		}
	};

	if (loading && !profile) {
		return (
			<div className="text-center py-12 text-gray-600">
				Loading profile...
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="text-center py-12 text-red-600">
				Profile not found
			</div>
		);
	}

	const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${profile.name}`;

	return (
		<div className="bg-white text-black min-h-screen flex h-[100vh]">
			<Sidebar user={currentUser} />
			<div className="max-w-5xl mx-auto flex-1 overflow-y-auto py-8 px-4 h-full">
				<div className="flex flex-col sm:flex-row items-center border-b pb-6 mb-6 gap-4">
					<div className="relative">
						<img
							src={avatarUrl}
							alt={`${profile.name}'s avatar`}
							className="w-20 h-20 rounded-full border-2 border-gray-300"
						/>
					</div>
					
					<div className="flex-grow text-center sm:text-left">
						<div className="flex flex-col sm:flex-row sm:items-center gap-2">
							<h1 className="text-3xl font-bold">{profile.name}</h1>
							<UserBadge level={profile.level} />
						</div>
						
						<div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2 text-gray-700">
							<span className="flex items-center">
								Followers: {profile.followers.length}
							</span>
							<span className="flex items-center">
								Following: {profile.following.length}
							</span>
						</div>
					</div>
					
					<div className="flex flex-col items-center gap-2">
						<XpCircle xp={profile.xps} />
						{currentUser && currentUser._id !== userId && (
							<button
								onClick={handleFollow}
								className={`px-4 py-2 rounded-md transition-colors w-full ${
									isFollowing
										? "bg-gray-500 text-white hover:bg-gray-600"
										: "bg-black text-white hover:bg-gray-800"
								}`}
							>
								{isFollowing ? "Unfollow" : "Follow"}
							</button>
						)}
					</div>
				</div>

				<div className="mb-10">
					<h2 className="text-xl font-semibold mb-3 flex items-center">
						<FiBook className="mr-2" /> Roadmaps
					</h2>
					<div className="space-y-4">
						{roadmaps.map((roadmap) => (
							<RoadmapDetails
								key={roadmap._id}
								roadmap={roadmap}
							/>
						))}
					</div>
					
					{pagination.roadmaps.hasMore && (
						<div className="mt-6 text-center">
							<button 
								onClick={loadMoreRoadmaps}
								className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
							>
								Load More Roadmaps
							</button>
						</div>
					)}
				</div>

				<div>
					<h2 className="text-xl font-semibold mb-3">Posts</h2>
					<div className="space-y-4">
						{posts.map((post) => (
							<PostItem key={post._id} post={post} />
						))}
					</div>
					
					{pagination.posts.hasMore && (
						<div className="mt-6 text-center">
							<button 
								onClick={loadMorePosts}
								className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
							>
								Load More Posts
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default PublicProfile;