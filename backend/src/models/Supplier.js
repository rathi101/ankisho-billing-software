const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  companyName: {
    type: String,
    trim: true,
    maxLength: [100, 'Company name cannot exceed 100 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    sparse: true
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
  // Contact Person Information
  contactPerson: {
    name: {
      type: String,
      trim: true,
      maxLength: [100, 'Contact person name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    designation: {
      type: String,
      trim: true
    }
  },
  // Business Information
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
  },
  // Payment Terms
  paymentTerms: {
    type: String,
    enum: ['immediate', '15_days', '30_days', '45_days', '60_days', '90_days'],
    default: '30_days'
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: [0, 'Credit limit cannot be negative']
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  // Categories of products they supply
  categories: [{
    type: String,
    trim: true
  }],
  // Supplier Status
  isActive: {
    type: Boolean,
    default: true
  },
  // Rating and Notes
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  notes: {
    type: String,
    trim: true,
    maxLength: [1000, 'Notes cannot exceed 1000 characters']
  },
  tags: [String],
  // Purchase Statistics (computed fields)
  totalPurchases: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  lastOrderDate: {
    type: Date
  },
  // Bank Details (optional)
  bankDetails: {
    accountNumber: {
      type: String,
      trim: true
    },
    accountHolderName: {
      type: String,
      trim: true
    },
    bankName: {
      type: String,
      trim: true
    },
    ifscCode: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code']
    },
    branchName: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
supplierSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  if (!addr) return '';
  
  const parts = [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean);
  return parts.join(', ');
});

// Virtual for available credit
supplierSchema.virtual('availableCredit').get(function() {
  return Math.max(0, this.creditLimit + this.currentBalance);
});

// Virtual for balance status
supplierSchema.virtual('balanceStatus').get(function() {
  if (this.currentBalance > 0) return 'advance'; // We owe them money
  if (this.currentBalance < 0) return 'pending'; // They owe us money
  return 'clear';
});

// Virtual for display name (company name or contact name)
supplierSchema.virtual('displayName').get(function() {
  return this.companyName || this.name;
});

// Indexes for better performance
supplierSchema.index({ name: 'text', companyName: 'text' });
supplierSchema.index({ phone: 1 });
supplierSchema.index({ email: 1 });
supplierSchema.index({ isActive: 1 });
supplierSchema.index({ categories: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);
