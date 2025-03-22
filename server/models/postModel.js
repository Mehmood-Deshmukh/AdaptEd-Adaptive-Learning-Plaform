const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Attachment = require("../models/attachmentModel");

dotenv.config();
const Schema = mongoose.Schema;

const postSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	attachments: [
		{
			type: mongoose.Types.ObjectId,
			ref: "Attachment",
		},
	],
	tags: [
		{
			type: String,
		},
	],
	author: {
		type: mongoose.Types.ObjectId,
		ref: "User",
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
	comments: [
		{
			type: mongoose.Types.ObjectId,
			ref: "Comment",
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

postSchema.statics.createPost = async function (
	title,
	description,
	author,
	tags,
	attachments
) {
	const post = new this({
		title,
		description,
		tags,
		author,
	});

	if (attachments && attachments?.length != 0) {
		const uploadedAttachments = await Attachment.uploadFiles(
			attachments,
			author,
			post._id
		);
		post.attachments = uploadedAttachments;
	}

	await post.save();
	return post;
};

module.exports = mongoose.model("Post", postSchema);
