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
				post.id === postId
					? {
							...post,
							upvotes:
								type === "upvote"
									? post.upvotes + 1
									: post.upvotes,
							downvotes:
								type === "downvote"
									? post.downvotes + 1
									: post.downvotes,
					  }
					: post
			)
		);
	};

	const [posts, setPosts] = useState([
		{
			id: 1,
			title: "How to style elements with Tailwind CSS?",
			content:
				"I'm new to Tailwind CSS and looking for best practices for styling components efficiently.",
			author: "JohnDoe",
			authorAvatar: "https://picsum.photos/seed/john/100",
			community: "Web Development",
			tags: ["CSS", "Tailwind", "Frontend"],
			upvotes: 24,
			downvotes: 2,
			commentCount: 8,
			createdAt: "2 hours ago",
			images: ["https://picsum.photos/seed/tailwind/1280"],
		},
		{
			id: 2,
			title: "React performance optimization techniques",
			content:
				"What are some ways to optimize React applications for better performance?",
			author: "JaneDoe",
			authorAvatar: "https://picsum.photos/seed/jane/100",
			community: "React",
			tags: ["React", "Performance", "JavaScript"],
			upvotes: 45,
			downvotes: 3,
			commentCount: 12,
			createdAt: "5 hours ago",
			images: [
				"https://picsum.photos/seed/react1/1280",
				"https://picsum.photos/seed/react2/1280",
				"https://picsum.photos/seed/react3/1280",
				"https://picsum.photos/seed/react4/1280",
			],
		},
		{
			id: 3,
			title: "Building accessible forms - best practices",
			content:
				"I want to ensure my forms are accessible to all users. What are the current best practices for creating accessible forms?",
			author: "AccessibilityAdvocate",
			authorAvatar: "https://picsum.photos/seed/accessibility/100",
			community: "Web Accessibility",
			tags: ["Accessibility", "HTML", "Forms"],
			upvotes: 87,
			downvotes: 1,
			commentCount: 24,
			createdAt: "1 day ago",
			images: [
				"https://picsum.photos/seed/forms1/1280",
				"https://picsum.photos/seed/forms2/1280",
			],
		},
		{
			id: 4,
			title: "State Management in Large React Applications",
			content:
				"Which state management library do you prefer for large React applications? Redux, Zustand, or something else?",
			author: "DevMaster",
			authorAvatar: "https://picsum.photos/seed/state/100",
			community: "React",
			tags: ["React", "State Management", "Redux"],
			upvotes: 65,
			downvotes: 5,
			commentCount: 14,
			createdAt: "3 hours ago",
			images: ["https://picsum.photos/seed/state-mgmt/1280"],
		},
		{
			id: 5,
			title: "Best backend frameworks for scalability",
			content:
				"I need a backend framework that scales well. What are your recommendations?",
			author: "BackendGuru",
			authorAvatar: "https://picsum.photos/seed/backend/100",
			community: "Backend Development",
			tags: ["Node.js", "Django", "Scalability"],
			upvotes: 92,
			downvotes: 3,
			commentCount: 19,
			createdAt: "6 hours ago",
			images: [
				"https://picsum.photos/seed/backend1/1280",
				"https://picsum.photos/seed/backend2/1280",
				"https://picsum.photos/seed/backend3/1280",
			],
		},
		{
			id: 6,
			title: "Deploying a Full-Stack App on AWS",
			content:
				"I want to deploy my full-stack application on AWS. What are the best practices?",
			author: "CloudExpert",
			authorAvatar: "https://picsum.photos/seed/cloud/100",
			community: "Cloud Computing",
			tags: ["AWS", "DevOps", "Deployment"],
			upvotes: 78,
			downvotes: 4,
			commentCount: 22,
			createdAt: "1 day ago",
			images: ["https://picsum.photos/seed/aws/1280"],
		},
		{
			id: 7,
			title: "Understanding JavaScript Closures",
			content:
				"Closures in JavaScript always confuse me. Can someone explain them with real-world examples?",
			author: "JSNinja",
			authorAvatar: "https://picsum.photos/seed/js/100",
			community: "JavaScript",
			tags: ["JavaScript", "Closures", "Functions"],
			upvotes: 120,
			downvotes: 6,
			commentCount: 33,
			createdAt: "2 days ago",
			images: ["https://picsum.photos/seed/closures/1280"],
		},
		{
			id: 8,
			title: "Machine Learning in Web Applications",
			content:
				"How can I integrate machine learning models into a web application efficiently?",
			author: "MLGeek",
			authorAvatar: "https://picsum.photos/seed/ml/100",
			community: "Machine Learning",
			tags: ["AI", "Web", "TensorFlow"],
			upvotes: 88,
			downvotes: 2,
			commentCount: 25,
			createdAt: "3 days ago",
			images: [
				"https://picsum.photos/seed/ml1/1280",
				"https://picsum.photos/seed/ml2/1280",
				"https://picsum.photos/seed/ml3/1280",
			],
		},
		{
			id: 9,
			title: "Using Docker for Local Development",
			content:
				"Is using Docker for local development a good practice? What are the benefits?",
			author: "DevOpsPro",
			authorAvatar: "https://picsum.photos/seed/docker/100",
			community: "DevOps",
			tags: ["Docker", "DevOps", "Containers"],
			upvotes: 70,
			downvotes: 3,
			commentCount: 15,
			createdAt: "4 days ago",
			images: ["https://picsum.photos/seed/docker-dev/1280"],
		},
		{
			id: 10,
			title: "Building a REST API with Express.js",
			content:
				"What are the best practices for designing a scalable REST API with Express.js?",
			author: "APIWizard",
			authorAvatar: "https://picsum.photos/seed/api/100",
			community: "Backend Development",
			tags: ["API", "Express", "Node.js"],
			upvotes: 83,
			downvotes: 2,
			commentCount: 21,
			createdAt: "5 days ago",
			images: [
				"https://picsum.photos/seed/api1/1280",
				"https://picsum.photos/seed/api2/1280",
				"https://picsum.photos/seed/api3/1280",
			],
		},
		{
			id: 11,
			title: "GraphQL vs REST: Which one to choose?",
			content:
				"I'm building an API-heavy application. Should I go with GraphQL or stick to REST?",
			author: "GraphQLFan",
			authorAvatar: "https://picsum.photos/seed/graphql/100",
			community: "API Development",
			tags: ["GraphQL", "REST", "API"],
			upvotes: 95,
			downvotes: 4,
			commentCount: 28,
			createdAt: "6 days ago",
			images: ["https://picsum.photos/seed/graphql-vs-rest/1280"],
		},
	]);

	const [communities, setCommunities] = useState([
		{
			id: 1,
			name: "Web Development",
			members: 15240,
			joined: false,
		},
		{
			id: 2,
			name: "React",
			members: 12350,
			joined: true,
		},
		{
			id: 3,
			name: "JavaScript",
			members: 24560,
			joined: false,
		},
		{
			id: 4,
			name: "UI/UX Design",
			members: 9870,
			joined: false,
		},
		{
			id: 5,
			name: "Web Accessibility",
			members: 5420,
			joined: true,
		},
	]);

	const fetchCommunities = async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/community/?page=1&limit=5`,{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				}
			});
			const data = await response.json();
			if (data.success) {
				setCommunities(data.data);
			}
			console.log("Communities fetched successfully");
		}catch(e) {
			console.error(e);

		}
	}

	useEffect(() => {
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
				community.id === communityId
					? { ...community, joined: !community.joined }
					: community
			)
		);
	};

	const formatNumber = (num) => {
		if (num >= 1000) {
			return (num / 1000).toFixed(1) + "k";
		}
		return num;
	};

	const renderImageGrid = (images) => {
		if (!images || images.length === 0) return null;

		if (images.length === 1) {
			return (
				<div className="mt-4">
					<img
						src={images[0]}
						alt="Post content"
						className="rounded-lg w-full max-h-80 object-cover"
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
							{/* <button
								className="flex items-center space-x-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition"
								onClick={() => setIsCreatePostModalOpen(true)}
							>
								<Plus size={18} />
								<span>New Post</span>
							</button> */}
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
											: "border border-gray-1280 text-black hover:bg-gray-50"
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
							{posts.map((post) => (
								<div
									key={post.id}
									className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200 hover:shadow-md transition"
								>
									<div className="flex items-start">
										<img
											src={post.authorAvatar}
											alt={post.author}
											className="w-12 h-12 rounded-full mr-4"
										/>
										<div className="flex-1">
											<div className="flex items-center space-x-2">
												<span className="font-medium text-black">
													{post.author}
												</span>
												<span className="text-gray-500 text-sm">
													in
												</span>
												<span className="text-black font-medium">
													{post.community}
												</span>
												<span className="text-gray-1280 text-sm">
													{post.createdAt}
												</span>
											</div>

											<h2 className="text-xl font-bold text-black mt-2">
												{post.title}
											</h2>
										</div>
									</div>

									<div className="mt-4 text-black text-lg">
										{post.content}
									</div>

									<div className="flex flex-wrap mt-4 gap-2">
										{post.tags.map((tag) => (
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

									{renderImageGrid(post.images)}

									<div className="flex items-center mt-6 space-x-8">
										<div className="flex items-center space-x-2">
											<button
												onClick={() =>
													handleVote(
														post.id,
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
														post.id,
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
												{formatNumber(post.downvotes)}
											</span>
										</div>

										<button className="flex items-center space-x-2 text-black hover:bg-gray-100 py-1.5 px-3 rounded-md transition">
											<MessageSquare size={20} />
											<span>
												{formatNumber(
													post.commentCount
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
							))}
						</div>

						<div className="w-80">
							<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
								<h2 className="text-xl font-bold text-black mb-5">
									Communities to Join
								</h2>
								{communities.map((community) => (
									<div
										key={community.id}
										className="mb-5 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
									>
										<div className="flex items-center justify-between">
											<div>
												<p className="font-medium text-black text-lg">
													{community.name}
												</p>
												<p className="text-gray-500 text-sm mt-1">
													{formatNumber(
														community?.membersCount
													)}{" "}
													members
												</p>
											</div>
											<button
												className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
													community.joined
														? "bg-gray-200 text-black hover:bg-gray-300"
														: "bg-black text-white hover:bg-gray-800"
												}`}
												onClick={() =>
													handleJoinCommunity(
														community.id
													)
												}
											>
												{community.joined
													? "Joined"
													: "Join"}
											</button>
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
