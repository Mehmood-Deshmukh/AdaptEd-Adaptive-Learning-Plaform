const Post = require("../models/postModel")

async function createPost(req, res) {
	try {
		const { title, description, author, tags } =  req.body;
		// const attachments = [];
		// attachments.push(req.file);
		const attachments = req.files;
		console.log(title, description, author, tags);
		console.log(attachments);

		const post = await Post.createPost(title, description, author, tags, attachments);

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
