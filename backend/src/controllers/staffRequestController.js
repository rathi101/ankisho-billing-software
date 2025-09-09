const { validationResult } = require('express-validator');
const StaffRequest = require('../models/StaffRequest');
const Staff = require('../models/Staff');
const { sendStaffApprovalEmail, sendStaffRejectionEmail } = require('../utils/emailService');

// Get all staff requests (Admin only)
exports.getStaffRequests = async (req, res) => {
  try {
    const requests = await StaffRequest.find()
      .sort({ requestDate: -1 })
      .populate('approvedBy', 'name email');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get staff requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff requests',
      error: error.message
    });
  }
};

// Get single staff request (Admin only)
exports.getStaffRequest = async (req, res) => {
  try {
    const request = await StaffRequest.findById(req.params.id)
      .populate('approvedBy', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Staff request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get staff request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff request',
      error: error.message
    });
  }
};

// Approve staff request (Admin only)
exports.approveStaffRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const adminId = req.user.id;

    // Find the staff request
    const staffRequest = await StaffRequest.findById(requestId);
    if (!staffRequest) {
      return res.status(404).json({
        success: false,
        message: 'Staff request not found'
      });
    }

    if (staffRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been processed'
      });
    }

    // Check if email already exists in Staff collection
    const existingStaff = await Staff.findOne({ email: staffRequest.email });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create staff member
    const newStaff = await Staff.create({
      name: staffRequest.name,
      email: staffRequest.email,
      password: staffRequest.password,
      phone: staffRequest.phone,
      role: 'staff',
      isActive: true,
      salary: 0
    });

    // Update request status
    staffRequest.status = 'approved';
    staffRequest.approvedBy = adminId;
    staffRequest.approvedDate = new Date();
    await staffRequest.save();

    // Send approval email
    await sendStaffApprovalEmail({
      name: staffRequest.name,
      email: staffRequest.email
    });

    res.status(200).json({
      success: true,
      message: 'Staff request approved successfully. Approval email sent to the user.',
      data: {
        request: staffRequest,
        staff: newStaff
      }
    });
  } catch (error) {
    console.error('Approve staff request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving staff request',
      error: error.message
    });
  }
};

// Reject staff request (Admin only)
exports.rejectStaffRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const adminId = req.user.id;
    const { rejectionReason } = req.body;

    // Find the staff request
    const staffRequest = await StaffRequest.findById(requestId);
    if (!staffRequest) {
      return res.status(404).json({
        success: false,
        message: 'Staff request not found'
      });
    }

    if (staffRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been processed'
      });
    }

    // Update request status
    staffRequest.status = 'rejected';
    staffRequest.approvedBy = adminId;
    staffRequest.approvedDate = new Date();
    staffRequest.rejectionReason = rejectionReason || 'No reason provided';
    await staffRequest.save();

    // Send rejection email
    await sendStaffRejectionEmail({
      name: staffRequest.name,
      email: staffRequest.email
    }, rejectionReason);

    res.status(200).json({
      success: true,
      message: 'Staff request rejected successfully. Notification email sent to the user.',
      data: staffRequest
    });
  } catch (error) {
    console.error('Reject staff request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting staff request',
      error: error.message
    });
  }
};

// Delete staff request (Admin only)
exports.deleteStaffRequest = async (req, res) => {
  try {
    const request = await StaffRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Staff request not found'
      });
    }

    await StaffRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Staff request deleted successfully'
    });
  } catch (error) {
    console.error('Delete staff request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting staff request',
      error: error.message
    });
  }
};

// Get staff request statistics (Admin only)
exports.getStaffRequestStats = async (req, res) => {
  try {
    const stats = await StaffRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRequests = await StaffRequest.countDocuments();
    const pendingRequests = await StaffRequest.countDocuments({ status: 'pending' });
    const approvedRequests = await StaffRequest.countDocuments({ status: 'approved' });
    const rejectedRequests = await StaffRequest.countDocuments({ status: 'rejected' });

    res.status(200).json({
      success: true,
      data: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        breakdown: stats
      }
    });
  } catch (error) {
    console.error('Get staff request stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff request statistics',
      error: error.message
    });
  }
};
