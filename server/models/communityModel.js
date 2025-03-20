const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let communitySchema = new Schema({
    name: {
        type: String,
        unique: true,
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
    // we might want to remove this and store communities a user is part of in the user model, we  may be just need count of members here because actual members might not be public
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
	createdAt: {
		type: Date,
		default: Date.now()
	},
	updatedAt: {
		type: Date,
		default: Date.now()
	}
});

communitySchema.statics.createCommunity = async function(
    name,
    description,
    domain,
    tags,
    createdBy,
    dominentCluster
){
    const community = new this({
        name,
        description,
        domain,
        tags,
        createdBy,
        dominentCluster
    });
    if(community.name.length > 40){
        throw new Error('Community name cannot be longer than 40 characters');
    }
 
    const illegalCharacters = ['$', '.', ' ', '#', '[', ']'];
    
    illegalCharacters.forEach(character => {
        if(community.name.includes(character)){
            throw new Error('Community name cannot contain illegal characters');
        }
    });
    
    community.members.push(createdBy);
    await community.save();

    return community;
}


module.exports = mongoose.model(communitySchema, 'Community');
