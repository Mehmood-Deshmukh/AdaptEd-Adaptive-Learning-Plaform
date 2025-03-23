const mongoose = require("mongoose");
const Post = require("./postModel");
const User = require("./userModel");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
	author: {
		type: mongoose.Types.ObjectId,
		ref: "User",
	},
	message: {
		type: String,
		required: true,
	},
	post: {
		type: mongoose.Types.ObjectId,
		ref: "Post",
	},
	replyingTo: {
		type: mongoose.Types.ObjectId,
		ref: "Comment",
	},
	upvotes: [
		{
			type: mongoose.Types.ObjectId,
			ref: "User",
		},
	],
	downvotes: [
		{
			type: mongoose.Types.ObjectId,
			ref: "User",
		},
	],
	createdAt: {
		type: Date,
		default: Date.now(),
	},
	updatedAt: {
		type: Date,
		default: Date.now(),
	},
});

commentSchema.statics.createComment = async function (
	author,
	message,
	postId,
	replyingTo
) {
	const comment = new this({
		author,
		message,
		post: postId,
		replyingTo,
	});
	await comment.save();
	console.log(comment);

	const post = await Post.findById(postId);
	post.comments.push(comment._id);
	await post.save();

	return { comment, post };
};

module.exports = mongoose.model("Comment", commentSchema);
