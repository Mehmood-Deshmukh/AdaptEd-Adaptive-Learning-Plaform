const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.statics.createUser = async function (name, email, password) {
    try {
        const user = new this({ name, email, password });
        return user.save();
    } catch (error) {
        throw error;
    }
}

userSchema.statics.getUserByEmail = async function (email) {
    try {
        return this.findOne({ email });
    } catch (error) {
        throw error;
    }
}

userSchema.statics.updateResetPasswordToken = async function (email, token) {
    try {
        const user = await this.findOne({ email });
        if (!user) {
            throw new Error('No user with that email');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpire = Date.now() + 600000; 
        return user.save();
    } catch (error) {
        throw error;
    }
}

module.exports = mongoose.model('User', userSchema);