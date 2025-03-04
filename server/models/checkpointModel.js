const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const resourceSchema = require('./resourceModel');

const checkpointSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started'
    },
    order : {
        type: Number,
        required: true
    },
    resources:  [{
            type: mongoose.Schema.Types.ObjectId,
        }],
    startedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    totalHoursNeeded: {
        type: Number
    },
});

checkpointSchema.statics.createCheckpoint = async function(checkpoint){
    try{
        const resources = await Promise.all(checkpoint.resources.map(async resource => {
            const newResource = await resourceSchema.createResource(resource);
            return newResource._id;
        }));
        
        checkpoint.resources = resources;
        return await this.create(checkpoint);
    } catch(error){
        throw new Error(error.message);
    }
}

checkpointSchema.statics.getCheckpoints = async function(checkpointIds){
    try{
        const checkpoints = await this.find({ _id: { $in: checkpointIds } }).populate(
            {
                path: 'resources',
                model: 'Resource'
            }
        );
        return checkpoints;
    } catch(error){
        throw new Error(error.message);
    }
}

module.exports = mongoose.model('Checkpoint', checkpointSchema);    