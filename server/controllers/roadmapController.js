const mongoose = require('mongoose');
const roadmapSchema = require('../models/roadmapModel');
const checkpointSchema = require('../models/checkpointModel');
const resourceSchema = require('../models/resourceModel');
const generateRoadmap = require('../utils/roadmapGeneration');
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

            const _res = await axios.post(`${process.env.FLASK_BASE_URL}/api/generate-roadmap`, { topic });

            const roadmap = _res.data;
            
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
            const roadmap = await roadmapSchema.findById(roadmapId).populate('checkpoints');
            if(!roadmap){
                res.status(404).json({ message: "Roadmap not found" });
            }

            const checkpoint = await checkpointSchema.findById(checkpointId);
            if(!checkpoint){
                res.status(404).json({ message: "Checkpoint not found" });
            }

            if(status === 'completed'){
                checkpoint.completedAt = new Date();
            }

            checkpoint.status = status;
            await checkpoint.save();

            roadmap.checkpoints = [...roadmap.checkpoints.filter(checkpoint => checkpoint._id.toString() !== checkpointId), checkpoint];

            const totalCheckpoints = roadmap.checkpoints.length;
            const completedCheckpoints = roadmap.checkpoints.filter(checkpoint => checkpoint.status === 'completed').length;
            roadmap.totalProgress = Math.floor((completedCheckpoints / totalCheckpoints) * 100);


            await roadmap.save();
            res.status(200).json(roadmap);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },
}

module.exports = roadmapController;