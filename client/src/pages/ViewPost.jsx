import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	ThumbsUp,
	ThumbsDown,
	MessageSquare,
	Share2,
	TagIcon,
	Calendar,
} from "lucide-react";
import useAuthContext from "../hooks/useAuthContext";
import Sidebar from "../components/Sidebar";
import CommentSection from "../components/CommentSection";

const PostDisplay = () => {
	const [post, setPost] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { id } = useParams();
	const { state } = useAuthContext();
	const { user } = state;
	const [startTime, setStartTime] = useState(null);
	const navigate = useNavigate();

	const backendUrl = import.meta.env.VITE_BACKEND_URL;

	const formatDate = (dateString) => {
		const options = { year: "numeric", month: "short", day: "numeric" };
		return new Date(dateString).toLocaleDateString("en-US", options);
	};

	const formatNumber = (arr) => {
		if (!arr) return 0;
		return arr.length;
	};

	const getAttachmentUrl = (attachmentId) => {
		return `${backendUrl}/api/attachments/${attachmentId}`;
	};

	const handleVote = async (postId, type) => {
		if (!user) {
			console.log("Please log in to vote");
			return;
		}

		if (type === "upvote") {
			if (post.upvotes.includes(user._id)) {
				return;
			}

			const updatedPost = { ...post };

			if (post.downvotes.includes(user._id)) {
				updatedPost.downvotes = post.downvotes.filter(
					(id) => id !== user._id
				);
			}

			updatedPost.upvotes = [...post.upvotes, user._id];

			setPost(updatedPost);

			try {
				const response = await fetch(`${backendUrl}/api/post/upvote`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem(
							"token"
						)}`,
					},
					body: JSON.stringify({ postId, userId: user._id }),
				});

				const data = await response.json();
				if (data.success) {
					console.log("Post upvoted successfully");

					const res = await fetch (`${import.meta.env.VITE_BACKEND_URL}/api/engagement/record`, {
						method: "POST",
						body: JSON.stringify({
							communityId: post.community._id,
							postId: postId,
							userId: user._id,
							action: "UPVOTE_POST"
						}),
						headers: {
							"Authorization": `Bearer ${localStorage.getItem("token")}`,
							"Content-Type": "application/json"
						}
					});

					if (res.ok) {
						console.log("engagement recorded successfully!");
					}
					else {
						console.log("Failed to record engagement");
					}

				} else {
					console.log("Error upvoting post");
					setPost(post);
				}
			} catch (e) {
				console.error("Error upvoting post:", e);
				setPost(post);
			}
		} else {
			if (post.downvotes.includes(user._id)) {
				return;
			}

			const updatedPost = { ...post };

			if (post.upvotes.includes(user._id)) {
				updatedPost.upvotes = post.upvotes.filter(
					(id) => id !== user._id
				);
			}

			updatedPost.downvotes = [...post.downvotes, user._id];

			setPost(updatedPost);

			try {
				const response = await fetch(
					`${backendUrl}/api/post/downvote`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${localStorage.getItem(
								"token"
							)}`,
						},
						body: JSON.stringify({ postId, userId: user._id }),
					}
				);

				const data = await response.json();
				if (data.success) {
					console.log("Post downvoted successfully");

					const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/engagement/record`, {
						method: "POST",
						body: JSON.stringify({
							communityId: post.community._id,
							postId: postId,
							userId: user._id,
							action: "DOWNVOTE_POST"
						}),
						headers: {
							"Authorization": `Bearer ${localStorage.getItem("token")}`,
							"Content-Type": "application/json"
						}

					});

					if (res.ok) {
						console.log("engagement recorded successfully!");
					}
					else {
						console.log("Failed to record engagement");
					}

				} else {
					console.log("Error downvoting post");
					setPost(post);
				}
			} catch (e) {
				console.error("Error downvoting post:", e);
				setPost(post);
			}
		}
	};

	const renderImageGrid = (attachments) => {
		if (!attachments || attachments.length === 0) return null;

		const images = attachments.map((attachment) =>
			getAttachmentUrl(attachment)
		);

		if (images.length === 1) {
			return (
				<div className="mt-4">
					<img
						src={images[0]}
						alt="Post content"
						className="rounded-lg w-full md:w-[40%] max-h-80 object-cover"
					/>
				</div>
			);
		}

		if (images.length > 1) {
			return (
				<div className="mt-4">
					<div className="grid grid-cols-2 gap-2">
						<img
							src={images[0]}
							alt="Post content"
							className="rounded-lg w-full h-48 object-cover"
						/>
						<div className="relative">
							<img
								src={images[1]}
								alt="Post content"
								className="rounded-lg w-full h-48 object-cover"
							/>
							{images.length > 2 && (
								<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
									<div className="text-white font-bold text-2xl">
										+{images.length - 2}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			);
		}
	};

	useEffect(() => {
		const fetchPost = async () => {
			try {
				setLoading(true);
				setStartTime(Date.now());
				const response = await fetch(`${backendUrl}/api/post/${id}`);

				if (!response.ok) {
					throw new Error("Failed to fetch post");
				}

				const data = await response.json();
				setPost(data.data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchPost();
	}, [id, backendUrl]);

	async function handleBack() {
		const timeSpent = Math.floor((Date.now() - startTime) / 1000);

		const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/engagement/record`, {
			method: "POST",
			body: JSON.stringify({
				communityId: post.community._id,
				postId: id,
				userId: user._id,
				action: "VIEW_POST",
				timeSpent: timeSpent
			}),
			headers: {
				"Authorization" : `Bearer ${localStorage.getItem("token")}`,
				"Content-Type": "application/json"
			}
		});

		if (res.ok) {
			console.log("engagement recorded successfully!");
		}
		else {
			console.log("Failed to record engagement");
		}
		navigate("/forum");
	}

	const renderContent = () => {
		if (loading) {
			return (
				<div className="flex items-center justify-center min-h-screen bg-gray-50">
					<div className="p-4 text-gray-700">Loading post...</div>
				</div>
			);
		}

		if (error) {
			return (
				<div className="flex items-center justify-center min-h-screen bg-gray-50">
					<div className="p-4 text-red-500">Error: {error}</div>
				</div>
			);
		}

		if (!post) {
			return (
				<div className="flex items-center justify-center min-h-screen bg-gray-50">
					<div className="p-4 text-gray-700">Post not found</div>
				</div>
			);
		}

		return (
			<div className="max-w-6xl mx-auto my-8">
				<button
					onClick={handleBack}
					className="mb-4 px-4 py-2 bg-black text-white rounded-md hover:bg-slate-700 transition cursor-pointer"
				>
					Back to Forum
				</button>
				<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
					<div className="flex items-start">
						<img
							src={
								post.author?.profileImage ||
								`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
									post.author?.name || "Anonymous"
								)}`
							}
							alt={post.author?.name || "Anonymous"}
							className="w-12 h-12 rounded-full mr-4"
						/>
						<div className="flex-1">
							<div className="flex items-center space-x-2">
								<span className="font-medium text-black">
									{post.author?.name || "Anonymous"}
								</span>
								<span className="text-gray-500 text-sm">in</span>
								<span className="text-black font-medium">
									{post.community?.name || "General"}
								</span>
								<span className="text-gray-500 text-sm flex items-center">
									<Calendar size={14} className="mr-1" />
									{formatDate(post.createdAt)}
								</span>
							</div>
							<h1 className="text-xl font-bold text-black mt-2">
								{post.title}
							</h1>
						</div>
					</div>

					<div className="mt-4 text-black text-lg whitespace-pre-line">
						{post.description}
					</div>

					{post.tags && post.tags.length > 0 && post.tags[0] !== "" && (
						<div className="flex flex-wrap mt-4 gap-2">
							{post.tags.map((tag, index) => (
								<span
									key={index}
									className="px-3 py-1.5 bg-gray-100 text-black text-sm rounded-md flex items-center hover:bg-gray-200 transition cursor-pointer"
								>
									<TagIcon size={14} className="mr-1.5" />
									{tag}
								</span>
							))}
						</div>
					)}

					{renderImageGrid(post.attachments)}

					<div className="flex items-center mt-6 space-x-8">
						<div className="flex items-center space-x-2">
							<button
								onClick={() => handleVote(post._id, "upvote")}
								className="p-1.5 hover:bg-gray-100 rounded-full transition"
							>
								{post.upvotes.includes(user?._id) ? (
									<ThumbsUp size={20} className="text-blue-500" />
								) : (
									<ThumbsUp size={20} className="text-black" />
								)}
							</button>
							<span className="text-black font-medium">
								{formatNumber(post.upvotes)}
							</span>
							<button
								onClick={() => handleVote(post._id, "downvote")}
								className="p-1.5 hover:bg-gray-100 rounded-full transition"
							>
								{post.downvotes.includes(user?._id) ? (
									<ThumbsDown
										size={20}
										className="text-red-500"
									/>
								) : (
									<ThumbsDown size={20} className="text-black" />
								)}
							</button>
							<span className="text-black font-medium">
								{formatNumber(post.downvotes)}
							</span>
						</div>

						<button className="flex items-center space-x-2 text-black hover:bg-gray-100 py-1.5 px-3 rounded-md transition">
							<MessageSquare size={20} />
							<span>{formatNumber(post.comments)} Comments</span>
						</button>

						<button className="flex items-center space-x-2 text-black hover:bg-gray-100 py-1.5 px-3 rounded-md transition">
							<Share2 size={20} />
							<span>Share</span>
						</button>
					</div>
				</div>
				<CommentSection postId={id} />
			</div>
		);
	};

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar user={user} />
			<div className="flex-1 overflow-auto">
				{renderContent()}
			</div>
		</div>
	);
};

export default PostDisplay;