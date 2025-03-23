const Comment = require("../models/commentModel");

async function getCommentsOnPost(req, res) {
	try {
		const postId = req.params.postId;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		let topLevelComments = await Comment.find({
			post: postId,
			replyingTo: null,
		})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate("author", "name")
			.populate("post", "title")
			.lean();

		if (topLevelComments.length === 0) {
			return res.status(204).json({
				success: true,
				data: null,
				message: "No comments yet!",
			});
		}

		topLevelComments = await Promise.all(
			topLevelComments.map(async (comment) => {
				const repliesCount = await Comment.countDocuments({
					replyingTo: comment._id,
				});
				return { ...comment, repliesCount };
			})
		);

		res.status(200).json({
			success: true,
			message: "Comments fetched successfully!",
			data: topLevelComments,
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			success: false,
			message: "Error getting comments: " + e.message,
			data: null,
		});
	}
}

async function getReplies(req, res) {
	try {
		const commentId = req.params.commentId;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 5;
		const skip = (page - 1) * limit;

		let replies = await Comment.find({
			replyingTo: commentId,
		})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate("author", "name")
			.lean();

		replies = await Promise.all(
			replies.map(async (reply) => {
				const repliesCount = await Comment.countDocuments({
					replyingTo: reply._id,
				});
				return { ...reply, repliesCount };
			})
		);

		res.status(200).json({
			success: true,
			message: "Replies fetched successfully!",
			data: replies,
		});
	}catch(e) {
		console.error(e);
		res.status(500).json({
			success: false,
			message: "Error getting replies: " + e.message,
			data: null,
		});
	}
}

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
	getCommentsOnPost,
	getReplies,
	createComment,
};
