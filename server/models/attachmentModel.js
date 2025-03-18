const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attachmentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    dateUploaded: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("Attachment", attachmentSchema);