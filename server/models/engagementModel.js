const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const engagementSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    action: {
        type: String,
        enum: [
            "VIEW_POST",
            "VIEW_ROADMAP",
            "QUIZ_ATTEMPT",
            "UPVOTE_POST",
            "DOWNVOTE_POST",
            "COMMENT_POST",
            "COMPLETE_CHECKPOINT",
            "CLICK_RECOMMENDATION"
        ],
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    roadmapId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roadmap'
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    checkpointId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Checkpoint'
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recommendation'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    tags: {
        type: [String],
        default: []
    },
    timeSpent: {
        type: Number,
        default: 0
    },
    xpEarned: {
        type: Number,
        default: 0
    },
    feedback: {
        type: String,
        default: ""
    }
})

const Engagement = mongoose.model('Engagement', engagementSchema);
module.exports = Engagement;