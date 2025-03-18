const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
	title: {
		type: string,
		required: true
	},
	description: {
		type: string,
		required: true
	},
	attachment: [{
		type: mongoose.Types.ObjectId,
		ref: "Attachment"
	}],
	author: {
		type: mongoose.Types.ObjectId,
		ref: "User"
	},
	upvotes: [{
		type: mongoose.Types.ObjectId,
		ref: "User"
	}],
	downvotes: [{
		type: mongoose.Types.ObjectId,
		ref: "User"
	}],
	comments: [{
		type: mongoose.Types.ObjectId,
		ref: "Comment"
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

module.exports = mongoose.model(postSchema, "Post");
