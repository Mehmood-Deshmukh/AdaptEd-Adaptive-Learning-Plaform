const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const achievementSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  xp: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    required: true
  }
}, { timestamps: true });


const userAchievementSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievementId: {
    type: Number,
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  isNotified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });


userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

const Achievement = mongoose.model('Achievement', achievementSchema);
const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);

module.exports = { Achievement, UserAchievement };