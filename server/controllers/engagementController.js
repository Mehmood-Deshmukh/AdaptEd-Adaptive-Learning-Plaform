const Engagement = require('../models/engagementModel');

const recordEngagement = async (req, res) => {
    const { userId, action, postId, roadmapId, quizId, checkpointId, resourceId, tags, timeSpent, xpEarned, feedback } = req.body;

    try {
        const engagement = new Engagement({
            userId,
            action,
            postId,
            roadmapId,
            quizId,
            checkpointId,
            resourceId,
            tags,
            timeSpent,
            xpEarned,
            feedback
        });

        await engagement.save();
        res.status(201).json({ message: 'Engagement recorded successfully', engagement });
    } catch (error) {
        res.status(500).json({ message: 'Error recording engagement', error });
    }
}

module.exports = {
    recordEngagement
};