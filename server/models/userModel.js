const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roadmaps: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Roadmap",
      },
    ],
    default: [],
  },
  avg_quiz_score: {
    type: Number,
    default: 0,
  },
  quizzes: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
    default: [],
  },

  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
  lastLoginDate: {
    type: Date,
    default: null
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  maxStreak: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.statics.createUser = async function (name, email, password) {
  try {
    const user = new this({ name, email, password });
    return user.save();
  } catch (error) {
    throw error;
  }
};

userSchema.statics.getUserByEmail = async function (email) {
  try {
    return this.findOne({ email });
  } catch (error) {
    throw error;
  }
};

userSchema.statics.updateResetPasswordToken = async function (email, token) {
  try {
    const user = await this.findOne({ email });
    if (!user) {
      throw new Error("No user with that email");
    }

    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 600000;
    return user.save();
  } catch (error) {
    throw error;
  }
};

userSchema.statics.addRoadmap = async function (userId, roadmapId) {
  try {
    const user = await this.findById(userId);
    user.roadmaps.push(roadmapId);
    await user.save();
  } catch (error) {
    throw error;
  }
};

userSchema.statics.getUsersRoadmaps = async function (userId) {
  try {
    const user = await this.findById(userId).populate({
      path: "roadmaps",
      populate: {
        path: "checkpoints",
        populate: {
          path: "resources",
          model: "Resource",
        },
      },
    });

    return user.roadmaps;
  } catch (error) {
    throw error;
  }
};

userSchema.statics.updateLoginStreak = async function (userId) {
  try {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    
    if (!user.lastLoginDate) {
      user.lastLoginDate = today;
      user.currentStreak = 1;
      user.maxStreak = 1;
      return user.save();
    }

    const lastLogin = new Date(user.lastLoginDate);
    const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
    
    if (today.getTime() === lastLoginDay.getTime()) {
      return user;
    }

    const timeDiff = today.getTime() - lastLoginDay.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (dayDiff === 1) {
      user.currentStreak += 1;
      if (user.currentStreak > user.maxStreak) {
        user.maxStreak = user.currentStreak;
      }
    }

    else if (dayDiff > 1) {
      user.currentStreak = 1;
    }
    
    user.lastLoginDate = today;
    return user.save();
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("User", userSchema);
