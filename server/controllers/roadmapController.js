const mongoose = require('mongoose');
const roadmapSchema = require('../models/roadmapModel');
const checkpointSchema = require('../models/checkpointModel');
const resourceSchema = require('../models/resourceModel');
const feedbackSchema = require('../models/feedbackModel'); // Add this line
const generateRoadmap = require('../utils/roadmapGeneration');
const { achievementEmitter } = require('../services/achievementService');
const { xpEmitter } = require('../services/xpService');
const userModel = require('../models/userModel');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const roadmapController = {
    generateRoadmap: async (req, res) => {
        try {
            const topic = req.body.topic;
            const user = await userModel.findById(req.userId);
            if(!user){
                return res.status(404).json({ message: "User not found" });
            }

            let roadmapUserId = null;
            let roadmapUser = null;
            const existingRoadmap = await roadmapSchema.findOne({
                mainTopic: { $regex: new RegExp(topic, 'i') }
            }).populate({
                path: "checkpoints",
                populate: {
                    path: "resources",
                    model: "Resource",
                },
            });

            if(existingRoadmap){
                roadmapUserId = existingRoadmap.users[0].userId;
                roadmapUser = await userModel.findById(roadmapUserId);
            }

        
            if (existingRoadmap && roadmapUser && roadmapUser.clusterId === user.clusterId) {

                const userAlreadyJoined = existingRoadmap.users.some(u => 
                    u.userId.toString() === req.userId
                );
                
                if (!userAlreadyJoined) {
                    existingRoadmap.users.push({
                        userId: req.userId,
                        progress: 0,
                        joinedAt: new Date()
                    });
                    await existingRoadmap.save();
                    
                    if (!user.roadmaps.includes(existingRoadmap._id)) {
                        await userModel.addRoadmap(req.userId, existingRoadmap._id);
                    }
                    
                    if (existingRoadmap.checkpoints && existingRoadmap.checkpoints.length > 0) {
                        const firstCheckpoint = existingRoadmap.checkpoints[0];
                        await firstCheckpoint.updateUserProgress(req.userId, 'in_progress');
                    }
                }
                
                const processedCheckpoints = existingRoadmap.checkpoints.map(cp => {
                    const userProgress = cp.getUserProgress(req.userId);
                    return {
                        ...cp.toObject(),
                        status: userProgress.status,
                        startedAt: userProgress.startedAt,
                        completedAt: userProgress.completedAt,
                        totalTimeTaken: userProgress.totalTimeTaken,
                        isFeedbackCompleted: userProgress.isFeedbackCompleted || false
                    };
                });
                
                const roadmapData = {
                    ...existingRoadmap.toObject(),
                    checkpoints: processedCheckpoints,
                    isExisting: true
                };
                
                return res.status(200).json(roadmapData);
            }


            const clusterSummaryResponse = await axios.get(`${process.env.FLASK_BASE_URL}/clusters/cluster-summary?id=${user.clusterId}`);
            const clusterSummary = clusterSummaryResponse.data.summary;

            const _res = await axios.post(`${process.env.FLASK_BASE_URL}/api/generate-roadmap`, { topic, summary: clusterSummary });
            const roadmap = _res.data;
            
            const checkpoints = await Promise.all(roadmap.checkpoints.map(async (checkpoint, index) => {
                checkpoint.order = index + 1;
                const newCheckpoint = await checkpointSchema.createCheckpoint(checkpoint);
                
                if (index === 0) {
                    await newCheckpoint.updateUserProgress(req.userId, 'in_progress');
                }
                
                return newCheckpoint._id;
            }));

            const newRoadmap = new roadmapSchema({
                users: [{
                    userId: req.userId,
                    progress: 0,
                    joinedAt: new Date()
                }],
                mainTopic: roadmap.mainTopic,
                description: roadmap.description,
                checkpoints: checkpoints
            });
            
            const savedRoadmap = await newRoadmap.save();
            await userModel.addRoadmap(req.userId, savedRoadmap._id);
            
            const populatedCheckpoints = await checkpointSchema.getCheckpoints(savedRoadmap.checkpoints);
            const processedCheckpoints = populatedCheckpoints.map(cp => {
                const userProgress = cp.getUserProgress(req.userId);
                return {
                    ...cp.toObject(),
                    status: userProgress.status,
                    startedAt: userProgress.startedAt,
                    completedAt: userProgress.completedAt,
                    totalTimeTaken: userProgress.totalTimeTaken,
                    isFeedbackCompleted: userProgress.isFeedbackCompleted || false
                };
            });
            
            const responseData = {
                ...savedRoadmap.toObject(),
                checkpoints: processedCheckpoints
            };
            
            res.status(201).json(responseData);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    getRoadmaps: async (req, res) => {
        try {
            const roadmaps = await userModel.getUsersRoadmaps(req.userId);
            
            const processedRoadmaps = roadmaps.map(roadmap => {
                const processedCheckpoints = roadmap.checkpoints.map(checkpoint => {
                    const userProgress = checkpoint.getUserProgress(req.userId);
                    return {
                        ...checkpoint.toObject(),
                        status: userProgress.status,
                        startedAt: userProgress.startedAt,
                        completedAt: userProgress.completedAt,
                        totalTimeTaken: userProgress.totalTimeTaken,
                        isFeedbackCompleted: userProgress.isFeedbackCompleted || false
                    };
                });
                
                const totalCheckpoints = processedCheckpoints.length;
                const completedCheckpoints = processedCheckpoints.filter(cp => cp.status === 'completed').length;
                const progress = totalCheckpoints > 0 ? Math.floor((completedCheckpoints / totalCheckpoints) * 100) : 0;
                
                return {
                    ...roadmap.toObject(),
                    checkpoints: processedCheckpoints,
                    totalProgress: progress
                };
            });
            
            res.status(200).json(processedRoadmaps);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    getLeaderboard: async (req, res) => {
        try {
            const { roadmapId } = req.params;
            
            const roadmap = await roadmapSchema.findById(roadmapId)
                .populate({
                    path: 'users.userId',
                    select: 'name email level xps'
                })
                .populate('checkpoints');
            
            if (!roadmap) {
                return res.status(404).json({ message: "Roadmap not found" });
            }
            
            const userIds = roadmap.users.map(user => user.userId._id);
            
            const leaderboardData = await Promise.all(userIds.map(async (userId) => {
                const user = await userModel.findById(userId);
                if (!user) return null;
                
                const totalCheckpoints = roadmap.checkpoints.length;
                let completedCheckpoints = 0;
                let totalTimeTaken = 0;
                
                for (const checkpoint of roadmap.checkpoints) {
                    const userProgress = checkpoint.getUserProgress(userId);
                    if (userProgress.status === 'completed') {
                        completedCheckpoints++;
                        totalTimeTaken += userProgress.totalTimeTaken || 0;
                    }
                }
                
                const progressPercentage = Math.round((completedCheckpoints / totalCheckpoints) * 100);
                
                return {
                    userId: userId,
                    name: user.name,
                    level: user.level,
                    xps: user.xps,
                    completedCheckpoints,
                    totalCheckpoints,
                    progressPercentage,
                    timeSpent: totalTimeTaken
                };
            }));
            
            const sortedLeaderboard = leaderboardData
                .filter(entry => entry !== null)
                .sort((a, b) => {
                    if (b.progressPercentage !== a.progressPercentage) {
                        return b.progressPercentage - a.progressPercentage;
                    }
                    if (b.completedCheckpoints !== a.completedCheckpoints) {
                        return b.completedCheckpoints - a.completedCheckpoints;
                    }
                    return a.timeSpent - b.timeSpent;
                });
            
            res.status(200).json(sortedLeaderboard);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    updateCheckpointStatus : async (req, res) => {
        try {
            const { roadmapId, checkpointId, status } = req.body;
            const roadmap = await roadmapSchema.findById(roadmapId).populate('checkpoints');
            
            if(!roadmap){
                return res.status(404).json({ message: "Roadmap not found" });
            }

            const checkpoint = roadmap.checkpoints.find(cp => cp._id.toString() === checkpointId);
            
            if(!checkpoint){
                return res.status(404).json({ message: "Checkpoint not found" });
            }

            let userProgress = checkpoint.getUserProgress(req.userId);
            
         
            if (userProgress.status === 'in_progress' && status === 'not_started') {
                return res.status(400).json({ 
                  message: "Cannot change status from 'In Progress' back to 'Not Started'" 
                });
            }
              
            if (userProgress.status === 'completed' && (status === 'in_progress' || status === 'not_started')) {
                return res.status(400).json({ 
                  message: "Cannot change status from 'Completed' to a previous status" 
                });
            }

            
            if (checkpoint.order > 1) {
                const prevCheckpoint = roadmap.checkpoints.find(cp => cp.order === checkpoint.order - 1);
                
                if (prevCheckpoint) {
                    const prevCheckpointUserProgress = prevCheckpoint.getUserProgress(req.userId);
                    
                    if (prevCheckpointUserProgress.status !== 'completed' && status === 'completed') {
                        return res.status(400).json({
                            message: "Complete the previous checkpoint first"
                        });
                    }
                }
            }

            const isNewCompletion = status === 'completed' && userProgress.status !== 'completed';

            await checkpoint.updateUserProgress(req.userId, status);
            
            if (status === 'completed') {
                const nextCheckpoint = roadmap.checkpoints.find(cp => cp.order === checkpoint.order + 1);
                if (nextCheckpoint) {
                    const nextCheckpointProgress = nextCheckpoint.getUserProgress(req.userId);
                    if (nextCheckpointProgress.status === 'not_started') {
                        await nextCheckpoint.updateUserProgress(req.userId, 'in_progress');
                    }
                }
            }

            const totalCheckpoints = roadmap.checkpoints.length;
            let completedCheckpoints = 0;
            
            for (const cp of roadmap.checkpoints) {
                const cpUserProgress = cp.getUserProgress(req.userId);
                if (cpUserProgress.status === 'completed') {
                    completedCheckpoints++;
                }
            }
            
            userProgress = Math.floor((completedCheckpoints / totalCheckpoints) * 100);
            
            const userIndex = roadmap.users.findIndex(u => u.userId.toString() === req.userId);
            if (userIndex !== -1) {
                roadmap.users[userIndex].progress = userProgress;
                await roadmap.save();
            }

            const totalUsersProgress = roadmap.users.reduce((sum, u) => sum + u.progress, 0);
            roadmap.totalProgress = Math.floor(totalUsersProgress / roadmap.users.length);
            await roadmap.save();

            if (isNewCompletion) {
                xpEmitter.emit('checkpoint-completed', {
                    userId: req.userId,
                    checkpointId
                });
            }

            const isRoadmapCompleted = userProgress === 100;

            if(isRoadmapCompleted){
                const currentUser = await userModel.findById(req.userId);
                if (!currentUser.completedRoadmaps.includes(roadmapId)) {
                    currentUser.completedRoadmaps.push(roadmapId);
                    await currentUser.save();

                    achievementEmitter.emit('roadmap-completed', { 
                        userId: req.userId 
                    });

                    xpEmitter.emit('roadmap-completed', {
                        userId: req.userId,
                        roadmapId
                    });
                }
            }

            const updatedRoadmap = await roadmapSchema.findById(roadmapId)
                .populate('checkpoints')
                .populate({
                    path: 'checkpoints',
                    populate: {
                        path: 'resources',
                        model: 'Resource'
                    }
                });
            
            const processedCheckpoints = updatedRoadmap.checkpoints.map(cp => {
                const cpUserProgress = cp.getUserProgress(req.userId);
                return {
                    ...cp.toObject(),
                    status: cpUserProgress.status,
                    startedAt: cpUserProgress.startedAt,
                    completedAt: cpUserProgress.completedAt,
                    totalTimeTaken: cpUserProgress.totalTimeTaken,
                    isFeedbackCompleted: cpUserProgress.isFeedbackCompleted || false
                };
            });
            
            const responseData = {
                ...updatedRoadmap.toObject(),
                checkpoints: processedCheckpoints,
                totalProgress: userProgress === NaN ? 0 : userProgress
            };
            
            res.status(200).json(responseData);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    submitFeedback: async (req, res) => {
        try {
            const { roadmapId, checkpointId, rating, comment } = req.body;
            
            if (!roadmapId || !checkpointId || !rating) {
                return res.status(400).json({ 
                    message: "Roadmap ID, Checkpoint ID, and rating are required" 
                });
            }
            
            const roadmap = await roadmapSchema.findById(roadmapId)
                .populate('checkpoints');
            
            if (!roadmap) {
                return res.status(404).json({ message: "Roadmap not found" });
            }
            
            const checkpoint = roadmap.checkpoints.find(
                cp => cp._id.toString() === checkpointId
            );
            
            if (!checkpoint) {
                return res.status(404).json({ 
                    message: "Checkpoint not found in this roadmap" 
                });
            }
            
            const userProgress = checkpoint.getUserProgress(req.userId);
            if (userProgress.status !== 'completed') {
                return res.status(400).json({ 
                    message: "You must complete the checkpoint before providing feedback" 
                });
            }
            
            const feedback = await feedbackSchema.createOrUpdateFeedback({
                userId: req.userId,
                roadmapId,
                checkpointId,
                rating,
                comment
            });
            
            const userProgressIndex = checkpoint.userProgress.findIndex(
                progress => progress.userId.toString() === req.userId
            );
            
            if (userProgressIndex !== -1) {
                checkpoint.userProgress[userProgressIndex].isFeedbackCompleted = true;
                await checkpoint.save();
            }
            
            res.status(201).json({
                message: "Feedback submitted successfully",
                feedback
            });
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },
    
    getCheckpointFeedback: async (req, res) => {
        try {
            const { checkpointId } = req.params;
            
            const feedback = await feedbackSchema.getCheckpointFeedback(checkpointId);
            
            const averageRating = await feedbackSchema.getCheckpointAverageRating(checkpointId);

            console.log(averageRating);
            
            res.status(200).json({
                feedback,
                averageRating
            });
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },
    
    getUserFeedback: async (req, res) => {
        try {
            const { checkpointId } = req.params;
            
            const feedback = await feedbackSchema.findOne({
                userId: req.userId,
                checkpointId
            });
            
            res.status(200).json(feedback || { exists: false });
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },
    // Add this function to your roadmapController.js file

getLeaderboardInsights: async (req, res) => {
    try {
        const { roadmapId } = req.params;
        const userId = req.userId; // Current user
        
        // Get the roadmap with populated data
        const roadmap = await roadmapSchema.findById(roadmapId)
            .populate({
                path: 'users.userId',
                select: 'name email level xps'
            })
            .populate({
                path: 'checkpoints',
                populate: {
                    path: 'resources',
                    model: 'Resource'
                }
            });
        
        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }
        
        // Get complete leaderboard data first
        const userIds = roadmap.users.map(user => user.userId._id);
        
        const leaderboardData = await Promise.all(userIds.map(async (uid) => {
            const user = await userModel.findById(uid);
            if (!user) return null;
            
            const totalCheckpoints = roadmap.checkpoints.length;
            let completedCheckpoints = 0;
            let totalTimeTaken = 0;
            let completedCheckpointIds = [];
            
            for (const checkpoint of roadmap.checkpoints) {
                const userProgress = checkpoint.getUserProgress(uid);
                if (userProgress.status === 'completed') {
                    completedCheckpoints++;
                    completedCheckpointIds.push(checkpoint._id.toString());
                    totalTimeTaken += userProgress.totalTimeTaken || 0;
                }
            }
            
            const progressPercentage = Math.round((completedCheckpoints / totalCheckpoints) * 100);
            
            return {
                userId: uid,
                name: user.name,
                level: user.level,
                xps: user.xps,
                completedCheckpoints,
                completedCheckpointIds,
                totalCheckpoints,
                progressPercentage,
                timeSpent: totalTimeTaken,
                averageTimePerCheckpoint: completedCheckpoints > 0 ? totalTimeTaken / completedCheckpoints : 0
            };
        }));
        
        const filteredLeaderboard = leaderboardData.filter(entry => entry !== null);
        
        // Sort leaderboard to get top performers
        const sortedLeaderboard = [...filteredLeaderboard].sort((a, b) => {
            if (b.progressPercentage !== a.progressPercentage) {
                return b.progressPercentage - a.progressPercentage;
            }
            if (b.completedCheckpoints !== a.completedCheckpoints) {
                return b.completedCheckpoints - a.completedCheckpoints;
            }
            return a.timeSpent - b.timeSpent;
        });
        
        // Get current user's data and position
        const currentUserIndex = sortedLeaderboard.findIndex(entry => entry.userId.toString() === userId);
        const currentUserData = currentUserIndex >= 0 ? sortedLeaderboard[currentUserIndex] : null;
        
        if (!currentUserData) {
            return res.status(404).json({ message: "User not found in this roadmap" });
        }
        
        // Get top 3 performers
        const topPerformers = sortedLeaderboard.slice(0, 3);
        
        // Generate insights
        const insights = {
            userRank: currentUserIndex + 1,
            totalParticipants: sortedLeaderboard.length,
            progressComparison: {
                userProgress: currentUserData.progressPercentage,
                averageProgress: Math.round(sortedLeaderboard.reduce((sum, entry) => sum + entry.progressPercentage, 0) / sortedLeaderboard.length),
                topPerformerProgress: topPerformers[0].progressPercentage,
                percentilRank: Math.round(((sortedLeaderboard.length - currentUserIndex) / sortedLeaderboard.length) * 100)
            },
            timeComparison: {
                userAverageTime: Math.round(currentUserData.averageTimePerCheckpoint / 60), // in minutes
                leaderAverageTime: Math.round(topPerformers[0].averageTimePerCheckpoint / 60), // in minutes
                averageTimeAllUsers: Math.round(sortedLeaderboard.reduce((sum, entry) => 
                    sum + (entry.averageTimePerCheckpoint), 0) / sortedLeaderboard.length / 60) // in minutes
            },
            topPerformerInsights: [],
            recommendations: []
        };
        
        // Generate specific insights about what top performers are doing differently
        const topPerformerCheckpoints = new Set();
        topPerformers.forEach(performer => {
            performer.completedCheckpointIds.forEach(id => topPerformerCheckpoints.add(id));
        });
        
        const userCompletedCheckpoints = new Set(currentUserData.completedCheckpointIds);
        const userInProgressCheckpoints = new Set();
        
        // Find checkpoints user hasn't completed but top performers have
        const checkpointGaps = [];
        for (const checkpoint of roadmap.checkpoints) {
            const checkpointId = checkpoint._id.toString();
            const userProgress = checkpoint.getUserProgress(userId);
            
            if (userProgress.status === 'in_progress') {
                userInProgressCheckpoints.add(checkpointId);
            }
            
            if (topPerformerCheckpoints.has(checkpointId) && !userCompletedCheckpoints.has(checkpointId)) {
                checkpointGaps.push({
                    id: checkpointId,
                    title: checkpoint.title,
                    order: checkpoint.order
                });
            }
        }
        
        // Add insights about top performers
        if (topPerformers[0].timeSpent < currentUserData.timeSpent && 
            topPerformers[0].completedCheckpoints > currentUserData.completedCheckpoints) {
            insights.topPerformerInsights.push("Top performers are completing checkpoints more efficiently, spending less time per checkpoint");
        }
        
        if (checkpointGaps.length > 0) {
            insights.topPerformerInsights.push(`Top performers have completed ${checkpointGaps.length} checkpoints that you haven't completed yet`);
        }
        
        // Generate recommendations
        if (userInProgressCheckpoints.size > 0) {
            insights.recommendations.push("Focus on completing your in-progress checkpoints before moving to new ones");
        }
        
        if (insights.timeComparison.userAverageTime > insights.timeComparison.leaderAverageTime * 1.5) {
            insights.recommendations.push("Try to be more focused during learning sessions to reduce time per checkpoint");
        }
        
        if (checkpointGaps.length > 0) {
            const nextCheckpoint = checkpointGaps.sort((a, b) => a.order - b.order)[0];
            insights.recommendations.push(`Consider completing '${nextCheckpoint.title}' next, as most top performers have completed it`);
        }
        
        if (currentUserData.progressPercentage < insights.progressComparison.averageProgress) {
            insights.recommendations.push("You're currently progressing slower than average. Try to dedicate more consistent time to this roadmap");
        }
        
        // Return insights along with the leaderboard data
        res.status(200).json({
            insights,
            leaderboard: sortedLeaderboard,
            currentUserPosition: currentUserIndex + 1
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}
};

module.exports = roadmapController;