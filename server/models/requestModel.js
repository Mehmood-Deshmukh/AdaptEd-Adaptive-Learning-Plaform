const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const requestSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ["quiz", "resource", "project"] 
    },
    requestBy: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },    
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "approved", "rejected"]
    },
    feedback: {
        type: String
    },
    payload:{
        type: Schema.Types.Mixed
    },
    postedOn: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("Request", requestSchema);