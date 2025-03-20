const mongodb = require("mongodb");
const mongoose = require("mongoose");
const Attachment = require("../models/attachmentModel");

const downloadAttachments = async (req, res) => {
    try{
        const { attachmentId } = req.params;
        const attachment = await Attachment.findById(attachmentId);

        if(!attachment) {
            return res.status(404).json({
                success: false,
                message: "Attachment not found",
                data: null
            });
        }

        const db = mongoose.connection.db;
        const bucket = new mongodb.GridFSBucket(db, { bucketName: "attachments" });
        
        const downloadStream = bucket.openDownloadStreamByName(attachment.filename);
        downloadStream.pipe(res);
    }catch(e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Error downloading attachments: " + e.message,
            data: null
        });
    }
}

module.exports = {
    downloadAttachments
}