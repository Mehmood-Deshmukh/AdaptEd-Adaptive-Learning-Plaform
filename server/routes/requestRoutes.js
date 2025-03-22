const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authenticateUser = require('../middlewares/auth');
const verifyRole = require('../middlewares/verifyRole');
// User routes
router.post('/contribute', authenticateUser, requestController.createRequest);
router.get('/my-contributions', authenticateUser, requestController.getUserRequests);

// Admin routes
router.get('/admin/requests', authenticateUser, verifyRole('admin'), requestController.getAllRequests);
router.put('/admin/requests/:requestId/approve', authenticateUser, verifyRole('admin'), requestController.approveRequest);
router.put('/admin/requests/:requestId/reject', authenticateUser, verifyRole('admin'), requestController.rejectRequest);

module.exports = router;