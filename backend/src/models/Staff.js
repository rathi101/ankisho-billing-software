const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Staff name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^[0-9]{10}$/.test(v);
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'cashier', 'staff'],
    default: 'staff',
    required: true
  },
  permissions: {
    products: { type: Boolean, default: false },
    customers: { type: Boolean, default: false },
    suppliers: { type: Boolean, default: false },
    sales: { type: Boolean, default: false },
    purchases: { type: Boolean, default: false },
    reports: { type: Boolean, default: false },
    settings: { type: Boolean, default: false }
  },
  salary: {
    type: Number,
    required: false,
    min: [0, 'Salary cannot be negative'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String,
    trim: true
  },
  // Authentication fields
  password: {
    type: String,
    minLength: [6, 'Password must be at least 6 characters']
  },
  lastLogin: {
    type: Date
  },
  // Additional fields
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['aadhar', 'pan', 'driving_license', 'passport', 'other']
    },
    number: String,
    url: String
  }],
  notes: {
    type: String,
    maxLength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name display
staffSchema.virtual('displayName').get(function() {
  return this.name;
});

// Virtual for years of service
staffSchema.virtual('yearsOfService').get(function() {
  if (!this.joinDate) return 0;
  const years = (Date.now() - new Date(this.joinDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.floor(years);
});

// Virtual for monthly salary formatted
staffSchema.virtual('formattedSalary').get(function() {
  const salary = this.salary || 0;
  return `₹${salary.toLocaleString()}`;
});

// Indexes for better performance
staffSchema.index({ email: 1 });
staffSchema.index({ phone: 1 });
staffSchema.index({ role: 1 });
staffSchema.index({ isActive: 1 });
staffSchema.index({ joinDate: -1 });

// Pre-save middleware to set role-based permissions
staffSchema.pre('save', function(next) {
  // Set default permissions based on role
  const rolePermissions = {
    admin: {
      products: true,
      customers: true,
      suppliers: true,
      sales: true,
      purchases: true,
      reports: true,
      settings: true,
    },
    manager: {
      products: true,
      customers: true,
      suppliers: true,
      sales: true,
      purchases: true,
      reports: true,
      settings: false,
    },
    cashier: {
      products: false,
      customers: true,
      suppliers: false,
      sales: true,
      purchases: false,
      reports: false,
      settings: false,
    },
    staff: {
      products: false,
      customers: true,
      suppliers: false,
      sales: true,
      purchases: false,
      reports: false,
      settings: false,
    }
  };

  // Only set default permissions if not explicitly set
  if (this.isNew || this.isModified('role')) {
    this.permissions = { ...this.permissions, ...rolePermissions[this.role] };
  }

  next();
});

// Static method to get staff by role
staffSchema.statics.getByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to get active staff count
staffSchema.statics.getActiveCount = function() {
  return this.countDocuments({ isActive: true });
};

// Instance method to check permission
staffSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Instance method to toggle active status
staffSchema.methods.toggleStatus = function() {
  this.isActive = !this.isActive;
  return this.save();
};

module.exports = mongoose.model('Staff', staffSchema);
