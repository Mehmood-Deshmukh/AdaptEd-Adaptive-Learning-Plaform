import React, { useState, useEffect } from "react";
import useAuthContext from "../hooks/useAuthContext";
import Sidebar from "../components/Sidebar";
import PostItem from "../components/PostItem";
import PostSkeleton from "../components/PostSkeleton";
import CommunitiesSidebar from "../components/CommunitiesSidebar";
import TrendingTopics from "../components/TrendingTopics";
import ForumHeader from "../components/ForumHeader";
import CreateCommunityModal from "../components/CreateCommunityModal";
import { Link } from "react-router-dom";
import { placeholderCommunities, placeholderPosts, tags } from "../utils/lib";

const Forum = () => {
	const { state, dispatch } = useAuthContext();
	const { user } = state;
	const [activeTag, setActiveTag] = useState("All");
	const [loading, setLoading] = useState(true);
	const [posts, setPosts] = useState([]);
	const [communities, setCommunities] = useState([]);
	const [createCommunityModalOpen, setCreateCommunityModalOpen] = useState(false);

	// Pagination
	const [page, setPage] = useState(1);

	const [hasMore, setHasMore] = useState(true);


	const handlePostVote = async (postId, type) => {
		if (!user) return;

		const updatedPosts = posts.map((post) => {
			if (post._id === postId) {
				const hasUpvoted = post.upvotes.includes(user?._id);
				const hasDownvoted = post.downvotes.includes(user?._id);

				if (type === "upvote") {
					return {
						...post,
						upvotes: hasUpvoted
							? post.upvotes.filter((id) => id !== user?._id)
							: [...post.upvotes, user?._id],
						downvotes: hasDownvoted
							? post.downvotes.filter((id) => id !== user?._id)
							: post.downvotes
					};
				} else {
					return {
						...post,
						downvotes: hasDownvoted
							? post.downvotes.filter((id) => id !== user?._id)
							: [...post.downvotes, user?._id],
						upvotes: hasUpvoted
							? post.upvotes.filter((id) => id !== user?._id)
							: post.upvotes
					};
				}
			}
			return post;
		});

		setPosts(updatedPosts);
		try {
			const endpoint = type === "upvote" ? "upvote" : "downvote";
			await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/post/${endpoint}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify({ postId, userId: user?._id }),
				}
			);
		} catch (e) {
			console.error(`Error ${type}voting post:`, e);
		}
	};

	const fetchPosts = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/post/?page=${page}&limit=5`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			const data = await response.json();

			if (data.success && data.data.length > 0) {
				setPosts((prev) => [...prev, ...data.data]);
				setHasMore(data.data.length === 5); // If less than 5 posts, no more pages
			} else {
				setHasMore(false);
			}
		} catch (e) {
			console.error("Error fetching posts:", e);
			setPosts(placeholderPosts);
			setHasMore(false);
		} finally {
			setLoading(false);
		}
	};

	const fetchCommunities = async () => {
		console.log(localStorage.getItem("token"));

		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/community/?page=1&limit=5`,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
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

	const handleLoadMore = () => {
		setPage((prevPage) => prevPage + 1);
	};

	useEffect(() => {
		fetchPosts();
	}, [page]);

	useEffect(() => {
		fetchCommunities();
	}, []);

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar user={user} />

		{user?.xps > 2000 ? (<div className="flex-1 overflow-auto">
			<div className="max-w-8xl mx-auto px-6">
				<ForumHeader
					posts={posts}
					setPosts={setPosts}
					communities={communities}
					setCommunities={setCommunities}
					tags={tags}
					activeTag={activeTag}
					setActiveTag={setActiveTag}
				/>
					
				
				<div className="flex pt-6 gap-6">
					<div className="flex-1">
						{loading && page === 1 ? (
							<PostSkeleton />
						) : posts.length === 0 ? (
							<div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200 text-center">
								<p className="text-lg text-gray-500">
									No posts found
								</p>
							</div>
						) : (
							<>
								{posts.map((post) => (
									<PostItem
										key={post._id}
										post={post}
										user={user}
										handleVote={handlePostVote}
									/>
								))}
								{hasMore && (
									<div className="text-center mt-6">
										<button
											onClick={handleLoadMore}
											className="bg-black mb-5 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600 transition"
											disabled={loading}
										>
											{loading ? "Loading..." : "Load More"}
										</button>
									</div>
								)}
							</>
						)}
					</div>

					<div className="w-80 hidden sm:block">
						<CommunitiesSidebar
							communities={communities}
							user={user}
						/>
						<TrendingTopics />
					</div>
				</div>
			</div>
		</div>
) : (
<div className="h-screen w-screen flex justify-center items-center relative">
  {/* Background image */}
  <div 
    className="absolute inset-0 bg-cover object-fit bg-center bg-no-repeat"
    style={{ backgroundImage: "url('/backdrop.jpeg')" }}
  />

  {/* Blur overlay */}
  <div className="absolute inset-0 backdrop-blur-lg" />

  {/* Content */}
  <div className="relative z-10 bg-white bg-opacity-80 p-10 rounded-lg shadow-lg text-center">
    <p className="text-lg font-bold mb-3">You need more XP to access this section.</p>
    <p className="text-blue-800 underline">
      <Link to="/">Go back to Dashboard</Link>
    </p>
  </div>
</div>



  

)}
			
		</div>
	);
};

export default Forum;
