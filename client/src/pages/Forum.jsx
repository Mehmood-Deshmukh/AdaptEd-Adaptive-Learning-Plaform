import React, { useState, useEffect } from "react";
import {
	BookOpen,
	Map,
	Flame,
	Trophy,
	Crown,
	LogOut,
	User,
	ThumbsUp,
	ThumbsDown,
	HomeIcon,
	Search,
	Plus,
	MessageSquare,
	Share2,
	Filter,
	TagIcon,
	Image,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import Sidebar from "../components/Sidebar";
import CreatePostModal from "../components/CreatePostModal";

const Forum = () => {
	const navigate = useNavigate();
	const { state, dispatch } = useAuthContext();
	const { user } = state;
	const [comments, setComments] = useState({});
	const [newComment, setNewComment] = useState("");
	const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
	const [activeTag, setActiveTag] = useState("All");
	const [loading, setLoading] = useState(true);

	const handleCommentSubmit = (postId) => {
		if (!newComment.trim()) return;
		setComments((prev) => ({
			...prev,
			[postId]: [...(prev[postId] || []), newComment],
		}));
		setNewComment("");
	};

	const handleVote = (postId, type) => {
		setPosts((prevPosts) =>
			prevPosts.map((post) =>
				post._id === postId
					? {
							...post,
							upvotes:
								type === "upvote"
									? [...post.upvotes, user?.id]
									: post.upvotes,
							downvotes:
								type === "downvote"
									? [...post.downvotes, user?.id]
									: post.downvotes,
					  }
					: post
			)
		);
	};

	const placeholderPosts = [
		{
			_id: "placeholder1",
			title: "How to style elements with Tailwind CSS?",
			description:
				"I'm new to Tailwind CSS and looking for best practices for styling components efficiently.",
			author: {
				_id: "placeuser1",
				name: "JohnDoe",
				profileImage: "https://picsum.photos/seed/john/100",
			},
			tags: ["CSS", "Tailwind", "Frontend"],
			upvotes: [],
			downvotes: [],
			comments: [],
			createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
			attachments: ["https://picsum.photos/seed/tailwind/1280"],
		},
		{
			_id: "placeholder2",
			title: "React performance optimization techniques",
			description:
				"What are some ways to optimize React applications for better performance?",
			author: {
				_id: "placeuser2",
				name: "JaneDoe",
				profileImage: "https://picsum.photos/seed/jane/100",
			},
			tags: ["React", "Performance", "JavaScript"],
			upvotes: [],
			downvotes: [],
			comments: [],
			createdAt: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
			attachments: [
				"https://picsum.photos/seed/react1/1280",
				"https://picsum.photos/seed/react2/1280",
			],
		},
		{
			_id: "placeholder3",
			title: "Building accessible forms - best practices",
			description:
				"I want to ensure my forms are accessible to all users. What are the current best practices for creating accessible forms?",
			author: {
				_id: "placeuser3",
				name: "AccessibilityAdvocate",
				profileImage: "https://picsum.photos/seed/accessibility/100",
			},
			tags: ["Accessibility", "HTML", "Forms"],
			upvotes: [],
			downvotes: [],
			comments: [],
			createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
			attachments: [
				"https://picsum.photos/seed/forms1/1280",
				"https://picsum.photos/seed/forms2/1280",
			],
		},
	];

	const [posts, setPosts] = useState([]);
	const [communities, setCommunities] = useState([]);

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

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now - date);
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
		const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
		const diffMinutes = Math.floor(diffTime / (1000 * 60));

		if (diffDays > 0) {
			return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
		} else if (diffHours > 0) {
			return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
		} else {
			return diffMinutes === 0
				? "just now"
				: `${diffMinutes} minutes ago`;
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
				setCommunities([
					{
						id: 1,
						name: "Web Development",
						membersCount: 15240,
						joined: false,
					},
					{
						id: 2,
						name: "React",
						membersCount: 12350,
						joined: true,
					},
					{
						id: 3,
						name: "JavaScript",
						membersCount: 24560,
						joined: false,
					},
					{
						id: 4,
						name: "UI/UX Design",
						membersCount: 9870,
						joined: false,
					},
					{
						id: 5,
						name: "Web Accessibility",
						membersCount: 5420,
						joined: true,
					},
				]);
			}
		} catch (e) {
			console.error("Error fetching communities:", e);
			setCommunities([
				{
					id: 1,
					name: "Web Development",
					membersCount: 15240,
					joined: false,
				},
				{
					id: 2,
					name: "React",
					membersCount: 12350,
					joined: true,
				},
				{
					id: 3,
					name: "JavaScript",
					membersCount: 24560,
					joined: false,
				},
				{
					id: 4,
					name: "UI/UX Design",
					membersCount: 9870,
					joined: false,
				},
				{
					id: 5,
					name: "Web Accessibility",
					membersCount: 5420,
					joined: true,
				},
			]);
		}
	};

	useEffect(() => {
		fetchPosts();
		fetchCommunities();
	}, []);

	const tags = [
		"All",
		"CSS",
		"React",
		"JavaScript",
		"Accessibility",
		"HTML",
		"Frontend",
		"Performance",
		"Tailwind",
		"Forms",
	];

	const handleJoinCommunity = (communityId) => {
		setCommunities(
			communities.map((community) =>
				community.id === communityId || community._id === communityId
					? { ...community, joined: !community.joined }
					: community
			)
		);
	};

	const formatNumber = (num) => {
		if (!num) return 0;
		if (Array.isArray(num)) return num.length;

		if (num >= 1000) {
			return (num / 1000).toFixed(1) + "k";
		}
		return num;
	};

	const getAttachmentUrl = (attachmentId) => {
		return `${
			import.meta.env.VITE_BACKEND_URL
		}/api/attachments/${attachmentId}`;
	};

	const renderImageGrid = (attachments) => {
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

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar user={user} />

			<div className="flex-1 overflow-auto">
				<div className="max-w-8xl mx-auto px-6">
					<div className="z-10 bg-white pt-6 pb-3 px-6 shadow-sm mt-5 rounded-xl mx-auto max-h-[30vh]">
						<div className="flex justify-between items-center mb-6">
							<h1 className="text-3xl font-bold text-black">
								AdaptEd Community Forum
							</h1>
							<div className="flex space-x-3">
								<button className="flex items-center space-x-2 px-5 py-2.5 bg-black text-white rounded-lg">
									<Search size={18} />
									<span>Search</span>
								</button>
							</div>
						</div>

						<div className="flex space-x-4 mb-6">
							<CreatePostModal />
							<button className="flex items-center space-x-2 px-5 py-2.5 border border-black text-black rounded-lg hover:bg-gray-50 transition">
								<Plus size={18} />
								<span>Create Community</span>
							</button>
							<button className="flex items-center space-x-2 px-5 py-2.5 border border-black text-black rounded-lg hover:bg-gray-50 transition">
								<Flame size={18} />
								<span>Trending</span>
							</button>
							<button className="flex items-center space-x-2 px-5 py-2.5 border border-black text-black rounded-lg hover:bg-gray-50 transition">
								<BookOpen size={18} />
								<span>Resources</span>
							</button>
						</div>

						<div className="flex items-center space-x-3 overflow-x-auto pb-3 mb-2">
							<div className="flex items-center space-x-1 px-3 py-1.5 bg-black text-white rounded-md">
								<Filter size={14} />
								<span>Filter:</span>
							</div>
							{tags.map((tag) => (
								<button
									key={tag}
									className={`px-4 py-1.5 rounded-md ${
										activeTag === tag
											? "bg-black text-white"
											: "border border-gray-300 text-black hover:bg-gray-50"
									}`}
									onClick={() => setActiveTag(tag)}
								>
									{tag}
								</button>
							))}
						</div>
					</div>

					<div className="flex pt-6 gap-6">
						<div className="flex-1">
							{loading ? (
								<div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200">
									<div className="animate-pulse">
										<div className="flex items-start">
											<div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
											<div className="flex-1">
												<div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
												<div className="h-6 bg-gray-200 rounded w-1/2"></div>
											</div>
										</div>
										<div className="mt-4 h-16 bg-gray-200 rounded"></div>
										<div className="mt-4 h-48 bg-gray-200 rounded"></div>
									</div>
								</div>
							) : posts.length === 0 ? (
								<div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200 text-center">
									<p className="text-lg text-gray-500">
										No posts found
									</p>
								</div>
							) : (
								posts.map((post) => (
									<div
										key={post._id}
										className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200 hover:shadow-md transition"
									>
										<div className="flex items-start">
											<img
												src={
													post.author?.profileImage ||
													"https://picsum.photos/seed/author/100"
												}
												alt={
													post.author?.name ||
													"Anonymous"
												}
												className="w-12 h-12 rounded-full mr-4"
											/>
											<div className="flex-1">
												<div className="flex items-center space-x-2">
													<span className="font-medium text-black">
														{post.author?.name ||
															"Anonymous"}
													</span>
													<span className="text-gray-500 text-sm">
														in
													</span>
													<span className="text-black font-medium">
														{post.community?.name ||
															"General"}
													</span>
													<span className="text-gray-500 text-sm">
														{formatDate(
															post.createdAt
														)}
													</span>
												</div>

												<h2 className="text-xl font-bold text-black mt-2">
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
															<TagIcon
																size={14}
																className="mr-1.5"
															/>
															{tag}
														</span>
													))}
										</div>

										{renderImageGrid(post.attachments)}

										<div className="flex items-center mt-6 space-x-8">
											<div className="flex items-center space-x-2">
												<button
													onClick={() =>
														handleVote(
															post._id,
															"upvote"
														)
													}
													className="p-1.5 hover:bg-gray-100 rounded-full transition"
												>
													<ThumbsUp
														size={20}
														className="text-black"
													/>
												</button>
												<span className="text-black font-medium">
													{formatNumber(post.upvotes)}
												</span>
												<button
													onClick={() =>
														handleVote(
															post._id,
															"downvote"
														)
													}
													className="p-1.5 hover:bg-gray-100 rounded-full transition"
												>
													<ThumbsDown
														size={20}
														className="text-black"
													/>
												</button>
												<span className="text-black font-medium">
													{formatNumber(
														post.downvotes
													)}
												</span>
											</div>

											<button className="flex items-center space-x-2 text-black hover:bg-gray-100 py-1.5 px-3 rounded-md transition">
												<MessageSquare size={20} />
												<span>
													{formatNumber(
														post.comments
													)}{" "}
													Comments
												</span>
											</button>

											<button className="flex items-center space-x-2 text-black hover:bg-gray-100 py-1.5 px-3 rounded-md transition">
												<Share2 size={20} />
												<span>Share</span>
											</button>
										</div>
									</div>
								))
							)}
						</div>

						<div className="w-80">
							<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
								<h2 className="text-xl font-bold text-black mb-5">
									Communities to Join
								</h2>
								{communities.map((community) => (
									<div
										key={community.id || community._id}
										className="mb-5 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
									>
										<div className="flex items-center justify-between">
											<div>
												<p className="font-medium text-black text-lg">
													{community.name}
												</p>
												<p className="text-gray-500 text-sm mt-1">
													{formatNumber(
														community.membersCount
													)}{" "}
													members
												</p>
											</div>

											{community.createdBy !=
												state.user._id && (
												<button
													className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
														community.joined
															? "bg-gray-200 text-black hover:bg-gray-300"
															: "bg-black text-white hover:bg-gray-800"
													}`}
													onClick={() =>
														handleJoinCommunity(
															community.id ||
																community._id
														)
													}
												>
													{community.joined
														? "Joined"
														: "Join"}
												</button>
											)}
										</div>
									</div>
								))}
								<button className="w-full mt-3 text-center text-black font-medium py-2 hover:bg-gray-50 rounded-lg transition">
									View All Communities
								</button>
							</div>

							<div className="bg-white p-6 rounded-xl shadow-sm mt-6 border border-gray-200">
								<h2 className="text-xl font-bold text-black mb-5">
									Trending Topics
								</h2>
								<div className="space-y-3">
									<div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
										<p className="font-medium text-black">
											#ReactHooks
										</p>
										<p className="text-gray-500 text-sm mt-1">
											2.3k posts
										</p>
									</div>
									<div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
										<p className="font-medium text-black">
											#WebAccessibility
										</p>
										<p className="text-gray-500 text-sm mt-1">
											1.8k posts
										</p>
									</div>
									<div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
										<p className="font-medium text-black">
											#TailwindCSS
										</p>
										<p className="text-gray-500 text-sm mt-1">
											1.5k posts
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Forum;
