const Community = require("../models/communityModel");

async function getCommunities(req, res) {
	try {
		// fetch 10 communities at a time
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const communities = await Community.find()
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

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
		const { name, description, domain, tags, createdBy, dominentCluster } =
			req.body;
		if (req.userId != createdBy) {
			res.status(401).json({
				success: false,
				message: "Unauthorized",
				data: null,
			});
		}

		const community = await Community.createCommunity(
			name,
			description,
			domain,
			tags,
			createdBy,
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
		const community = await Community.getCommunityById(id);
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
	getCommunities,
	createCommunity,
	getCommunity,
};