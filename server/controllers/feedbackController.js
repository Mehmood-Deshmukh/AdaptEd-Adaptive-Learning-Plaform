const mongoose = require('mongoose');
const feedbackSchema = require('../models/feedbackModel');
const checkpointSchema = require('../models/checkpointModel');
const roadmapSchema = require('../models/roadmapModel');
const userModel = require('../models/userModel');

const feedbackController = {
    getAllFeedbackSummary: async (req, res) => {
        try {
            const allFeedback = await feedbackSchema.find({})
                .populate({
                    path: 'checkpointId',
                    select: 'title order'
                })
                .populate({
                    path: 'roadmapId',
                    select: 'mainTopic'
                })
                .populate({
                    path: 'userId',
                    select: 'name email'
                });
                
            if (allFeedback.length === 0) {
                return res.status(404).json({ message: "No feedback found in the system" });
            }
            
            let summaryText = `GLOBAL FEEDBACK SUMMARY\n`;
            summaryText += `Generated on: ${new Date().toISOString().split('T')[0]} ${new Date().toISOString().split('T')[1].substring(0, 8)}\n`;
            summaryText += `Total Feedback Count: ${allFeedback.length}\n\n`;
            
            const roadmapFeedback = {};
            let totalRatingSum = 0;
            
            allFeedback.forEach(feedback => {
                if (!feedback.roadmapId || !feedback.checkpointId) return;
                
                const roadmapId = feedback.roadmapId._id.toString();
                const roadmapTopic = feedback.roadmapId.mainTopic;
                
                if (!roadmapFeedback[roadmapId]) {
                    roadmapFeedback[roadmapId] = {
                        topic: roadmapTopic,
                        checkpoints: {},
                        feedbackCount: 0,
                        totalRating: 0
                    };
                }
                
                const checkpointId = feedback.checkpointId._id.toString();
                const checkpointTitle = feedback.checkpointId.title;
                const checkpointOrder = feedback.checkpointId.order;
                
                if (!roadmapFeedback[roadmapId].checkpoints[checkpointId]) {
                    roadmapFeedback[roadmapId].checkpoints[checkpointId] = {
                        title: checkpointTitle,
                        order: checkpointOrder,
                        ratings: [],
                        feedbackCount: 0,
                        totalRating: 0
                    };
                }
                
                roadmapFeedback[roadmapId].checkpoints[checkpointId].ratings.push(feedback.rating);
                roadmapFeedback[roadmapId].checkpoints[checkpointId].feedbackCount++;
                roadmapFeedback[roadmapId].checkpoints[checkpointId].totalRating += feedback.rating;
                
                roadmapFeedback[roadmapId].feedbackCount++;
                roadmapFeedback[roadmapId].totalRating += feedback.rating;
                
                totalRatingSum += feedback.rating;
            });
            
            const overallAverageRating = (totalRatingSum / allFeedback.length).toFixed(2);
            
            const sortedRoadmaps = Object.keys(roadmapFeedback)
                .sort((a, b) => roadmapFeedback[b].feedbackCount - roadmapFeedback[a].feedbackCount);
            
            sortedRoadmaps.forEach(roadmapId => {
                const roadmap = roadmapFeedback[roadmapId];
                
                summaryText += `\n===============\n`;
                summaryText += `ROADMAP: ${roadmap.topic}\n`;
                summaryText += `Total Feedback: ${roadmap.feedbackCount}\n`;
                
                const avgRating = (roadmap.totalRating / roadmap.feedbackCount).toFixed(2);
                summaryText += `Average Rating: ${avgRating}/5 ${'★'.repeat(Math.round(avgRating))}${'☆'.repeat(5 - Math.round(avgRating))}\n\n`;
                
                const checkpoints = Object.values(roadmap.checkpoints)
                    .sort((a, b) => a.order - b.order);
                
                checkpoints.forEach(checkpoint => {
                    const checkpointAvg = (checkpoint.totalRating / checkpoint.feedbackCount).toFixed(2);
                    
                    let assessment = '';
                    if (checkpointAvg >= 4.5) assessment = 'Excellent';
                    else if (checkpointAvg >= 3.5) assessment = 'Very Good';
                    else if (checkpointAvg >= 2.5) assessment = 'Good';
                    else if (checkpointAvg >= 1.5) assessment = 'Fair';
                    else assessment = 'Poor';
                    
                    summaryText += `CHECKPOINT ${checkpoint.order}: ${checkpoint.title}\n`;
                    summaryText += `   Feedback Count: ${checkpoint.feedbackCount}\n`;
                    summaryText += `   Average Rating: ${checkpointAvg}/5 ${'★'.repeat(Math.round(checkpointAvg))}${'☆'.repeat(5 - Math.round(checkpointAvg))}\n`;
                    summaryText += `   Assessment: ${assessment}\n\n`;
                });
            });

            summaryText += `\n===============\n`;
            summaryText += `GLOBAL STATISTICS\n`;
            summaryText += `Total Roadmaps with Feedback: ${sortedRoadmaps.length}\n`;
            summaryText += `Total Feedback Submissions: ${allFeedback.length}\n`;
            summaryText += `Overall Average Rating: ${overallAverageRating}/5\n`;
            
            let overallAssessment = '';
            if (overallAverageRating >= 4.5) overallAssessment = 'Excellent';
            else if (overallAverageRating >= 3.5) overallAssessment = 'Very Good';
            else if (overallAverageRating >= 2.5) overallAssessment = 'Good';
            else if (overallAverageRating >= 1.5) overallAssessment = 'Fair';
            else overallAssessment = 'Poor';
            
            summaryText += `Overall Assessment: ${overallAssessment}\n`;
            
            summaryText += `\nRating Distribution:\n`;
            
            const ratingDistribution = [0, 0, 0, 0, 0]; 
            allFeedback.forEach(feedback => {
                if (feedback.rating >= 1 && feedback.rating <= 5) {
                    ratingDistribution[feedback.rating - 1]++;
                }
            });
            
            for (let i = 0; i < 5; i++) {
                const rating = i + 1;
                const count = ratingDistribution[i];
                const percentage = ((count / allFeedback.length) * 100).toFixed(1);
                summaryText += `${rating} Star: ${count} (${percentage}%)\n`;
            }
            
            res.set('Content-Type', 'text/plain');
            res.send(summaryText);
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = feedbackController;