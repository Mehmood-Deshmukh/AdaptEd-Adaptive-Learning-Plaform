const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let communitySchema = new Schema({
    name: {
        type: String,
        required: true
    }, 
    description: {
        type: String,
        required: true
    },
    domain: {
        type: String,
    },
    tags: [{
        type: String
    }],
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    dominentCluster: {
        type: Number,
        default: 0
    },
	posts: {
		type: Schema.Types.ObjectId,
		ref: 'Post'
	},
	dateCreated: {
		type: Date,
		default: Date.now()
	},
	dateUpdated: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model(communitySchema, 'Community');
