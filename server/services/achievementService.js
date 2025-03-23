const EventEmitter = require('events');
const { Achievement, UserAchievement } = require('../models/achievementModel');
const User = require('../models/userModel');
const sendMail = require('../utils/sendMail');

class AchievementEmitter extends EventEmitter {}

const achievementEmitter = new AchievementEmitter();

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const getCurrentFormattedDate = () => {
  return formatDate(new Date());
};

const initializeAchievements = async () => {
  const achievementsData = [
    {
      id: 1,
      name: "First Quiz Completed",
      description: "Awarded upon completing the first quiz.",
      xp: 50,
      icon: "Trophy"
    },
    {
      id: 2,
      name: "Quiz Enthusiast",
      description: "Complete 10 quizzes.",
      xp: 200,
      icon: "Award"
    },
    {
      id: 3,
      name: "Quiz Master",
      description: "Achieve a score of 90% or higher on any quiz.",
      xp: 150,
      icon: "Star"
    },
    {
      id: 4,
      name: "Roadmap Explorer",
      description: "Complete your first learning roadmap.",
      xp: 100,
      icon: "Rocket"
    },
    {
      id: 5,
      name: "Dedicated Learner",
      description: "Complete 5 learning roadmaps.",
      xp: 300,
      icon:"GraduationCap"
    },
    {
      id: 6,
      name: "First Contribution",
      description: "Submit your first quiz question or resource.",
      xp: 75,
      icon:"FileEdit"
    },
    {
      id: 7,
      name: "Contributor",
      description: "Submit 10 quiz questions or resources.",
      xp: 250,
      icon :"Users"
    },
    {
      id: 8,
      name: "Community Pillar",
      description: "Submit 50 quiz questions or resources.",
      xp: 500,
      icon:"Crown"
    },
    {
      id: 9,
      name: "Streak Starter",
      description: "Log in for 3 consecutive days.",
      xp: 50,
      icon: "Flame"
    },
    {
      id: 10,
      name: "Committed Learner",
      description: "Log in for 7 consecutive days.",
      xp: 150,
      icon: "Calendar"
    },
    {
      id: 11,
      name: "Streak Champion",
      description: "Log in for 30 consecutive days.",
      xp: 500,
      icon: "Medal"
    },
    {
      id: 12,
      name: "Social Learner",
      description: "Join 5 communities.",
      xp: 100,
      icon: "UserPlus"
    }
  ];

  for (const achievement of achievementsData) {
    await Achievement.findOneAndUpdate(
      { id: achievement.id },
      achievement,
      { upsert: true, new: true }
    );
  }
  
  console.log('Achievements initialized successfully');
};

const sendAchievementEmail = async (achievement, updatedUser) => {
  try {
   
    const userAchievementsCount = await UserAchievement.countDocuments({ userId: updatedUser._id });
    
    const iconSvgPaths = {
      Trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
      
      Award: '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
      
      Star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
      
      Rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
      
      GraduationCap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
      
      FileEdit: '<path d="M12.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v9.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>',
      
      Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      
      Crown: '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
      
      Flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
      
      Calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
      
      Medal: '<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/>',
      
      UserPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>'
    };



    await sendMail(
      updatedUser.email,
      `🏆 Achievement Unlocked: ${achievement.name}`,
      'achievementUnlocked',
      {
        userName: updatedUser.name,
        achievementName: achievement.name,
        achievementDescription: achievement.description,
        xpEarned: achievement.xp,
        iconPath: iconSvgPaths[achievement.icon] || iconSvgPaths.Trophy,
        totalAchievements: userAchievementsCount,
        currentXP: updatedUser.xps,
        platformUrl: `${process.env.FRONTEND_URL}/profile`,
        currentDate: getCurrentFormattedDate()
      }
    );
    
    console.log(`Achievement email sent to ${updatedUser.email}`);
  } catch (error) {
    console.error('Error sending achievement email:', error);
  }
};

const awardAchievement = async (userId, achievementId) => {
  try {
    const existingAchievement = await UserAchievement.findOne({
      userId,
      achievementId
    });

    if (existingAchievement) {
      return null;
    }

    const achievement = await Achievement.findOne({ id: achievementId });
    
    if (!achievement) {
      throw new Error(`Achievement with ID ${achievementId} not found`);
    }


    const userAchievement = await UserAchievement.create({
      userId,
      achievementId,
      unlockedAt: new Date()
    });

    await User.updateXP(userId, achievement.xp);

    console.log(`Achievement ${achievement.name} awarded to user ${userId}`);
    
    achievementEmitter.emit('achievement-unlocked', { 
      userId, 
      achievement,
      userAchievement
    });

    const updatedUser = await User.findById(userId);

    await sendAchievementEmail(achievement, updatedUser);

    return { achievement, userAchievement };
  } catch (error) {
    console.error('Error awarding achievement:', error);
    throw error;
  }
};

