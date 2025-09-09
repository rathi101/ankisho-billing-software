const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStaffRequests,
  getStaffRequest,
  approveStaffRequest,
  rejectStaffRequest,
  deleteStaffRequest,
  getStaffRequestStats
} = require('../controllers/staffRequestController');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/staff-requests
// @desc    Get all staff requests
// @access  Admin only
router.get('/', getStaffRequests);

// @route   GET /api/staff-requests/stats
// @desc    Get staff request statistics
// @access  Admin only
router.get('/stats', getStaffRequestStats);

// @route   GET /api/staff-requests/:id
// @desc    Get single staff request
// @access  Admin only
router.get('/:id', getStaffRequest);

// @route   PUT /api/staff-requests/:id/approve
// @desc    Approve staff request
// @access  Admin only
router.put('/:id/approve', approveStaffRequest);

// @route   PUT /api/staff-requests/:id/reject
// @desc    Reject staff request
// @access  Admin only
router.put('/:id/reject', rejectStaffRequest);

// @route   DELETE /api/staff-requests/:id
// @desc    Delete staff request
// @access  Admin only
router.delete('/:id', deleteStaffRequest);

module.exports = router;
