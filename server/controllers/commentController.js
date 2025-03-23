const Comment = require("../models/commentModel");

async function createComment(req, res) {
	try {
		const { author, message, postId, replyingTo } = req.body;
		const { comment, post } = await Comment.createComment(
			author,
			message,
			postId,
			replyingTo
		);

		res.status(201).json({
			success: true,
			message: "Comment created successfully",
			data: {
                post,
                comment,
			},
		});
	} catch (err) {
		res.status(500).json(err);
	}
}


module.exports = {
    createComment
}