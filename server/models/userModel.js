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
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
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

module.exports = mongoose.model("User", userSchema);
