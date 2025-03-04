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
    }
});

resourcesSchema.statics.createResource = async function(resource){
    return await this.create(resource);
}

module.exports = mongoose.model('Resource', resourcesSchema);