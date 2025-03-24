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

export const questions = [
	{
		parameter: "visualLearning",
		question:
			"How much do you rely on visual aids (diagrams, images, videos) when learning new concepts?",
		options: [
			{ text: "Not at all", value: 1 },
			{ text: "Slightly", value: 3 },
			{ text: "Moderately", value: 5 },
			{ text: "Strongly", value: 7 },
			{ text: "Extremely", value: 10 },
		],
	},
	{
		parameter: "auditoryLearning",
		question:
			"How much do you rely on auditory methods (lectures, podcasts, discussions) when learning?",
		options: [
			{ text: "Not at all", value: 1 },
			{ text: "Rarely", value: 3 },
			{ text: "Sometimes", value: 5 },
			{ text: "Often", value: 7 },
			{ text: "Almost exclusively", value: 10 },
		],
	},
	{
		parameter: "readingWritingLearning",
		question:
			"How important are reading and writing as primary learning methods for you?",
		options: [
			{ text: "Not important", value: 1 },
			{ text: "Slightly important", value: 3 },
			{ text: "Moderately important", value: 5 },
			{ text: "Very important", value: 7 },
			{ text: "Extremely important", value: 10 },
		],
	},
	{
		parameter: "kinestheticLearning",
		question:
			"How much do you benefit from hands-on or practical (kinesthetic) activities when learning?",
		options: [
			{ text: "Not at all", value: 1 },
			{ text: "Slightly", value: 3 },
			{ text: "Moderately", value: 5 },
			{ text: "Significantly", value: 7 },
			{ text: "Greatly", value: 10 },
		],
	},
	{
		parameter: "challengeTolerance",
		question:
			"How much of a challenge do you prefer in your learning materials?",
		options: [
			{ text: "I prefer very simple content", value: 1 },
			{ text: "I prefer slightly simple content", value: 3 },
			{ text: "I like a balanced level of challenge", value: 5 },
			{ text: "I prefer challenging content", value: 7 },
			{ text: "I thrive on very challenging content", value: 10 },
		],
	},
	{
		parameter: "timeCommitment",
		question:
			"How many hours per week are you willing to dedicate to learning?",
		options: [
			{ text: "Very little (e.g., 1-2 hours)", value: 1 },
			{ text: "Low (e.g., 3-4 hours)", value: 3 },
			{ text: "Moderate (e.g., 5-6 hours)", value: 5 },
			{ text: "High (e.g., 7-8 hours)", value: 7 },
			{ text: "Very high (9+ hours)", value: 10 },
		],
	},
	{
		parameter: "learningPace",
		question:
			"How quickly do you prefer to progress through new learning material?",
		options: [
			{ text: "Very slowly", value: 1 },
			{ text: "Somewhat slowly", value: 3 },
			{ text: "Moderately paced", value: 5 },
			{ text: "Somewhat quickly", value: 7 },
			{ text: "Very quickly", value: 10 },
		],
	},
	{
		parameter: "socialPreference",
		question:
			"How much do you prefer learning in collaborative or social settings rather than alone?",
		options: [
			{ text: "I prefer learning alone", value: 1 },
			{ text: "I lean towards solo learning", value: 3 },
			{ text: "Neutral", value: 5 },
			{ text: "I enjoy some collaboration", value: 7 },
			{ text: "I thrive in group learning environments", value: 10 },
		],
	},
	{
		parameter: "feedbackPreference",
		question:
			"How frequently do you prefer to receive feedback on your learning progress?",
		options: [
			{ text: "Rarely or never", value: 1 },
			{ text: "Occasionally", value: 3 },
			{ text: "Moderately", value: 5 },
			{ text: "Often", value: 7 },
			{ text: "Very frequently", value: 10 },
		],
	},
];
