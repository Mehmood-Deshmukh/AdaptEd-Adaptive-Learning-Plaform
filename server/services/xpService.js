const User = require('../models/userModel');
const EventEmitter = require('events');
const XpHistory = require('../models/xpHistoryModel');

class XpEmitter extends EventEmitter {}

const xpEmitter = new XpEmitter();

const XP_VALUES = {
  // Quiz related
  QUIZ_COMPLETION: 10,           // Base XP for completing any quiz
  QUIZ_PERFECT_SCORE: 25,        // Additional XP for a perfect score
  QUIZ_HIGH_SCORE: 15,           // Additional XP for score >= 80%
  
  // Roadmap related
  CHECKPOINT_COMPLETION: 15,     // XP for completing a checkpoint
  ROADMAP_COMPLETION: 50,        // XP for completing a full roadmap
  
  // Login related
  DAILY_LOGIN: 5,                // XP for logging in daily
  CONSECUTIVE_LOGIN_BONUS: 3,    // Additional XP per consecutive day (multiplied by streak)
  
  // Contribution related
  CONTRIBUTION_SUBMISSION: 20,   // XP for submitting a contribution
  CONTRIBUTION_APPROVED: 30,     // Additional XP when a contribution is approved
  
  // Community related
  COMMUNITY_JOIN: 10,            // XP for joining a community
};


const awardXP = async (userId, amount, reason) => {
  try {
    if (!userId || !amount) {
      console.error('Invalid parameters for awarding XP');
      return;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    
    await User.updateXP(userId, amount);

    const xpHistory = new XpHistory({
        userId,
        amount,
        reason,
        timestamp: new Date()
      });
      await xpHistory.save();
    
    console.log(`Awarded ${amount} XP to user ${userId} for ${reason}`);
    
    
    xpEmitter.emit('xp-awarded', {
      userId,
      amount,
      reason,
      newTotal: user.xps + amount, 
      level: user.level
    });
    
    return { amount, newTotal: user.xps + amount, level: user.level };
  } catch (error) {
    console.error('Error awarding XP:', error);
    throw error;
  }
};

const setupXpEventListeners = () => {

  xpEmitter.on('quiz-completed', async ({ userId, score, totalQuestions }) => {
    let xpToAward = XP_VALUES.QUIZ_COMPLETION;
    
   
    if (score === totalQuestions) {
      xpToAward += XP_VALUES.QUIZ_PERFECT_SCORE;
      await awardXP(userId, xpToAward, 'Perfect quiz score');
    } else if ((score / totalQuestions) >= 0.8) {
      xpToAward += XP_VALUES.QUIZ_HIGH_SCORE;
      await awardXP(userId, xpToAward, 'High quiz score');
    } else {
      await awardXP(userId, xpToAward, 'Quiz completion');
    }
  });
  
 
  xpEmitter.on('checkpoint-completed', async ({ userId, checkpointId }) => {
    await awardXP(userId, XP_VALUES.CHECKPOINT_COMPLETION, 'Checkpoint completion');
  });
  

  xpEmitter.on('roadmap-completed', async ({ userId, roadmapId }) => {
    await awardXP(userId, XP_VALUES.ROADMAP_COMPLETION, 'Roadmap completion');
  });
  

  xpEmitter.on('daily-login', async ({ userId, streak }) => {
    const baseXP = XP_VALUES.DAILY_LOGIN;
    const streakBonus = Math.min(streak * XP_VALUES.CONSECUTIVE_LOGIN_BONUS, 30); 
    const totalXP = baseXP + streakBonus;
    
    await awardXP(userId, totalXP, `Daily login (day ${streak} streak)`);
  });
  

  xpEmitter.on('contribution-submitted', async ({ userId }) => {
    await awardXP(userId, XP_VALUES.CONTRIBUTION_SUBMISSION, 'Contribution submission');
  });
  
 
  xpEmitter.on('contribution-approved', async ({ userId, requestId }) => {
    await awardXP(userId, XP_VALUES.CONTRIBUTION_APPROVED, 'Contribution approved');
  });
  
 
  xpEmitter.on('community-joined', async ({ userId, communityId }) => {
    await awardXP(userId, XP_VALUES.COMMUNITY_JOIN, 'Community joined');
  });
  
  console.log('XP event listeners set up successfully');
};

const getXpHistory = async (userId, limit = 20) => {
    try {
      return await XpHistory.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Error getting XP history:', error);
      throw error;
    }
  };


module.exports = {
  xpEmitter,
  awardXP,
  XP_VALUES,
  setupXpEventListeners,
  getXpHistory
};