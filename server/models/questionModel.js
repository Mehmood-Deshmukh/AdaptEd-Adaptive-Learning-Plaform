const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    question: {
        type: String,
        required: [true, 'Question is required'],
        trim: true
    },
    options: {
        type: [{
            type: String,
            required: true
        }]
    },
    correctOption: {
        type: String,
        required: [true, 'Correct option is required']
    },
    explanation: {
        type: String,
        required: [true, 'Explanation is required']
    },
    tags: {
        type: [String],
        default: []
    },
    domain: {
        type: String,
    }
});

module.exports = mongoose.models.Question || mongoose.model("Question", questionSchema);