const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mainTopic: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    checkpoints: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Checkpoint'
        }
    ],
    totalProgress: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Roadmap', roadmapSchema);