const mongoose = require('mongoose');
const roadmapSchema = require('../models/roadmapModel');
const checkpointSchema = require('../models/checkpointModel');
const resourceSchema = require('../models/resourceModel');
const generateRoadmap = require('../utils/roadmapGeneration');
const userModel = require('../models/userModel');

const roadmapController = {
    generateRoadmap: async (req, res) => {
        try {
            const topic = req.body.topic;
            const user = await userModel.findById(req.userId);
            if(!user){
                res.status(404).json({ message: "User not found" });
            }

            const roadmap = await generateRoadmap(topic);
            
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
    }
}

module.exports = roadmapController;