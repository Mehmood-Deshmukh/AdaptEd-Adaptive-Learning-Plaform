const Request = require("../models/requestModel");
const { achievementEmitter } = require('../services/achievementService');
const { xpEmitter } = require('../services/xpService');

const requestController = {
  createRequest: async (req, res) => {
    try {
      const { type, payload } = req.body;

      // Validate request type
      if (!["Resource", "Quiz"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid request type. Must be Resource or Quiz.",
        });
      }

      // Create new request
      const request = await Request.createRequest({
        type,
        payload,
        requestedBy: req.userId, // Assuming user is authenticated
      });

      xpEmitter.emit('contribution-submitted', { userId: req.userId });

      res.status(201).json({
        success: true,
        data: request,
        message: "Contribution request submitted successfully!",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating request",
        error: error.message,
      });
    }
  },
  getUserRequests: async (req, res) => {
    try {
      const requests = await Request.fetchUserRequests(req.userId);

      res.status(200).json({
        success: true,
        count: requests.length,
        data: requests,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching user requests",
        error: error.message,
      });
    }
  },
  getAllRequests: async (req, res) => {
    try {
      const requests = await Request.fetchAllRequests();

      res.status(200).json({
        success: true,
        count: requests.length,
        data: requests,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching all requests",
        error: error.message,
      });
    }
  },
  approveRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      const userId = req.userId;
      const updatedRequest = await Request.approveRequest(requestId);

      achievementEmitter.emit('contribution-made', { userId : updatedRequest.requestedBy });

      xpEmitter.emit('contribution-approved', {
        userId: updatedRequest.requestedBy,
        requestId
      });

      res.status(200).json({
        success: true,
        data: updatedRequest,
        message: "Request approved successfully!",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error approving request",
        error: error.message,
      });
    }
  },
  rejectRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      const { feedback } = req.body;

      if (!feedback) {
        return res.status(400).json({
          success: false,
          message: "Feedback is required when rejecting a request",
        });
      }

      const updatedRequest = await Request.rejectRequest(requestId, feedback);

      res.status(200).json({
        success: true,
        data: updatedRequest,
        message: "Request rejected successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error rejecting request",
        error: error.message,
      });
    }
  },
};

module.exports = requestController;