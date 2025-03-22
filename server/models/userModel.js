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
  role : {
    type: String,
    default: "user"
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
  clusterId: {
    type: Number,
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
  // this might be redundant but keeping it for now
  learningParameters: {
    learningStyle: {
      type: String,
    },
    timeCommitment: {
      type: Number,
    },
    domainInterest: {
      type: [String],
    },
    preferredDifficulty: {
      type: String,
    },
  },
  surveyParameters: {
    visualLearning: {
      type: Number,
    },
    auditoryLearning: {
      type: Number,
    },
    readingWritingLearning: {
      type: Number,
    },
    kinestheticLearning: {
      type: Number,
    },
    challengeTolerance: {
      type: Number,
    },
    timeCommitment: {
      type: Number,
    },
    learningPace: {
      type: Number,
    },
    socialPreference: {
      type: Number,
    },
    feedbackPreference: {
      type: Number,
    },
  },
  isAssessmentComplete: {
    type: Boolean,
    default: false,
  },
  communities: [
    {
      type: Schema.Types.ObjectId,
      ref: "Community",
    },
  ],
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
  lastLoginDate: {
    type: Date,
    default: null,
  },
  shouldShowStreakPopup: {
    type: Boolean,
    default: false,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  maxStreak: {
    type: Number,
    default: 0,
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

    // First-time login case
    if (!user.lastLoginDate) {
      user.lastLoginDate = today;
      user.currentStreak = 1;
      user.maxStreak = 1;
      user.shouldShowStreakPopup = true; // Add flag to show popup
      return user.save();
    }

    const lastLogin = new Date(user.lastLoginDate);
    const lastLoginDay = new Date(
      lastLogin.getFullYear(),
      lastLogin.getMonth(),
      lastLogin.getDate()
    );

    // Reset the popup flag by default
    user.shouldShowStreakPopup = false;

    // Already logged in today
    if (today.getTime() === lastLoginDay.getTime()) {
      return user.save();
    }

    const timeDiff = today.getTime() - lastLoginDay.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    // Continuing streak (exactly one day difference)
    if (dayDiff === 1) {
      user.currentStreak += 1;
      if (user.currentStreak > user.maxStreak) {
        user.maxStreak = user.currentStreak;
      }
      user.shouldShowStreakPopup = true; // Show popup for continuing streak
    }
    // Streak broken (more than one day passed)
    else if (dayDiff > 1) {
      user.currentStreak = 1;
      // No popup shown for reset streaks
    }

    user.lastLoginDate = today;
    return user.save();
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("User", userSchema);
