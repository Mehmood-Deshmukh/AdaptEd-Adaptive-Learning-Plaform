const { getXpHistory } = require('../services/xpService');

const xpController = {
  getXpHistory: async (req, res) => {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit) || 20;
      
      const xpHistory = await getXpHistory(userId, limit);
      
      res.status(200).json({
        success: true,
        message: 'XP history retrieved successfully',
        data: xpHistory
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

module.exports = xpController;