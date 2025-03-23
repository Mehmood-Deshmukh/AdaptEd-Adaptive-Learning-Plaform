export const placeholderPosts = [
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
		createdAt: new Date(Date.now() - 7200000).toISOString(),
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
		createdAt: new Date(Date.now() - 18000000).toISOString(),
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
		createdAt: new Date(Date.now() - 86400000).toISOString(),
		attachments: [
			"https://picsum.photos/seed/forms1/1280",
			"https://picsum.photos/seed/forms2/1280",
		],
	},
];

export const placeholderCommunities = [
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
];

export const tags = [
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
