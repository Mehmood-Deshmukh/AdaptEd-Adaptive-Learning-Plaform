const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resourcesSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
    difficulty: {
        type: String,
        required: true
    },
    topics : {
        type: [String],
        required: true
    },
    description : {
        type: String,
        required: true
    },
    reasoning : {
        type: String,
        required: true
    },
    rank : {
        type: Number,
        required: true
    },
});

resourcesSchema.statics.createResource = async function(resource){
    return await this.create(resource);
}

module.exports = mongoose.model('Resource', resourcesSchema);