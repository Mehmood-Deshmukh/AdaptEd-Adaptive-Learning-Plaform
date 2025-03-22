const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Community = require("../models/communityModel")
const sendMail = require('../utils/sendMail');

const userController = {
    register: async (req, res) => {
        const { name, email, password } = req.body;

        try {
            const user = await userModel.getUserByEmail(email);
            if (user) {
                return res.status(400).json({
                    status: 'error',
                    message: 'User already exists'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await userModel.createUser(name, email, hashedPassword);

            const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(201).json({
                status: 'success',
                message: 'User created successfully',
                data: newUser,
                token
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },
    login : async (req, res) => {
        const { email, password } = req.body;

        try {

            
            const user = await userModel.getUserByEmail(email);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Invalid credentials'
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Invalid credentials'
                });
            }

            await userModel.updateLoginStreak(user._id);

            const updatedUser = await userModel.findById(user._id);
            console.log(updatedUser);

            await updatedUser.populate('roadmaps');

            const token = jwt.sign({ userId: updatedUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({
                status: 'success',
                message: 'User logged in successfully',
                data: updatedUser,
                token
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },
    forgotPassword: async (req, res) => {
        const { email } = req.body;

        try {
            const user = await userModel.getUserByEmail(email);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase();
            const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

            await userModel.updateResetPasswordToken(email, resetPasswordToken);

            sendMail(email, 'Password Reset Request', 'forgotPassword', { token: resetToken });

            res.status(200).json({
                status: 'success',
                message: 'Password reset token sent to email'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },
    resetPassword: async (req, res) => {
        const { email, token, password } = req.body;

        try {
            const user = await userModel.getUserByEmail(email);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
            if (resetPasswordToken !== user.resetPasswordToken) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid token'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            res.status(200).json({
                status: 'success',
                message: 'Password reset successful'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },
    checkAuth: async (req, res) => {
        try{
            const Authorization = req.headers.authorization;
            const token = Authorization && Authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized'
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await userModel.findById(decoded.userId);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            await user.populate('roadmaps');

            res.status(200).json({
                status: 'success',
                data: user
            });

        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    joinCommunity: async (req, res) => {
        try{
            const { communityId } = req.body;
            console.log(req.userId);
            const user = await userModel.findById(req.userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                    data: null
                })
            }

            if (user.communities?.includes(communityId)) {
                return res.status(203).json({
                    success: true,
                    message: "Already in the community",
                    data: null
                })
            }

            user.communities.push(communityId);
            await user.save();

            const community = await Community.findById(communityId);
            community.membersCount++;

            await community.save();

            res.status(201).json({
                success: true,
                message: "successfully joined the community",
                data: null
            })
        }catch(e) {
            console.log(e.message);
            res.status(500).json({
                success: false, 
                message: e.message,
                data: null
            })
        }
    },
    leaveCommunity: async (req, res) => {
        try{
            const {communityId} = req.body;
            const user = await userModel.findById(req.userId);

            user.communities = user.communities.filter(c => c != communityId)
            const community = await Community.findById(communityId);

            community.membersCount--;
            
            await user.save();
            await community.save();

            res.status(200).json({
                success: true,
                message: "successfully left the community",
                data: null
            })
        }catch(e) {
            console.log(e.message);
            res.status(500).json({
                success: false,
                message: e.message,
                data: null
            })
        }
    }
}

module.exports = userController;