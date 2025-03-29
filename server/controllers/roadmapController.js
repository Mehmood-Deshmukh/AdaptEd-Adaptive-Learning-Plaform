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

            if(existingRoadmap && existingRoadmap.users[0]){
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
    getLeaderboardInsights : async (req, res) => {
        try {
            const { roadmapId } = req.params;
            const userId = req.userId; 
            const currentDatetime = new Date();
            
         
            const roadmap = await roadmapSchema.findById(roadmapId)
                .populate({
                    path: 'users.userId',
                    select: 'name email level xps lastLoginDate currentStreak maxStreak'
                })
                .populate({
                    path: 'checkpoints',
                    populate: [{
                        path: 'resources',
                        model: 'Resource'
                    }, {
                        path: 'userProgress.userId',
                        model: 'User',
                        select: 'name level'
                    }]
                });
            
            if (!roadmap) {
                return res.status(404).json({ message: "Roadmap not found" });
            }
    
    
            const userIds = roadmap.users.map(user => user.userId._id)
            
            const leaderboardData = await Promise.all(userIds.map(async (uid) => {
                const user = await userModel.findById(uid);
                if (!user) return null;
                
                const totalCheckpoints = roadmap.checkpoints.length;
                let completedCheckpoints = 0;
                let inProgressCheckpoints = 0;
                let totalTimeTaken = 0;
                let completedCheckpointIds = [];
                let inProgressCheckpointIds = [];
                
                let resourceEngagement = {
                    total: 0,
                    video: 0,
                    article: 0,
                    exercise: 0,
                    quiz: 0,
                    documentation: 0,
                    other: 0,
                    byDifficulty: {
                        beginner: 0,
                        intermediate: 0,
                        advanced: 0
                    },
                    byTopic: {}
                };
                
                let studyHabits = {
                    morningStudy: 0,  // 5-12
                    afternoonStudy: 0, // 12-17
                    eveningStudy: 0,   // 17-22
                    nightStudy: 0,     // 22-5
                    weekdayStudy: 0,
                    weekendStudy: 0
                };
                
                const lastSevenDays = new Array(7).fill(0);
                
                for (const checkpoint of roadmap.checkpoints) {
    
                    const userProgress = checkpoint.getUserProgress(uid);
    
                    
                    if (userProgress.status === 'completed') {
                        completedCheckpoints++;
                        completedCheckpointIds.push(checkpoint._id.toString());
                        totalTimeTaken += userProgress.totalTimeTaken || 0;
                        
                        if (userProgress.completedAt) {
                            const completionDate = new Date(userProgress.completedAt);
                            const hour = completionDate.getHours();
                            const dayOfWeek = completionDate.getDay(); 
                            
                            
                            if (hour >= 5 && hour < 12) studyHabits.morningStudy++;
                            else if (hour >= 12 && hour < 17) studyHabits.afternoonStudy++;
                            else if (hour >= 17 && hour < 22) studyHabits.eveningStudy++;
                            else studyHabits.nightStudy++;
                            
                            
                            if (dayOfWeek === 0 || dayOfWeek === 6) studyHabits.weekendStudy++;
                            else studyHabits.weekdayStudy++;
                            
                            
                            const daysAgo = Math.floor((currentDatetime - completionDate) / (1000 * 60 * 60 * 24));
                            if (daysAgo >= 0 && daysAgo < 7) {
                                lastSevenDays[daysAgo]++;
                            }
                        }
                        
                        if (checkpoint.resources && checkpoint.resources.length > 0) {
                            checkpoint.resources.forEach(resource => {
                                resourceEngagement.total++;
                                
                                const type = resource.type.toLowerCase();
                                if (type === 'video') resourceEngagement.video++;
                                else if (type === 'article') resourceEngagement.article++;
                                else if (type === 'exercise') resourceEngagement.exercise++;
                                else if (type === 'quiz') resourceEngagement.quiz++;
                                else if (type === 'documentation') resourceEngagement.documentation++;
                                else resourceEngagement.other++;
                                
                                const difficulty = resource.difficulty.toLowerCase();
                                if (difficulty === 'beginner') resourceEngagement.byDifficulty.beginner++;
                                else if (difficulty === 'intermediate') resourceEngagement.byDifficulty.intermediate++;
                                else if (difficulty === 'advanced') resourceEngagement.byDifficulty.advanced++;
                                
                                // Track by topic
                                if (resource.topics && resource.topics.length > 0) {
                                    resource.topics.forEach(topic => {
                                        if (!resourceEngagement.byTopic[topic]) {
                                            resourceEngagement.byTopic[topic] = 0;
                                        }
                                        resourceEngagement.byTopic[topic]++;
                                    });
                                }
                            });
                        }
                    } else if (userProgress.status === 'in_progress') {
                        inProgressCheckpoints++;
                        inProgressCheckpointIds.push(checkpoint._id.toString());
                    }
                }
                
                const progressPercentage = Math.round((completedCheckpoints / totalCheckpoints) * 100);
                const averageTimePerCheckpoint = completedCheckpoints > 0 ? totalTimeTaken / completedCheckpoints : 0;
                const consistencyScore = lastSevenDays.filter(day => day > 0).length / 7 * 100;
                
                // Determine preferred learning style based on resource engagement
                let preferredLearningStyle = "Balanced";
                const resourceTypes = [
                    { type: "Visual", count: resourceEngagement.video },
                    { type: "Reading", count: resourceEngagement.article + resourceEngagement.documentation },
                    { type: "Interactive", count: resourceEngagement.exercise + resourceEngagement.quiz }
                ];
                
                const maxResourceType = resourceTypes.reduce((prev, current) => 
                    (prev.count > current.count) ? prev : current, { count: 0 });
                    
                if (maxResourceType.count > 0 && 
                    maxResourceType.count / resourceEngagement.total > 0.5) {
                    preferredLearningStyle = maxResourceType.type;
                }
                
                // Determine preferred study time
                const studyTimes = [
                    { time: "Morning", count: studyHabits.morningStudy },
                    { time: "Afternoon", count: studyHabits.afternoonStudy },
                    { time: "Evening", count: studyHabits.eveningStudy },
                    { time: "Night", count: studyHabits.nightStudy }
                ];
                
                const maxStudyTime = studyTimes.reduce((prev, current) => 
                    (prev.count > current.count) ? prev : current, { count: 0 });
                    
                const preferredStudyTime = maxStudyTime.count > 0 ? maxStudyTime.time : "Varied";
                
                // Determine favorite topics based on resource engagement
                const favoriteTopics = Object.entries(resourceEngagement.byTopic)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(entry => entry[0]);
                
                // Determine difficulty preference
                let difficultyPreference = "Balanced";
                const difficulties = Object.entries(resourceEngagement.byDifficulty);
                const maxDifficulty = difficulties.reduce((prev, current) => 
                    (current[1] > prev[1]) ? current : prev, ["", 0]);
                    
                if (maxDifficulty[1] > 0 && 
                    maxDifficulty[1] / resourceEngagement.total > 0.5) {
                    difficultyPreference = maxDifficulty[0].charAt(0).toUpperCase() + maxDifficulty[0].slice(1);
                }
                
                return {
                    userId: uid.toString(),
                    name: user.name,
                    level: user.level,
                    xps: user.xps,
                    streak: user.currentStreak || 0,
                    maxStreak: user.maxStreak || 0,
                    completedCheckpoints,
                    inProgressCheckpoints,
                    completedCheckpointIds,
                    inProgressCheckpointIds,
                    totalCheckpoints,
                    progressPercentage,
                    timeSpent: totalTimeTaken,
                    averageTimePerCheckpoint,
                    studyHabits,
                    resourceEngagement,
                    lastSevenDaysActivity: lastSevenDays,
                    consistencyScore,
                    preferredLearningStyle,
                    preferredStudyTime,
                    favoriteTopics,
                    difficultyPreference,
                    weekdayWeekendRatio: studyHabits.weekendStudy > 0 ? 
                        (studyHabits.weekdayStudy / studyHabits.weekendStudy).toFixed(1) : 
                        (studyHabits.weekdayStudy > 0 ? "Weekdays only" : "No data")
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
            const currentUserIndex = sortedLeaderboard.findIndex(entry => entry.userId === userId);
            const currentUserData = currentUserIndex >= 0 ? sortedLeaderboard[currentUserIndex] : null;
            
            if (!currentUserData) {
                return res.status(404).json({ message: "User not found in this roadmap" });
            }
            
            // Get top 3 performers (or fewer if not enough users)
            const topPerformers = sortedLeaderboard.slice(0, Math.min(3, sortedLeaderboard.length));
            
            // Calculate averages across all users
            const averages = {
                progressPercentage: Math.round(sortedLeaderboard.reduce((sum, entry) => sum + entry.progressPercentage, 0) / sortedLeaderboard.length),
                timePerCheckpoint: sortedLeaderboard.reduce((sum, entry) => sum + entry.averageTimePerCheckpoint, 0) / sortedLeaderboard.length,
                consistencyScore: Math.round(sortedLeaderboard.reduce((sum, entry) => sum + entry.consistencyScore, 0) / sortedLeaderboard.length),
                resourceTypes: {
                    video: Math.round(sortedLeaderboard.reduce((sum, entry) => sum + entry.resourceEngagement.video, 0) / sortedLeaderboard.length),
                    article: Math.round(sortedLeaderboard.reduce((sum, entry) => sum + entry.resourceEngagement.article, 0) / sortedLeaderboard.length),
                    exercise: Math.round(sortedLeaderboard.reduce((sum, entry) => sum + entry.resourceEngagement.exercise, 0) / sortedLeaderboard.length),
                    quiz: Math.round(sortedLeaderboard.reduce((sum, entry) => sum + entry.resourceEngagement.quiz, 0) / sortedLeaderboard.length),
                    documentation: Math.round(sortedLeaderboard.reduce((sum, entry) => sum + entry.resourceEngagement.documentation, 0) / sortedLeaderboard.length)
                },
                streak: Math.round(sortedLeaderboard.reduce((sum, entry) => sum + entry.streak, 0) / sortedLeaderboard.length)
            };
            
            // Calculate topic popularity across all users
            const allTopics = {};
            sortedLeaderboard.forEach(entry => {
                Object.entries(entry.resourceEngagement.byTopic).forEach(([topic, count]) => {
                    if (!allTopics[topic]) {
                        allTopics[topic] = 0;
                    }
                    allTopics[topic] += count;
                });
            });
            
            const popularTopics = Object.entries(allTopics)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(entry => entry[0]);
            
            // Generate insights
            const insights = {
                userRank: currentUserIndex + 1,
                totalParticipants: sortedLeaderboard.length,
                progressComparison: {
                    userProgress: currentUserData.progressPercentage,
                    averageProgress: averages.progressPercentage,
                    topPerformerProgress: topPerformers[0].progressPercentage,
                    percentilRank: Math.round(((sortedLeaderboard.length - currentUserIndex) / sortedLeaderboard.length) * 100)
                },
                timeComparison: {
                    userAverageTime: Math.round(currentUserData.averageTimePerCheckpoint / 60000), // in minutes
                    leaderAverageTime: Math.round(topPerformers[0].averageTimePerCheckpoint / 60000), // in minutes
                    averageTimeAllUsers: Math.round(averages.timePerCheckpoint / 60000) // in minutes
                },
                learningStyleComparison: {
                    yourStyle: currentUserData.preferredLearningStyle,
                    topPerformerStyles: topPerformers.map(p => p.preferredLearningStyle),
                    mostCommonStyle: calculateMostCommonValue(sortedLeaderboard.map(entry => entry.preferredLearningStyle))
                },
                difficultyPreference: {
                    yourPreference: currentUserData.difficultyPreference,
                    topPerformerPreference: calculateMostCommonValue(topPerformers.map(p => p.difficultyPreference))
                },
                resourceEngagement: {
                    yourEngagement: {
                        total: currentUserData.resourceEngagement.total,
                        byType: {
                            video: currentUserData.resourceEngagement.video,
                            article: currentUserData.resourceEngagement.article,
                            exercise: currentUserData.resourceEngagement.exercise,
                            quiz: currentUserData.resourceEngagement.quiz,
                            documentation: currentUserData.resourceEngagement.documentation
                        }
                    },
                    topPerformerEngagement: {
                        total: topPerformers[0].resourceEngagement.total,
                        byType: {
                            video: topPerformers[0].resourceEngagement.video,
                            article: topPerformers[0].resourceEngagement.article,
                            exercise: topPerformers[0].resourceEngagement.exercise,
                            quiz: topPerformers[0].resourceEngagement.quiz,
                            documentation: topPerformers[0].resourceEngagement.documentation
                        }
                    }
                },
                topics: {
                    yourFavorites: currentUserData.favoriteTopics,
                    mostPopular: popularTopics
                },
                studyPatterns: {
                    yourPattern: currentUserData.preferredStudyTime,
                    topPerformerPatterns: topPerformers.map(p => p.preferredStudyTime),
                    yourWeekdayWeekendRatio: currentUserData.weekdayWeekendRatio,
                    topPerformerWeekdayWeekendRatio: topPerformers[0].weekdayWeekendRatio
                },
                consistencyComparison: {
                    yourConsistency: Math.round(currentUserData.consistencyScore),
                    topPerformerConsistency: Math.round(topPerformers[0].consistencyScore),
                    averageConsistency: averages.consistencyScore
                },
                streakComparison: {
                    yourStreak: currentUserData.streak,
                    yourMaxStreak: currentUserData.maxStreak,
                    topPerformerStreak: topPerformers[0].streak,
                    averageStreak: averages.streak
                },
                topPerformerInsights: [],
                recommendations: []
            };
            
            // Generate custom insights and recommendations based on the data
            const generateInsights = () => {
                const insightsList = [];
                const recommendationsList = [];
                
                // Compare progress and speed
                if (currentUserData.progressPercentage < averages.progressPercentage) {
                    insightsList.push("Your progress is below the average for this roadmap");
                    
                    if (currentUserData.timeSpent > 0 && averages.timePerCheckpoint > 0) {
                        if (currentUserData.averageTimePerCheckpoint > averages.timePerCheckpoint * 1.5) {
                            insightsList.push("You're spending more time per checkpoint than most others");
                            recommendationsList.push("Try to focus more during your learning sessions to improve efficiency");
                        }
                    }
                } else if (currentUserData.progressPercentage >= topPerformers[0].progressPercentage * 0.9) {
                    insightsList.push("Your progress is comparable to top performers - keep it up!");
                }
                
                // Resource engagement insights
                if (currentUserData.resourceEngagement.total < topPerformers[0].resourceEngagement.total * 0.7) {
                    insightsList.push("Top performers engage with more resources than you do");
                    recommendationsList.push("Try to explore more of the provided learning materials in each checkpoint");
                }
                
                // Resource type preference insights
                const topPerformerFavoriteType = Object.entries(topPerformers[0].resourceEngagement)
                    .filter(([key, _]) => ['video', 'article', 'exercise', 'quiz', 'documentation'].includes(key))
                    .sort((a, b) => b[1] - a[1])[0];
                    
                const userFavoriteType = Object.entries(currentUserData.resourceEngagement)
                    .filter(([key, _]) => ['video', 'article', 'exercise', 'quiz', 'documentation'].includes(key))
                    .sort((a, b) => b[1] - a[1])[0];
                    
                if (topPerformerFavoriteType && userFavoriteType && 
                    topPerformerFavoriteType[0] !== userFavoriteType[0] && 
                    topPerformerFavoriteType[1] > 0) {
                    insightsList.push(`Top performers prefer ${topPerformerFavoriteType[0]} content, while you favor ${userFavoriteType[0]} resources`);
                    recommendationsList.push(`Try incorporating more ${topPerformerFavoriteType[0]} resources to diversify your learning approach`);
                }
                
                // Learning style insights
                if (insights.learningStyleComparison.yourStyle !== insights.learningStyleComparison.topPerformerStyles[0]) {
                    insightsList.push(`Your learning style (${insights.learningStyleComparison.yourStyle}) differs from top performers (${insights.learningStyleComparison.topPerformerStyles[0]})`);
                }
                
                // Difficulty preference insights
                if (insights.difficultyPreference.yourPreference !== insights.difficultyPreference.topPerformerPreference) {
                    insightsList.push(`You prefer ${insights.difficultyPreference.yourPreference.toLowerCase()} content, while top performers favor ${insights.difficultyPreference.topPerformerPreference.toLowerCase()} resources`);
                    
                    if (insights.difficultyPreference.yourPreference === "Beginner" && 
                        insights.difficultyPreference.topPerformerPreference === "Intermediate") {
                        recommendationsList.push("Challenge yourself with more intermediate difficulty resources to progress faster");
                    }
                }
                
                // Study time insights
                if (insights.studyPatterns.yourPattern !== insights.studyPatterns.topPerformerPatterns[0] &&
                    insights.studyPatterns.topPerformerPatterns[0] !== "Varied") {
                    insightsList.push(`Top performers tend to study during the ${insights.studyPatterns.topPerformerPatterns[0].toLowerCase()}, while you prefer ${insights.studyPatterns.yourPattern.toLowerCase()} sessions`);
                    recommendationsList.push(`Try studying during ${insights.studyPatterns.topPerformerPatterns[0].toLowerCase()} hours when possible to align with top performers' habits`);
                }
                
                // Continuing from where the code left off
                // Consistency insights
                if (insights.consistencyComparison.yourConsistency < insights.consistencyComparison.topPerformerConsistency * 0.7) {
                    insightsList.push(`Your study consistency (${insights.consistencyComparison.yourConsistency}%) is lower than top performers (${insights.consistencyComparison.topPerformerConsistency}%)`);
                    recommendationsList.push("Increase your learning consistency by studying at least a little bit every day");
                }
                
                // Streak insights
                if (insights.streakComparison.yourStreak < insights.streakComparison.topPerformerStreak * 0.5) {
                    insightsList.push(`Your current streak (${insights.streakComparison.yourStreak} days) is shorter than top performers' (${insights.streakComparison.topPerformerStreak} days)`);
                    recommendationsList.push("Build and maintain a daily learning habit to improve your streak and retention");
                }
                
                // If we have in-progress checkpoints
                if (currentUserData.inProgressCheckpoints > 0) {
                    recommendationsList.push("Focus on completing your in-progress checkpoints before starting new ones");
                }
                
                // Resource diversity recommendation
                if (currentUserData.resourceEngagement.total > 0) {
                    const resourceTypes = ['video', 'article', 'exercise', 'quiz', 'documentation'];
                    const leastUsedType = resourceTypes.reduce((min, type) => {
                        return (currentUserData.resourceEngagement[type] < currentUserData.resourceEngagement[min]) ? type : min;
                    }, resourceTypes[0]);
                    
                    if (currentUserData.resourceEngagement[leastUsedType] === 0 && 
                        averages.resourceTypes[leastUsedType] > 0) {
                        recommendationsList.push(`Try incorporating ${leastUsedType} resources into your learning to gain a more balanced understanding`);
                    }
                }
                
                // Weekday/weekend balance
                if (typeof currentUserData.weekdayWeekendRatio === "string" && 
                    currentUserData.weekdayWeekendRatio === "Weekdays only" &&
                    typeof topPerformers[0].weekdayWeekendRatio !== "string") {
                    recommendationsList.push("Consider dedicating some weekend time to learning, as top performers balance weekday and weekend study");
                }
                
                // Topic exploration
                const topicDifferences = insights.topics.mostPopular.filter(
                    topic => !insights.topics.yourFavorites.includes(topic)
                );
                
                if (topicDifferences.length > 0) {
                    insightsList.push(`You haven't focused on some popular topics like: ${topicDifferences.slice(0, 2).join(', ')}`);
                    recommendationsList.push(`Explore resources related to ${topicDifferences[0]} to align with trending topics`);
                }
                
                // Checkpoint-specific recommendations
                if (currentUserData.completedCheckpointIds.length < topPerformers[0].completedCheckpointIds.length) {
                    const nextCheckpoint = roadmap.checkpoints
                        .filter(cp => !currentUserData.completedCheckpointIds.includes(cp._id.toString()))
                        .sort((a, b) => a.order - b.order)[0];
                    
                    if (nextCheckpoint) {
                        recommendationsList.push(`Focus next on completing "${nextCheckpoint.title}" to match the progress of top performers`);
                    }
                }
                
                return {
                    insights: insightsList.slice(0, 3), // Limit to top 3 insights
                    recommendations: recommendationsList.slice(0, 4) // Limit to top 4 recommendations
                };
            };
            
            // Generate the insights and recommendations
            const personalized = generateInsights();
            insights.topPerformerInsights = personalized.insights;
            insights.recommendations = personalized.recommendations;
            
            // Ensure we always have at least one insight and recommendation
            if (insights.topPerformerInsights.length === 0) {
                if (sortedLeaderboard.length === 1) {
                    insights.topPerformerInsights.push("You're the first person on this roadmap! Keep setting the pace for others to follow.");
                } else {
                    insights.topPerformerInsights.push("Keep learning consistently to discover how your patterns compare to top performers.");
                }
            }
            
            if (insights.recommendations.length === 0) {
                insights.recommendations.push("Continue with your current approach - you're on the right track!");
            }
            
            // Format time values for display
            const formatTimeDuration = (milliseconds) => {
                if (!milliseconds) return "0 min";
                const minutes = Math.floor(milliseconds / 60000);
                
                if (minutes >= 60) {
                    const hours = Math.floor(minutes / 60);
                    const remainingMinutes = minutes % 60;
                    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
                } else {
                    return `${minutes} min`;
                }
            };
            
            // Condense the leaderboard data to only include what's needed for UI display
            const condensedLeaderboard = sortedLeaderboard.map(entry => ({
                userId: entry.userId,
                name: entry.name,
                level: entry.level,
                progressPercentage: entry.progressPercentage,
                completedCheckpoints: entry.completedCheckpoints,
                totalCheckpoints: entry.totalCheckpoints,
                timeSpent: formatTimeDuration(entry.timeSpent),
                streak: entry.streak,
                consistencyScore: Math.round(entry.consistencyScore),
                preferredStudyTime: entry.preferredStudyTime,
                preferredLearningStyle: entry.preferredLearningStyle
            }));
            
            // Return insights along with the condensed leaderboard data
            res.status(200).json({
                insights,
                leaderboard: condensedLeaderboard,
                currentUserPosition: currentUserIndex + 1,
                timestamp: currentDatetime.toISOString()
            });
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    }
    
};

const calculateMostCommonValue = (arr) => {
    if (!arr || arr.length === 0) return null;
    
    const counts = {};
    let maxCount = 0;
    let mostCommonValue = null;
    
    for (const value of arr) {
        if (!value) continue;
        counts[value] = (counts[value] || 0) + 1;
        
        if (counts[value] > maxCount) {
            maxCount = counts[value];
            mostCommonValue = value;
        }
    }
    
    return mostCommonValue;
};

module.exports = roadmapController;