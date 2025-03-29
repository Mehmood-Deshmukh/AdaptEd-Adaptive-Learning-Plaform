const mongoose = require("mongoose");
const mongodb = require("mongodb");

const Schema = mongoose.Schema;

const avatarSchema = new Schema(
  {
    filename: {
      type: String,
      required: true,
      unique: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["user", "community"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      validate: {
        validator: function (value) {
          return this.type === "user" ? !!value : true;
        },
        message: "User ID is required for user avatars",
      },
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      unique: true,
      validate: {
        validator: function (value) {
          return this.type === "community" ? !!value : true;
        },
        message: "Community ID is required for community avatars",
      },
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);


avatarSchema.statics.uploadAvatar = async function (avatar, type, id) {
  const db = mongoose.connection.db;
  const bucket = new mongodb.GridFSBucket(db, { bucketName: "avatars" });

  const extension = avatar.originalname.split(".").pop();
  const fileName = `${type}-${id.toString()}.${extension}`;

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(fileName, {
      metadata: { type, id, filename: fileName },
    });

    uploadStream.on("finish", async (file) => {
      try {
        const _avatar = new this({
          filename: fileName,
          mimetype: avatar.mimetype,
          type,
          [type === "user" ? "userId" : "communityId"]: id,
          updatedAt: new Date(),
          createdAt: new Date(),
        });

        await _avatar.save();
        resolve({ gridFsId: file?._id, fileName });
      } catch (error) {
        console.error("Error saving avatar document:", error);
        reject(error);
      }
    });

    uploadStream.on("error", (error) => {
      console.error("Error uploading file:", error);
      reject(error);
    });

    uploadStream.end(avatar.buffer);
  });
};

avatarSchema.statics.deleteAvatar = async function (type, id, filename) {
  const db = mongoose.connection.db;
  const bucket = new mongodb.GridFSBucket(db, { bucketName: "avatars" });

  const filePattern = new RegExp(`^${type}-${id.toString()}\\.`);

  try {
    const file = await db.collection("avatars.files").findOne({ filename });

    if (!file) {
      throw new Error("File not found");
    }

    await bucket.delete(file._id);
    await this.deleteOne({ [type === "user" ? "userId" : "communityId"]: id });

    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};


avatarSchema.statics.updateAvatar = async function (type, id, avatar) {
  const db = mongoose.connection.db;
  const bucket = new mongodb.GridFSBucket(db, { bucketName: "avatars" });

  const filePattern = new RegExp(`^${type}-${id.toString()}\\.`); 

  try {
    const file = await db.collection("avatars.files").findOne({ filename: { $regex: filePattern } });

    if (file) {
      await bucket.delete(file._id);
    }

    const extension = avatar.originalname.split(".").pop();
    const newFileName = `${type}-${id.toString()}.${extension}`;

    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(newFileName, {
        metadata: { type, id, filename: newFileName },
      });

      uploadStream.on("finish", async (file) => {
        try {
          await this.updateOne(
            { [type === "user" ? "userId" : "communityId"]: id },
            { filename: newFileName, mimetype: avatar.mimetype, updatedAt: new Date() },
            { upsert: true }
          );

          resolve({ gridFsId: file?._id, fileName: newFileName });
        } catch (error) {
          console.error("Error updating avatar document:", error);
          reject(error);
        }
      });

      uploadStream.on("error", (error) => {
        console.error("Error uploading file:", error);
        reject(error);
      });

      uploadStream.end(avatar.buffer);
    });
  } catch (error) {
    console.error("Error updating file:", error);
    throw error;
  }
};

module.exports = mongoose.model("Avatar", avatarSchema);
