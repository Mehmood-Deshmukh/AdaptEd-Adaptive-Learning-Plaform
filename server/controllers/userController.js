const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({
                status: 'success',
                message: 'User logged in successfully',
                data: user,
                token
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
}

module.exports = userController;