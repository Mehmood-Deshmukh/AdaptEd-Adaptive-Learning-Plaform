const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authenticateUser = require('../middlewares/auth');
const verifyRole = require('../middlewares/verifyRole');

// Admin routes
router.get('/requests', authenticateUser, verifyRole('admin'), requestController.getAllRequests);
router.put('/requests/:requestId/approve', authenticateUser, verifyRole('admin'), requestController.approveRequest);
router.put('/requests/:requestId/reject', authenticateUser, verifyRole('admin'), requestController.rejectRequest);

module.exports = router;