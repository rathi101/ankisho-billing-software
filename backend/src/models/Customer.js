const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    sparse: true // Allows multiple null values but unique non-null values
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
  },
  alternatePhone: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit alternate phone number']
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxLength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      trim: true,
      maxLength: [50, 'City name cannot exceed 50 characters']
    },
    state: {
      type: String,
      trim: true,
      maxLength: [50, 'State name cannot exceed 50 characters']
    },
    pincode: {
      type: String,
      trim: true,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode']
    },
    country: {
      type: String,
      trim: true,
      default: 'India'
    }
  },
  customerType: {
    type: String,
    enum: ['individual', 'business'],
    default: 'individual'
  },
  // Business Information (if customerType is 'business')
  businessInfo: {
    companyName: {
      type: String,
      trim: true,
      maxLength: [100, 'Company name cannot exceed 100 characters']
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number']
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
    }
  },
  // Credit Information
  creditLimit: {
    type: Number,
    default: 0,
    min: [0, 'Credit limit cannot be negative']
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  // Customer Status
  isActive: {
    type: Boolean,
    default: true
  },
  // Additional Information
  dateOfBirth: {
    type: Date
  },
  anniversary: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxLength: [1000, 'Notes cannot exceed 1000 characters']
  },
  tags: [String],
  // Sales Statistics (computed fields)
  totalSales: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  lastOrderDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
customerSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  if (!addr) return '';
  
  const parts = [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean);
  return parts.join(', ');
});

// Virtual for available credit
customerSchema.virtual('availableCredit').get(function() {
  return Math.max(0, this.creditLimit - this.currentBalance);
});

// Virtual for customer status based on balance
customerSchema.virtual('balanceStatus').get(function() {
  if (this.currentBalance > 0) return 'credit';
  if (this.currentBalance < 0) return 'debit';
  return 'clear';
});

// Indexes for better performance
customerSchema.index({ name: 'text', 'businessInfo.companyName': 'text' });
customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ isActive: 1 });
customerSchema.index({ customerType: 1 });

// Pre-save middleware to update business info based on customer type
customerSchema.pre('save', function(next) {
  if (this.customerType === 'individual') {
    this.businessInfo = undefined;
  }
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
