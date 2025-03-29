import React from "react";
import {
	ThumbsUp,
	ThumbsDown,
	MessageSquare,
	Share2,
	TagIcon,
} from "lucide-react";
import { formatDate, formatNumber, getAttachmentUrl } from "../utils/helpers";
import useAuthContext from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PreviewImage from "./PreviewImage";
export const renderImageGrid = (attachments, onImageClick) => {
	if (!attachments || attachments.length === 0) return null;
	
	const images = attachments.map((attachment) =>
		typeof attachment === "string" && attachment.startsWith("http")
			? attachment
			: getAttachmentUrl(attachment)
	);

	if (images.length === 1) {
		return (
			<div className="mt-4">
				<img
					src={images[0]}
					alt="Post content"
					className="rounded-lg w-[40%] max-h-80 object-cover cursor-pointer hover:opacity-95 transition"
					onClick={() => onImageClick(0)}
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
						className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-95 transition"
						onClick={() => onImageClick(0)}
					/>
					<div className="relative">
						<img
							src={images[1]}
							alt="Post content"
							className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-95 transition"
							onClick={() => onImageClick(1)}
						/>
						{images.length > 2 && (
							<div
								className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg cursor-pointer hover:bg-opacity-60 transition"
								onClick={() => onImageClick(1)}
							>
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

const PostItem = ({ post, handleVote }) => {
	const navigate = useNavigate();
	const { state } = useAuthContext();
	const { user } = state;
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewIndex, setPreviewIndex] = useState(0);

	const handleImageClick = (index) => {
		setPreviewIndex(index);
		setPreviewOpen(true);
	};
	
	const images =
		post.attachments?.map((attachment) =>
			typeof attachment === "string" && attachment.startsWith("http")
				? attachment
				: getAttachmentUrl(attachment)
		) || [];
	return (
		<>
			<div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200 hover:shadow-md transition">
				<div className="flex items-start flex-wrap">
					<img
						src={
							post.author?.profileImage ||
							`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
								post.author?.name || "Anonymous"
							)}`
						}
						alt={post.author?.name || "Anonymous"}
						onClick={() =>
							navigate(`/public-profile/${post.author?._id}`)
						}
						className="w-12 h-12 rounded-full mr-4 cursor-pointer"
					/>
					<div className="flex-1">
						<div className="flex items-center space-x-2">
							<span
								className="font-medium text-black cursor-pointer"
								onClick={() =>
									navigate(
										`/public-profile/${post.author?._id}`
									)
								}
							>
								{post.author?.name || "Anonymous"}
							</span>
							<span className="text-gray-500 text-sm">in</span>
							<span
								className="text-black font-medium cursor-pointer"
								onClick={() =>
									navigate(
										`/community/${post.community?._id}`
									)
								}
							>
								{post.community?.name || "General"}
							</span>
							<span className="text-gray-500 text-sm">
								{formatDate(post.createdAt)}
							</span>
						</div>

						<h2
							onClick={() => navigate(`/post/${post._id}`)}
							className="text-xl cursor-pointer font-bold text-black mt-2"
						>
							{post.title}
						</h2>
					</div>
				</div>

				<div className="mt-4 text-black text-lg">
					{post.description}
				</div>

				<div className="flex flex-wrap mt-4 gap-2">
					{post.tags &&
						post.tags
							.filter((tag) => tag)
							.map((tag) => (
								<span
									key={tag}
									className="px-3 py-1.5 bg-gray-100 text-black text-sm rounded-md flex items-center hover:bg-gray-200 transition cursor-pointer"
								>
									<TagIcon size={14} className="mr-1.5" />
									{tag}
								</span>
							))}
				</div>

				{renderImageGrid(post.attachments, handleImageClick)}

				<div className="flex items-center flex-wrap mt-6 space-x-8">
					<div className="flex items-center space-x-2">
						<button
							onClick={() => handleVote(post._id, "upvote")}
							className="p-1.5 hover:bg-gray-100 rounded-full transition"
						>
							{/* <ThumbsUp size={20} className="text-black" /> */}
							{post.upvotes.includes(user._id) ? (
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
							{/* <ThumbsDown size={20} className="text-black" /> */}
							{post.downvotes.includes(user._id) ? (
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

					<button
						className="flex cursor-pointer items-center space-x-2 text-black hover:bg-gray-100 py-1.5 px-3 rounded-md transition"
						onClick={() => navigate(`/post/${post._id}`)}
					>
						<MessageSquare size={20} />
						<span>{formatNumber(post.comments)} Comments</span>
					</button>

					<button
									  onClick={() => {
										const url = window.location.href;
										navigator.clipboard.writeText(url);
										alert("Community link copied to clipboard!");
									  }}
									  className="flex items-center text-l text-gray-700 hover:text-black transition-colors"
									>
									  <Share2 size={16} className="mr-2" />
									  <span>Share </span>
									</button>
				</div>
			</div>
			{previewOpen && images.length > 0 && (
				<PreviewImage
					images={images}
					initialIndex={previewIndex}
					onClose={() => setPreviewOpen(false)}
				/>
			)}
		</>
	);
};

export default PostItem;
