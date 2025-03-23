import React, { useState, useEffect } from "react";
import useAuthContext from "../hooks/useAuthContext";
import Sidebar from "../components/Sidebar";
import PostItem from "../components/PostItem";
import PostSkeleton from "../components/PostSkeleton";
import CommunitiesSidebar from "../components/CommunitiesSidebar";
import TrendingTopics from "../components/TrendingTopics";
import ForumHeader from "../components/ForumHeader";
import CreateCommunityModal from "../components/CreateCommunityModal";
import { placeholderCommunities, placeholderPosts, tags } from "../utils/lib";

const Forum = () => {
	const { state, dispatch } = useAuthContext();
	const { user } = state;
	const [activeTag, setActiveTag] = useState("All");
	const [loading, setLoading] = useState(true);
	const [posts, setPosts] = useState([]);
	const [communities, setCommunities] = useState([]);
	const [createCommunityModalOpen, setCreateCommunityModalOpen ] = useState(false);

	const handlePostVote = async (postId, type) => {
		if (type == "upvote") {
			if (
				posts
					.find((post) => post._id === postId)
					.upvotes.includes(user?._id)
			) {
				return;
			}

			// remove downvote if already downvoted
			if (
				posts
					.find((post) => post._id === postId)
					.downvotes.includes(user?._id)
			) {
				setPosts((prevPosts) =>
					prevPosts.map((post) =>
						post._id === postId
							? {
									...post,
									downvotes: post.downvotes.filter(
										(id) => id !== user?._id
									),
							  }
							: post
					)
				);
			}

			// add upvote
			setPosts((prevPosts) =>
				prevPosts.map((post) =>
					post._id === postId
						? {
								...post,
								upvotes: [...post.upvotes, user?._id],
						  }
						: post
				)
			);

			try {
				const response = await fetch(
					`${import.meta.env.VITE_BACKEND_URL}/api/post/upvote`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${localStorage.getItem(
								"token"
							)}`,
						},
						body: JSON.stringify({ postId, userId: user?._id }),
					}
				);
				const data = await response.json();
				if (data.success) {
					console.log("Post upvoted successfully");
				} else {
					console.log("Error upvoting post");
				}
			} catch (e) {
				console.error("Error upvoting post:", e);
			}
		} else {
			if (
				posts
					.find((post) => post._id === postId)
					.downvotes.includes(user?._id)
			) {
				return;
			}

			// remove upvote if already upvoted
			if (
				posts
					.find((post) => post._id === postId)
					.upvotes.includes(user?._id)
			) {
				setPosts((prevPosts) =>
					prevPosts.map((post) =>
						post._id === postId
							? {
									...post,
									upvotes: post.upvotes.filter(
										(id) => id !== user?._id
									),
							  }
							: post
					)
				);
			}

			// add downvote
			setPosts((prevPosts) =>
				prevPosts.map((post) =>
					post._id === postId
						? {
								...post,
								downvotes: [...post.downvotes, user?._id],
						  }
						: post
				)
			);

			try {
				const response = await fetch(
					`${import.meta.env.VITE_BACKEND_URL}/api/post/downvote`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${localStorage.getItem(
								"token"
							)}`,
						},
						body: JSON.stringify({ postId, userId: user?._id }),
					}
				);
				const data = await response.json();
				if (data.success) {
					console.log("Post downvoted successfully");
				} else {
					console.log("Error downvoting post");
				}
			} catch (e) {
				console.error("Error downvoting post:", e);
			}
		}
	};

	const fetchPosts = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/post/?page=1&limit=5`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem(
							"token"
						)}`,
					},
				}
			);
			const data = await response.json();

			if (data.success && data.data.length > 0) {
				setPosts(data.data);
			} else {
				setPosts(placeholderPosts);
			}
		} catch (e) {
			console.error("Error fetching posts:", e);
			setPosts(placeholderPosts);
		} finally {
			setLoading(false);
		}
	};

	const fetchCommunities = async () => {
		try {
			const response = await fetch(
				`${
					import.meta.env.VITE_BACKEND_URL
				}/api/community/?page=1&limit=5`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem(
							"token"
						)}`,
					},
				}
			);
			const data = await response.json();
			if (data.success) {
				setCommunities(data.data);
			} else {
				setCommunities(placeholderCommunities);
			}
		} catch (e) {
			console.error("Error fetching communities:", e);
			setCommunities(placeholderCommunities);
		}
	};

	const handleJoinCommunity = async (communityId) => {
		try {
			const joinStatus = communities.find(
				(community) =>
					community.id === communityId ||
					community._id === communityId
			).joined;

			setCommunities(
				communities.map((community) =>
					community.id === communityId ||
					community._id === communityId
						? {
								...community,
								joined: !community.joined,
								membersCount: community.joined
									? community.membersCount - 1
									: community.membersCount + 1,
						  }
						: community
				)
			);

			if (!joinStatus) {
				// join the community if not already joined
				const response = await fetch(
					`${
						import.meta.env.VITE_BACKEND_URL
					}/api/user/join-community`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${localStorage.getItem(
								"token"
							)}`,
						},
						body: JSON.stringify({ communityId }),
					}
				);
				const data = await response.json();
				if (data.success) {
					console.log("Successfully joined community");
					const newUser = {
						...user,
						communities: [...user.communities, communityId],
					};
					dispatch({ type: "UPDATE_USER", payload: newUser });
				} else {
					console.log("Error joining community");
				}
			}

			// leave the community if already joined
			else {
				const response = await fetch(
					`${
						import.meta.env.VITE_BACKEND_URL
					}/api/user/leave-community`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${localStorage.getItem(
								"token"
							)}`,
						},
						body: JSON.stringify({ communityId }),
					}
				);
				const data = await response.json();
				if (data.success) {
					console.log("Successfully left community");
					const newUser = {
						...user,
						communities: user.communities.filter(
							(id) => id !== communityId
						),
					};
					dispatch({ type: "UPDATE_USER", payload: newUser });
				} else {
					console.log("Error leaving community");
				}
			}
		} catch (e) {
			console.error("Error joining community:", e);
		}
	};

	useEffect(() => {
		fetchPosts();
		fetchCommunities();
	}, []);

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar user={user} />

			<div className="flex-1 overflow-auto">
				<div className="max-w-8xl mx-auto px-6">
					<ForumHeader
						tags={tags}
						activeTag={activeTag}
						setActiveTag={setActiveTag}
					/>

					<div className="flex pt-6 gap-6">
						<div className="flex-1">
							{loading ? (
								<PostSkeleton />
							) : posts.length === 0 ? (
								<div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200 text-center">
									<p className="text-lg text-gray-500">
										No posts found
									</p>
								</div>
							) : (
								posts.map((post) => (
									<PostItem
										key={post._id}
										post={post}
										user={user}
										handleVote={handlePostVote}
									/>
								))
							)}
						</div>

						<div className="w-80">
							<CommunitiesSidebar
								communities={communities}
								handleJoinCommunity={handleJoinCommunity}
								user={state.user}
							/>
							<TrendingTopics />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Forum;
