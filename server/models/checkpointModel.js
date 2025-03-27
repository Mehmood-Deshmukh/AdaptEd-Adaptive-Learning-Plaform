const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const resourceSchema = require('./resourceModel');

const checkpointProgressSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started'
    },
    startedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    totalTimeTaken: {
        type: Number,
        default: 0
    },
    isFeedbackCompleted: {
        type: Boolean,
        default: false
    }
});

const checkpointSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    resources: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
    }],
    totalHoursNeeded: {
        type: Number
    },
    userProgress: [checkpointProgressSchema]
});

checkpointSchema.statics.createCheckpoint = async function(checkpoint) {
    try {
        const resources = await Promise.all(checkpoint.resources.map(async resource => {
            const newResource = await resourceSchema.createResource(resource);
            return newResource._id;
        }));
        
        checkpoint.resources = resources;
        return await this.create(checkpoint);
    } catch(error) {
        throw new Error(error.message);
    }
}

checkpointSchema.statics.getCheckpoints = async function(checkpointIds) {
    try {
        const checkpoints = await this.find({ _id: { $in: checkpointIds } }).populate(
            {
                path: 'resources',
                model: 'Resource'
            }
        );
        return checkpoints;
    } catch(error) {
        throw new Error(error.message);
    }
}

checkpointSchema.methods.getUserProgress = function(userId) {
    const userProgress = this.userProgress.find(progress => 
        progress.userId.toString() === userId.toString()
    );
    
    if (!userProgress) {
        return {
            status: 'not_started',
            startedAt: null,
            completedAt: null,
            totalTimeTaken: 0,
            isFeedbackCompleted: false
        };
    }
    
    return userProgress;
}

checkpointSchema.methods.updateUserProgress = async function(userId, status) {
    let userProgress = this.userProgress.find(progress => 
        progress.userId.toString() === userId.toString()
    );
    
    if (!userProgress) {
        userProgress = {
            userId,
            status: 'not_started',
            startedAt: null,
            completedAt: null,
            totalTimeTaken: 0,
            isFeedbackCompleted: false
        };
        this.userProgress.push(userProgress);
    }
    
    const userProgressIndex = this.userProgress.findIndex(progress => 
        progress.userId.toString() === userId.toString()
    );
    
    if (status === 'in_progress' && userProgress.status !== 'in_progress') {
        this.userProgress[userProgressIndex].status = 'in_progress';
        this.userProgress[userProgressIndex].startedAt = new Date();
    } else if (status === 'completed' && userProgress.status !== 'completed') {
        this.userProgress[userProgressIndex].status = 'completed';
        this.userProgress[userProgressIndex].completedAt = new Date();
        
        if (this.userProgress[userProgressIndex].startedAt) {
            const startTime = new Date(this.userProgress[userProgressIndex].startedAt).getTime();
            const endTime = new Date(this.userProgress[userProgressIndex].completedAt).getTime();
            this.userProgress[userProgressIndex].totalTimeTaken = endTime - startTime;
        }
    }
    
    return await this.save();
}

checkpointSchema.methods.updateFeedbackStatus = async function(userId, isCompleted) {
    const userProgressIndex = this.userProgress.findIndex(progress => 
        progress.userId.toString() === userId.toString()
    );
    
    if (userProgressIndex !== -1) {
        this.userProgress[userProgressIndex].isFeedbackCompleted = isCompleted;
        return await this.save();
    }
    
    return this;
}

module.exports = mongoose.model('Checkpoint', checkpointSchema);