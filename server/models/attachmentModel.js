const mongoose = require("mongoose");
const mongodb = require("mongodb");
const Schema = mongoose.Schema;

const attachmentSchema = new Schema({
	filename: {
		type: String,
		required: true,
	},
	path: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	uploadedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	post: {
		type: Schema.Types.ObjectId,
		ref: "Post",
	},
	dateUploaded: {
		type: Date,
		default: Date.now(),
	},
});

attachmentSchema.statics.uploadFiles = async function (
	attachments,
	userId,
	postId
) {
	const db = mongoose.connection.db;
	const bucket = new mongodb.GridFSBucket(db, { bucketName: "attachments" });

	const uploadedFiles = await Promise.all(
		attachments?.map((attachment, index) => {
			const extension = attachment.originalname.split(".").pop();
			const fileName = `${userId.toString()}-${postId.toString()}-${
				index + 1
			}.${extension}`;

			const uploadStream = bucket.openUploadStream(fileName, {
				metadata: { userId, postId, filename: fileName },
			});

			return new Promise((resolve, reject) => {
				uploadStream.on("finish", (file) => {
					resolve({ gridFsId: uploadStream.id, fileName });
				});
				uploadStream.on("error", (error) => {
					console.error("Error uploading file:", error);
					reject(error);
				});
				uploadStream.end(attachment.buffer);
			});
		})
	);

	const attachmentDocs = await Promise.all(
		uploadedFiles.map(async (fileInfo, index) => {
			const doc = await this.create({
				filename: fileInfo.fileName,
				path: fileInfo.gridFsId,
				type: attachments[index].mimetype,
				uploadedBy: userId,
				post: postId,
				dateUploaded: new Date(),
			});
			return doc;
		})
	);

	const attachmentIds = attachmentDocs.map((doc) => doc._id);
	return attachmentIds;
};

module.exports = mongoose.model("Attachment", attachmentSchema);
