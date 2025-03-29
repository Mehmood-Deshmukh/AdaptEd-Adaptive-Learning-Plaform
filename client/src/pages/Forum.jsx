import React, { useState, useEffect } from "react";
import useAuthContext from "../hooks/useAuthContext";
import Sidebar from "../components/Sidebar";
import PostItem from "../components/PostItem";
import PostSkeleton from "../components/PostSkeleton";
import CommunitiesSidebar from "../components/CommunitiesSidebar";
import TrendingTopics from "../components/TrendingTopics";
import ForumHeader from "../components/ForumHeader";
import { placeholderCommunities, placeholderPosts, tags } from "../utils/lib";

const Forum = () => {
	const { state, dispatch } = useAuthContext();
	const { user } = state;
	const [activeTag, setActiveTag] = useState("All");
	const [loading, setLoading] = useState(true);
	const [posts, setPosts] = useState([]);
	const [communities, setCommunities] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const fetchPosts = async (pageNum = 1) => {
		setLoading(true);
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/post/?page=${pageNum}&limit=5`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			const data = await response.json();

			if (data.success && data.data.length > 0) {
				setPosts((prevPosts) => [...prevPosts, ...data.data]);
				setHasMore(data.data.length === 5); // If less than 5 posts are fetched, no more posts available
			} else {
				setHasMore(false);
			}
		} catch (e) {
			console.error("Error fetching posts:", e);
		} finally {
			setLoading(false);
		}
	};

	const fetchCommunities = async () => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/community/?page=1&limit=5`,
				{
					headers: {
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

	const loadMorePosts = () => {
		setPage((prevPage) => prevPage + 1);
	};

	useEffect(() => {
		fetchPosts(page);
	}, [page]);

	useEffect(() => {
		fetchCommunities();
	}, []);

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar user={user} />

			<div className="flex-1 overflow-auto">
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
						<div className="flex-1 w-full">
							{loading && posts.length === 0 ? (
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
										/>
									))}

									{hasMore ? (
										<div className="flex justify-center mt-4">
											<button
												onClick={loadMorePosts}
												className="bg-black text-white px-5 py-3 mb-5 font-bold text-l rounded-lg hover:bg-gray-600 transition"
												disabled={loading}
											>
												{loading ? "Loading..." : "Load More"}
											</button>
										</div>
									) : (
										<div className="text-center mt-4 font-bold text-lg mb-5 text-gray-500">
											No more posts
										</div>
									)}
								</>
							)}
						</div>

						<div className="w-80">
							<CommunitiesSidebar
								communities={communities}
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
