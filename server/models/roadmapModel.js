const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
    users: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        progress: {
            type: Number,
            default: 0
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
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
    },
    completedAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Roadmap', roadmapSchema);