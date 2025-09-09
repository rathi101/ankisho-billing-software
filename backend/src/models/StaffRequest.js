const mongoose = require('mongoose');

const staffRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Staff name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
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
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: false
  },
  approvedDate: {
    type: Date,
    required: false
  },
  rejectionReason: {
    type: String,
    required: false
  },
  additionalInfo: {
    type: String,
    maxLength: [500, 'Additional info cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted request date
staffRequestSchema.virtual('formattedRequestDate').get(function() {
  if (!this.requestDate) return '';
  return new Date(this.requestDate).toLocaleDateString('en-IN');
});

// Virtual for days pending
staffRequestSchema.virtual('daysPending').get(function() {
  if (this.status !== 'pending' || !this.requestDate) return 0;
  const today = new Date();
  const requestDate = new Date(this.requestDate);
  const diffTime = Math.abs(today.getTime() - requestDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('StaffRequest', staffRequestSchema);
