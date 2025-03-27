const Avtar = require('../models/avtarModel');
const Community = require('../models/communityModel');
const mongoose = require('mongoose');
const mongodb = require("mongodb");

async function uploadAvatar(req, res) {
    try {
        const { file } = req;
        const { type, communityId } = req.body;
        const id = req.userId;

        if (!file || !type || !id) {
            return res.status(400).json({
                success: false,
                message: "File, type, and id are required",
                data: null
            });
        }

        const validTypes = ['user', 'community'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid type. Must be 'user' or 'community'",
                data: null
            });
        }

        if (type === 'community') {
            const community = await Community.findById(communityId);
            if (!community) {
                return res.status(404).json({
                    success: false,
                    message: "Community not found",
                    data: null
                });
            }

            if (community.createdBy.toString() !== id) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to upload an avatar for this community",
                    data: null
                });
            }
        }

        const userId = type === 'user' ? id : undefined;
        const avatar = await Avtar.uploadAvatar(file, type, userId || communityId);

        if (!avatar) {
            return res.status(500).json({
                success: false,
                message: "Failed to upload avatar",
                data: null
            });
        }

        
        res.status(200).json({
            message: "Avatar uploaded successfully",
            data: null,
            success: true,
        });
    } catch (error) {
        console.error("Error uploading avatar:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error" + error.message,
            data: null
        });
    }
}

async function getAvatar(req, res) {
    try {
        const { id } = req.params;
        const type = req.query.type;
        const avtar = await Avtar.findOne({
            userId: id
        });


        if (!avtar) {
            return res.status(404).json({
                success: false,
                message: "Avatar not found",
                data: null
            });
        }

        console.log(avtar);

        const fileName = avtar.filename;
        const db = mongoose.connection.db;
        const bucket = new mongodb.GridFSBucket(db, { bucketName: "avatars" });
        const downloadStream = bucket.openDownloadStreamByName(fileName);

        downloadStream.on('error', (error) => {
            console.error("Error downloading file:", error);
            res.status(404).json({
                success: false,
                message: "File not found",
                data: null
            });
        });
        downloadStream.pipe(res);
    } catch (e) {
        console.error("Error getting avatar:", e);
        res.status(500).json({
            success: false,
            message: "Internal server error" + e.message,
            data: null
        });
    }
}

async function deleteAvatar(req, res) {
    try {
        const userId = req.userId;
        const { type, communityId } = req.body;

        console.log(userId, type);
        const avtar = await Avtar.findOne({
            [type === 'user' ? 'userId' : 'communityId']: userId,
        });
        if (!avtar) {
            return res.status(404).json({
                success: false,
                message: "Avatar not found",
                data: null
            });
        }

        if (type === 'community') {
            const community = await Community.findById({ communityId });
            if (!community) {
                return res.status(404).json({
                    success: false,
                    message: "Community not found",
                    data: null
                });
            }

            if (community.createdBy.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to delete this community avatar",
                    data: null
                });
            }
        }

        const status = await Avtar.deleteAvatar(avtar.type, avtar._id, avtar.filename);

        await Avtar.deleteOne({ _id: avtar._id });

        if (!status) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete avatar",
                data: null
            });
        }

        res.status(200).json({
            success: true,
            message: "Avatar deleted successfully",
            data: null
        });

    } catch (e) {
        console.error("Error deleting avatar:", e);
        res.status(500).json({
            success: false,
            message: "Internal server error" + e.message,
            data: null
        });
    }
}

async function updateAvatar(req, res) {
    try {
        const { file } = req;
        const { type, communityId } = req.body;
        const id = req.userId;

        if (!file || !type || !id) {
            return res.status(400).json({
                success: false,
                message: "File, type, and id are required",
                data: null
            });
        }

        const validTypes = ['user', 'community'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid type. Must be 'user' or 'community'",
                data: null
            });
        }

        const userId = type === 'user' ? id : undefined;
        if (type === 'community') {
            const community = await Community.findById(communityId);
            if (!community) {
                return res.status(404).json({
                    success: false,
                    message: "Community not found",
                    data: null
                });
            }

            if (community.createdBy.toString() !== id) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to update this community avatar",
                    data: null
                });
            }
        }

        const avatar = await Avtar.updateAvatar(type, userId || communityId, file);
        if (!avatar) {
            return res.status(500).json({
                success: false,
                message: "Failed to update avatar",
                data: null
            });
        }

        res.status(200).json({
            message: "Avatar updated successfully",
            data: null,
            success: true,
        });
    } catch (error) {
        console.error("Error updating avatar:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error" + error.message,
            data: null
        });
    }
}

module.exports = {
    uploadAvatar,
    getAvatar,
    deleteAvatar,
    updateAvatar
};