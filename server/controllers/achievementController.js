const { UserAchievement } = require('../models/achievementModel');
const { 
    getUserAchievements, 
    checkQuizAchievements,
    checkRoadmapAchievements,
    checkContributionAchievements,
    checkStreakAchievements,
    checkCommunityAchievements
  } = require('../services/achievementService');

  
const achievementController = {
    getUserAchievements: async (req, res) => {
      try {
        const userId = req.userId;
        const achievements = await getUserAchievements(userId);
        
        res.status(200).json({
          success: true,
          message: 'User achievements retrieved successfully',
          data: achievements
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          message: error.message,
          data: null
        });
      }
    },
    
    markAchievementAsNotified: async (req, res) => {
      try {
        const { achievementId } = req.params;
        const userId = req.userId;
        
        const userAchievement = await UserAchievement.findOneAndUpdate(
          { userId, achievementId },
          { isNotified: true },
          { new: true }
        );
        
        if (!userAchievement) {
          return res.status(404).json({
            success: false,
            message: 'Achievement not found for this user',
            data: null
          });
        }
        
        res.status(200).json({
          success: true,
          message: 'Achievement marked as notified',
          data: userAchievement
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          message: error.message,
          data: null
        });
      }
    },
    
    checkAllAchievements: async (req, res) => {
      try {
        const userId = req.userId;
        
        await Promise.all([
          checkQuizAchievements(userId),
          checkRoadmapAchievements(userId),
          checkContributionAchievements(userId),
          checkStreakAchievements(userId),
          checkCommunityAchievements(userId)
        ]);
        
        const achievements = await getUserAchievements(userId);
        
        res.status(200).json({
          success: true,
          message: 'Achievements checked successfully',
          data: achievements
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          message: error.message,
          data: null
        });
      }
    }
  };
  
  module.exports = achievementController;