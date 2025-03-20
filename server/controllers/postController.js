const Post = require("../models/postModel")
const Community = require("../models/communityModel")

async function createPost(req, res) {
	try {
		const { title, description, author, tags, communityId } =  req.body;
		// const attachments = [];
		// attachments.push(req.file);
		const attachments = req.files;

		const community = await Community.findById(communityId);
		if (!community) {
			throw new Error("Community not found");
		}

		const post = await Post.createPost(title, description, author, tags, attachments);

		community.posts.push(post._id);
		await community.save();

		res.status(201).json({
			success: true,
			message: "Post created succcessfully!",
			data: post
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Error creating post: " + error.message,
			data: null
		});
	}
}

module.exports = {
	createPost
}
