const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
	author: {
		type: mongoose.Types.ObjectId,
		ref: "User"
	},
	message: {
		type: String,
		required: true
	},
	replyingTo: {
		type: mongoose.Types.ObjectId,
		ref: "Comment"
	},
	upvotes: [{
		type: mongoose.Types.ObjectId,
		ref: "User"
	}],
	downvotes: [{
		type: mongoose.Types.ObjectId,
		ref: "User"
	}],
	createdAt: {
		type: Date,
		default: Date.now()
	},
	updatedAt: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model("Comment", commentSchema);