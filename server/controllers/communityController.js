const User = require("../models/userModel");
const Community = require("../models/communityModel");
const Post = require("../models/postModel");

async function searchCommunities(req, res) {
	try {
		const searchQuery = req.query.query || "";
		if (!searchQuery.trim()) {
			return res.json([]);
		}

		const communities = await Community.find(
			{ name: new RegExp(searchQuery, "i") },
			{ _id: 1, name: 1, membersCount: 1 }
		)
			.limit(10)
			.lean();

		res.json({
			success: true,
			message: "Communities fetched successfully",
			data: communities,
		});
	} catch (error) {
		console.error("Search error:", error);
		res.status(500).json({ error: "Server error" });
	}
}

async function getCommunities(req, res) {
	try {
		// fetch 10 communities at a time
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const communities = await Community.find()
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();

		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Invalid User!",
				data: null,
			});
		}

		communities.forEach((community) => {
			community.joined = user.communities
				.map(String)
				.includes(community._id.toString());
		});

		res.status(200).json({
			success: true,
			message: "Communities fetched successfully",
			data: communities,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			success: false,
			message: e.message,
			data: null,
		});
	}
}

async function createCommunity(req, res) {
	try {
		const { name, description, domain, tags, dominentCluster } = req.body;

		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
				data: null,
			});
		}

		const community = await Community.createCommunity(
			name,
			description,
			domain,
			tags,
			req.userId,
			dominentCluster
		);

		res.status(201).json({
			success: true,
			message: "Community created successfully",
			data: community,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			success: false,
			message: e.message,
			data: null,
		});
	}
}

// We might want to send top 10 posts or something it'll look good on community landing page
async function getCommunity(req, res) {
	try {
		const { id } = req.params;
		const community = await Community.findById(id)
			.populate({
				path: "posts",
				options: { sort: { createdAt: -1 }, limit: 10 },
				populate: [
					{
						path: "author",
						select: "name profileImage",
					},
					{
						path: "community",
						select: "name",
					},
				],
			})
			.lean();
		if (!community) {
			return res.status(404).json({
				success: false,
				message: "Community not found",
				data: null,
			});
		}

		res.status(200).json({
			success: true,
			message: "Community found successfully",
			data: community,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			success: false,
			message: e.message,
			data: null,
		});
	}
}

module.exports = {
	searchCommunities,
	getCommunities,
	createCommunity,
	getCommunity,
};
