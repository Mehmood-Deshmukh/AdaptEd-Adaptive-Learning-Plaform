const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    checkpointId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Checkpoint',
        required: true
    },
    roadmapId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roadmap',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: false,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: null
    }
});

feedbackSchema.index({ userId: 1, checkpointId: 1 }, { unique: true });

feedbackSchema.statics.createOrUpdateFeedback = async function(feedbackData) {
    try {
        const existingFeedback = await this.findOne({
            userId: feedbackData.userId,
            checkpointId: feedbackData.checkpointId
        });
        
        if (existingFeedback) {
            existingFeedback.rating = feedbackData.rating;
            existingFeedback.comment = feedbackData.comment;
            existingFeedback.updatedAt = Date.now();
            return await existingFeedback.save();
        } else {
            return await this.create(feedbackData);
        }
    } catch(error) {
        throw new Error(error.message);
    }
};

feedbackSchema.statics.getCheckpointFeedback = async function(checkpointId) {
    try {
        return await this.find({ checkpointId })
            .populate('userId', 'name email')
            .sort('-createdAt');
    } catch(error) {
        throw new Error(error.message);
    }
};

feedbackSchema.statics.getCheckpointAverageRating = async function(checkpointId) {
    try {
        const result = await this.aggregate([
            { $match: { checkpointId: new mongoose.Types.ObjectId(checkpointId) } },
            { $group: { _id: null, averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        
        return result.length > 0 ? {
            averageRating: result[0].averageRating,
            count: result[0].count
        } : { averageRating: 0, count: 0 };
    } catch(error) {
        throw new Error(error.message);
    }
};

module.exports = mongoose.model('Feedback', feedbackSchema);