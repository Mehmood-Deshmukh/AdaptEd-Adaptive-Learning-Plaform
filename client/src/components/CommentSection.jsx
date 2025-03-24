import React, { useState, useEffect } from "react";
import useAuthContext from "../hooks/useAuthContext";
import {
	MessageSquare,
	Reply,
	ChevronDown,
	ChevronUp,
	Send,
	X,
	Clock,
	User,
} from "lucide-react";

const CommentSection = ({ postId }) => {
	const { state } = useAuthContext();
	const { user } = state;

	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [replyingTo, setReplyingTo] = useState(null);
	const [replyingToComment, setReplyingToComment] = useState(null);
	const [openReplies, setOpenReplies] = useState({});
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

	const fetchComments = async (reset = false) => {
		try {
			setLoading(true);
			const newPage = reset ? 1 : page;
			const response = await fetch(
				`${BACKEND_URL}/api/comment/${postId}?page=${newPage}&limit=10`
			);

			if (response.status === 204) {
				setComments([]);
				setHasMore(false);
			} else {
				const data = await response.json();
				const newComments = data.data;
				setComments(
					reset ? newComments : [...comments, ...newComments]
				);
				setHasMore(newComments.length === 10);
			}

			if (reset) setPage(1);
			setLoading(false);
		} catch (err) {
			setError("Failed to load comments");
			setLoading(false);
		}
	};

	const loadMoreComments = () => {
		setPage((prev) => prev + 1);
	};

	const fetchReplies = async (commentId) => {
		try {
			const response = await fetch(
				`${BACKEND_URL}/api/comment/replies/${commentId}?page=1&limit=5`
			);

			if (response.ok) {
				const data = await response.json();
				if (data && data.data) {
					return data.data;
				}
			}
			return [];
		} catch (err) {
			console.error("Error fetching replies:", err);
			return [];
		}
	};

	const toggleReplies = async (commentId) => {
		const updatedOpenReplies = { ...openReplies };

		if (!updatedOpenReplies[commentId]) {
			const replies = await fetchReplies(commentId);
			updatedOpenReplies[commentId] = {
				visible: true,
				replies: replies,
				page: 1,
				hasMore: replies.length === 5,
			};
		} else {
			updatedOpenReplies[commentId].visible =
				!updatedOpenReplies[commentId].visible;
		}

		setOpenReplies(updatedOpenReplies);
	};

	const loadMoreReplies = async (commentId) => {
		try {
			const currentRepliesData = openReplies[commentId];
			const nextPage = currentRepliesData.page + 1;

			const response = await fetch(
				`${BACKEND_URL}/api/comment/replies/${commentId}?page=${nextPage}&limit=5`
			);

			if (response.ok) {
				const data = await response.json();
				if (data && data.data) {
					const newReplies = data.data;
					const updatedOpenReplies = { ...openReplies };

					updatedOpenReplies[commentId] = {
						...currentRepliesData,
						replies: [...currentRepliesData.replies, ...newReplies],
						page: nextPage,
						hasMore: newReplies.length === 5,
					};

					setOpenReplies(updatedOpenReplies);
				}
			}
		} catch (err) {
			console.error("Error loading more replies:", err);
		}
	};

	const startReply = (commentId, commentText, authorName) => {
		setReplyingTo(commentId);
		setReplyingToComment({
			id: commentId,
			text: commentText,
			author: authorName,
		});
	};

	const cancelReply = () => {
		setReplyingTo(null);
		setReplyingToComment(null);
	};


	const submitComment = async (e) => {
		e.preventDefault();

		if (!newComment.trim()) return;

		try {
			const payload = {
				author: user._id,
				message: newComment,
				postId: postId,
				replyingTo: replyingTo,
			};

			const response = await fetch(`${BACKEND_URL}/api/comment/create`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				setNewComment("");
				setReplyingTo(null);
				setReplyingToComment(null);

				if (replyingTo && openReplies[replyingTo]) {
					const refreshedReplies = await fetchReplies(replyingTo);
					setOpenReplies({
						...openReplies,
						[replyingTo]: {
							...openReplies[replyingTo],
							replies: refreshedReplies,
							visible: true, // Ensure replies are visible
							page: 1,
							hasMore: refreshedReplies.length === 5,
						},
					});
				} else if (replyingTo) {
					// This is a new reply to a comment that doesn't have the replies open yet
					const refreshedReplies = await fetchReplies(replyingTo);
					setOpenReplies({
						...openReplies,
						[replyingTo]: {
							replies: refreshedReplies,
							visible: true, // Make sure replies are visible
							page: 1,
							hasMore: refreshedReplies.length === 5,
						},
					});
				} else {
					fetchComments(true);
				}
			} else {
				setError("Failed to post comment");
			}
		} catch (err) {
			setError("Failed to post comment", err.message);
		}
	};

	useEffect(() => {
		fetchComments(true);
	}, [postId]);

	useEffect(() => {
		if (page > 1) {
			fetchComments();
		}
	}, [page]);

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};
	const CommentItem = ({ comment, isReply = false, depth = 0 }) => {
		const nestedReply = depth >= 10;
		const isNested = depth > 0;

		return (
			<div
				className={`
        ${
			isReply
				? nestedReply
					? "ml-2 border-l border-gray-200 pl-4"
					: "ml-8"
				: "mt-6"
		}
        ${isNested ? "pt-4 pb-2" : "py-6"}
        ${!isNested ? "border-t border-gray-100" : ""}
        group
      `}
			>
				<div className="flex items-start space-x-3">
					<div className="flex-shrink-0">
						<div
							className={`
              rounded-full p-2
              ${
					isNested
						? "bg-gray-50 text-gray-500"
						: "bg-gray-100 text-gray-600"
				}
            `}
						>
							<User size={isNested ? 14 : 16} />
						</div>
					</div>

					<div className="flex-grow min-w-0">
						<div className="flex items-baseline space-x-2">
							<span className="font-medium text-gray-900 text-sm">
								{comment.author?.name || "Anonymous"}
							</span>
							<span className="flex items-center text-xs text-gray-500">
								<Clock size={12} className="mr-1" />
								{formatDate(comment.createdAt)}
							</span>
						</div>

						<div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
							{comment.message}
						</div>

						<div className="mt-3 flex items-center space-x-4">
							<button
								onClick={() =>
									startReply(
										comment._id,
										comment.message,
										comment.author?.name || "Anonymous"
									)
								}
								className="flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors"
							>
								<Reply size={13} className="mr-1" />
								Reply
							</button>

							{!nestedReply && comment.repliesCount > 0 && (
								<button
									onClick={() => toggleReplies(comment._id)}
									className="flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors"
								>
									<MessageSquare size={13} className="mr-1" />
									{openReplies[comment._id]?.visible ? (
										<>
											Hide replies
											<ChevronUp
												size={13}
												className="ml-1"
											/>
										</>
									) : (
										<>
											{comment.repliesCount}{" "}
											{comment.repliesCount === 1
												? "reply"
												: "replies"}
											<ChevronDown
												size={13}
												className="ml-1"
											/>
										</>
									)}
								</button>
							)}
						</div>

						{openReplies[comment._id]?.visible && (
							<div
								className={`
                mt-4 space-y-2 
                ${
					depth > 0
						? "border-l border-gray-100 pl-4"
						: "border-l border-gray-200 pl-6"
				}
              `}
							>
								{openReplies[comment._id].replies.map(
									(reply) => (
										<CommentItem
											key={reply._id}
											comment={reply}
											isReply={true}
											depth={depth + 1}
										/>
									)
								)}

								{openReplies[comment._id].hasMore && (
									<button
										onClick={() =>
											loadMoreReplies(comment._id)
										}
										className="flex items-center text-xs text-gray-500 hover:text-gray-900 py-2"
									>
										<ChevronDown
											size={13}
											className="mr-1"
										/>
										Show more replies
									</button>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="w-full mt-8 max-w-7xl mx-auto bg-white rounded-xl border border-gray-200 divide-gray-100">
			<div className="p-6">
				<h3 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
					<MessageSquare className="mr-2" size={18} />
					Comments
				</h3>

				<form onSubmit={submitComment} className="mb-8">
					<div className="space-y-3">
						{replyingToComment && (
							<div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
								<div className="flex justify-between items-center mb-2">
									<span className="flex items-center text-sm text-gray-700">
										<Reply size={14} className="mr-1" />
										Replying to {replyingToComment.author}
									</span>
									<button
										onClick={cancelReply}
										className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
										aria-label="Cancel reply"
									>
										<X size={14} />
									</button>
								</div>
								<div className="text-xs text-gray-500 pl-2 border-l-2 border-gray-200">
									{replyingToComment.text.length > 100
										? `${replyingToComment.text.substring(
												0,
												100
										  )}...`
										: replyingToComment.text}
								</div>
							</div>
						)}

						<textarea
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							placeholder="Share your thoughts..."
							className="w-full border border-gray-200 rounded-lg p-4 text-sm min-h-[120px] focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 placeholder-gray-400"
							required
						/>
					</div>

					<div className="flex justify-end mt-3">
						<button
							type="submit"
							className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-black focus:outline-none transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={!newComment.trim()}
						>
							<Send size={14} className="mr-2" />
							{replyingTo ? "Post Reply" : "Post Comment"}
						</button>
					</div>
				</form>

				{error && (
					<div className="text-red-600 mb-6 text-sm p-3 bg-red-50 rounded-lg border border-red-100">
						{error}
					</div>
				)}

				{comments.length === 0 && !loading ? (
					<div className="text-center text-gray-500 py-12">
						<MessageSquare
							size={28}
							className="mx-auto mb-3 text-gray-400"
						/>
						<p>
							No comments yet. Be the first to share your
							thoughts!
						</p>
					</div>
				) : (
					<div className="divide-gray-100">
						{comments.map((comment) => (
							<CommentItem key={comment._id} comment={comment} />
						))}

						{hasMore && (
							<button
								onClick={loadMoreComments}
								className="mt-4 w-full py-3 text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center transition-colors"
								disabled={loading}
							>
								{loading ? (
									"Loading..."
								) : (
									<>
										<ChevronDown
											size={16}
											className="mr-2"
										/>
										Load more comments
									</>
								)}
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default CommentSection;