const checkQuizAchievements = async (userId, score) => {
  try {
    const user = await User.findById(userId).populate('quizzes');
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Achievement 1: First Quiz Completed
    if (user.quizzes.length > 0) {
      await awardAchievement(userId, 1);
    }

    // Achievement 2: Quiz Enthusiast (10 quizzes)
    if (user.quizzes.length >= 10) {
      await awardAchievement(userId, 2);
    }

    // Achievement 3: Quiz Master (90% score)
    if (score >= 90) {
      await awardAchievement(userId, 3);
    }
  } catch (error) {
    console.error('Error checking quiz achievements:', error);
  }
};

const checkRoadmapAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Achievement 4: Roadmap Explorer (first roadmap)
    if (user.completedRoadmaps.length > 0) {
      await awardAchievement(userId, 4);
    }

    // Achievement 5: Dedicated Learner (5 roadmaps)
    if (user.completedRoadmaps.length >= 5) {
      await awardAchievement(userId, 5);
    }
  } catch (error) {
    console.error('Error checking roadmap achievements:', error);
  }
};


const checkContributionAchievements = async (userId) => {
  try {
    const user = await User.findById(userId).populate('contributions');
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Achievement 6: First Contribution
    if (user.contributions.length == 1) {
      await awardAchievement(userId, 6);
    }

    // Achievement 7: Contributor (10 contributions)
    if (user.contributions.length >= 10) {
      await awardAchievement(userId, 7);
    }

    // Achievement 8: Community Pillar (50 contributions)
    if (user.contributions.length >= 50) {
      await awardAchievement(userId, 8);
    }
  } catch (error) {
    console.error('Error checking contribution achievements:', error);
  }
};


const checkStreakAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Achievement 9: Streak Starter (3 days)
    if (user.currentStreak >= 3) {
      await awardAchievement(userId, 9);
    }

    // Achievement 10: Committed Learner (7 days)
    if (user.currentStreak >= 7) {
      await awardAchievement(userId, 10);
    }

    // Achievement 11: Streak Champion (30 days)
    if (user.currentStreak >= 30) {
      await awardAchievement(userId, 11);
    }
  } catch (error) {
    console.error('Error checking streak achievements:', error);
  }
};


const checkCommunityAchievements = async (userId) => {
  try {
    const user = await User.findById(userId).populate('communities');
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Achievement 12: Social Learner (5 communities)
    if (user.communities.length >= 5) {
      await awardAchievement(userId, 12);
    }
  } catch (error) {
    console.error('Error checking community achievements:', error);
  }
};


const getUserAchievements = async (userId) => {
  try {
    const checkAllAchievements = await Achievement.find();
    const userAchievements = await UserAchievement.find({ userId });

    const achievements = checkAllAchievements.map(achievement => {
      const userAchievement = userAchievements.find(
        a => a.achievementId == achievement.id
      );

      return {
        ...achievement._doc,
        isUnlocked: userAchievement ? true : false
      };
    });

    return achievements;


  } catch (error) {
    console.error('Error getting user achievements:', error);
    throw error;
  }
};


const setupEventListeners = () => {

  achievementEmitter.on('quiz-completed', async ({ userId, score }) => {
    await checkQuizAchievements(userId, score);
  });


  achievementEmitter.on('roadmap-completed', async ({ userId }) => {
    await checkRoadmapAchievements(userId);
  });


  achievementEmitter.on('contribution-made', async ({ userId }) => {
    await checkContributionAchievements(userId);
  });


  achievementEmitter.on('streak-updated', async ({ userId }) => {
    await checkStreakAchievements(userId);
  });


  achievementEmitter.on('community-joined', async ({ userId }) => {
    await checkCommunityAchievements(userId);
  });

  console.log('Achievement event listeners set up successfully');
};

module.exports = {
  achievementEmitter,
  initializeAchievements,
  awardAchievement,
  getUserAchievements,
  checkQuizAchievements,
  checkRoadmapAchievements,
  checkContributionAchievements,
  checkStreakAchievements,
  checkCommunityAchievements,
  setupEventListeners
};