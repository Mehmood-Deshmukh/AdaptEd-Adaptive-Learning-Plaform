const mongoose = require('mongoose');
const roadmapSchema = require('../models/roadmapModel');
const checkpointSchema = require('../models/checkpointModel');
const resourceSchema = require('../models/resourceModel');
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
                res.status(404).json({ message: "User not found" });
            }

            console.log(user.clusterId);

            const clusterSummaryResponse = await axios.get(`${process.env.FLASK_BASE_URL}/clusters/cluster-summary?id=${user.clusterId}`);
            const clusterSummary = clusterSummaryResponse.data.summary;

            const _res = await axios.post(`${process.env.FLASK_BASE_URL}/api/generate-roadmap`, { topic, summary: clusterSummary });
            const roadmap = _res.data;
            console.log(roadmap);
            
            const checkpoints = await Promise.all(roadmap.checkpoints.map(async (checkpoint, index) => {
                checkpoint.order = index + 1;
                const newCheckpoint = await checkpointSchema.createCheckpoint(checkpoint);
                return newCheckpoint._id;
            }));

            const newRoadmap = new roadmapSchema({
                userId: new mongoose.Types.ObjectId(req.userId),
                mainTopic: roadmap.mainTopic,
                description: roadmap.description,
                checkpoints: checkpoints
            });
            
            const savedRoadmap = await newRoadmap.save();
            await userModel.addRoadmap(req.userId, savedRoadmap._id);
            savedRoadmap.checkpoints = await checkpointSchema.getCheckpoints(savedRoadmap.checkpoints);
            res.status(201).json(savedRoadmap);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },
    getRoadmaps: async (req, res) => {
        try {
            const roadmaps = await userModel.getUsersRoadmaps(req.userId);
            res.status(200).json(roadmaps);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },
    updateCheckpointStatus : async (req, res) => {
        try {
            const { roadmapId, checkpointId, status } = req.body;
            const roadmap = await roadmapSchema.findById(roadmapId).populate({
                path: "checkpoints",
                populate: {
                    path: "resources",
                    model: "Resource",
                },
            })
            if(!roadmap){
                res.status(404).json({ message: "Roadmap not found" });
            }

            const checkpoint = await checkpointSchema.findById(checkpointId);
            if(!checkpoint){
                res.status(404).json({ message: "Checkpoint not found" });
            }

            if (checkpoint.status === 'in_progress' && status === 'not_started') {
                return res.status(400).json({ 
                  message: "Cannot change status from 'In Progress' back to 'Not Started'" 
                });
              }
              
            if (checkpoint.status === 'completed' && (status === 'in_progress' || status === 'not_started')) {
                return res.status(400).json({ 
                  message: "Cannot change status from 'Completed' to a previous status" 
                });
            }

            const isNewCompletion = status === 'completed' && checkpoint.status !== 'completed';

            if(status === 'completed'){
                checkpoint.startedAt = checkpoint.startedAt != null ? checkpoint.startedAt : new Date();
                checkpoint.completedAt = new Date();
                checkpoint.totalTimeTaken = (checkpoint.completedAt - checkpoint.startedAt);
            }

            if(status === 'in_progress'){
                checkpoint.startedAt = new Date();
            }

            checkpoint.status = status;
            await checkpoint.save();

            roadmap.checkpoints = [...roadmap.checkpoints.filter(checkpoint => checkpoint._id.toString() !== checkpointId), checkpoint];

            const totalCheckpoints = roadmap.checkpoints.length;
            const completedCheckpoints = roadmap.checkpoints.filter(checkpoint => checkpoint.status === 'completed').length;
            roadmap.totalProgress = Math.floor((completedCheckpoints / totalCheckpoints) * 100);

            if (isNewCompletion) {
                xpEmitter.emit('checkpoint-completed', {
                    userId: roadmap.userId,
                    checkpointId
                });
            }

            const isRoadmapCompleted = roadmap.totalProgress === 100 && roadmap.completedAt === null;

            if(isRoadmapCompleted){
                roadmap.completedAt = new Date();
                const currentUser = await userModel.findById(roadmap.userId);
                currentUser.completedRoadmaps.push(roadmapId);
                await currentUser.save();

                achievementEmitter.emit('roadmap-completed', { 
                    userId: roadmap.userId 
                });

                xpEmitter.emit('roadmap-completed', {
                    userId: roadmap.userId,
                    roadmapId
                });
            }


            await roadmap.save();
            res.status(200).json(roadmap);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },
}

module.exports = roadmapController;