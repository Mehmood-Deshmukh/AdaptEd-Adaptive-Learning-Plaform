const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const xpHistorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

xpHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('XpHistory', xpHistorySchema);