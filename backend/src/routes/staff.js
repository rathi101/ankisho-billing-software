const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateStaff = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number is required'),
  body('role').isIn(['admin', 'manager', 'cashier', 'staff']).withMessage('Invalid role'),
  body('salary').isNumeric({ gt: 0 }).withMessage('Salary must be greater than 0'),
];

// GET /api/staff - Get all staff members
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [staff, total] = await Promise.all([
      Staff.find(filter)
        .select('-password') // Exclude password field
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Staff.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: staff,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/staff/stats - Get staff statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalStaff,
      activeStaff,
      adminCount,
      managerCount,
      cashierCount,
      staffCount
    ] = await Promise.all([
      Staff.countDocuments(),
      Staff.countDocuments({ isActive: true }),
      Staff.countDocuments({ role: 'admin', isActive: true }),
      Staff.countDocuments({ role: 'manager', isActive: true }),
      Staff.countDocuments({ role: 'cashier', isActive: true }),
      Staff.countDocuments({ role: 'staff', isActive: true })
    ]);

    res.json({
      success: true,
      data: {
        totalStaff,
        activeStaff,
        inactiveStaff: totalStaff - activeStaff,
        roleBreakdown: {
          admin: adminCount,
          manager: managerCount,
          cashier: cashierCount,
          staff: staffCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/staff/:id - Get single staff member
router.get('/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select('-password');
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/staff - Create new staff member
router.post('/', validateStaff, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if email already exists
    const existingStaff = await Staff.findOne({ email: req.body.email });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const staff = new Staff(req.body);
    await staff.save();

    // Remove password from response
    const staffResponse = staff.toObject();
    delete staffResponse.password;

    res.status(201).json({
      success: true,
      data: staffResponse,
      message: 'Staff member created successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/staff/:id - Update staff member
router.put('/:id', validateStaff, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if email already exists for other staff members
    const existingStaff = await Staff.findOne({ 
      email: req.body.email, 
      _id: { $ne: req.params.id } 
    });
    
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      data: staff,
      message: 'Staff member updated successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH /api/staff/:id/status - Toggle staff status
router.patch('/:id/status', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    await staff.toggleStatus();

    res.json({
      success: true,
      data: { isActive: staff.isActive },
      message: `Staff member ${staff.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/staff/:id - Delete staff member (soft delete by setting inactive)
router.delete('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/staff/:id/permanent - Permanently delete staff member
router.delete('/:id/permanent', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member permanently deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
