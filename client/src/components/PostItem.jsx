import React from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, TagIcon } from "lucide-react";
import { formatDate, formatNumber, getAttachmentUrl } from "../utils/helpers";

export const renderImageGrid = (attachments) => {
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
					className="rounded-lg w-[40%] max-h-80 object-cover"
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

const PostItem = ({ post, user, handleVote }) => {
	return (
		<div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200 hover:shadow-md transition">
			<div className="flex items-start">
				<img
					src={
						post.author?.profileImage ||
						"https://picsum.photos/seed/author/100"
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
						<span className="text-gray-500 text-sm">
							{formatDate(post.createdAt)}
						</span>
					</div>

					<h2 className="text-xl font-bold text-black mt-2">
						{post.title}
					</h2>
				</div>
			</div>

			<div className="mt-4 text-black text-lg">{post.description}</div>

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

			{renderImageGrid(post.attachments)}

			<div className="flex items-center mt-6 space-x-8">
				<div className="flex items-center space-x-2">
					<button
						onClick={() => handleVote(post._id, "upvote")}
						className="p-1.5 hover:bg-gray-100 rounded-full transition"
					>
						<ThumbsUp size={20} className="text-black" />
					</button>
					<span className="text-black font-medium">
						{formatNumber(post.upvotes)}
					</span>
					<button
						onClick={() => handleVote(post._id, "downvote")}
						className="p-1.5 hover:bg-gray-100 rounded-full transition"
					>
						<ThumbsDown size={20} className="text-black" />
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
	);
};

export default PostItem;