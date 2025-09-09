const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.01, 'Quantity must be greater than 0']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'amount'],
    default: 'percentage'
  },
  gstRate: {
    type: Number,
    default: 18,
    min: [0, 'GST rate cannot be negative']
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for item subtotal before discount
saleItemSchema.virtual('subtotal').get(function() {
  return this.quantity * this.unitPrice;
});

// Virtual for discount amount
saleItemSchema.virtual('discountAmount').get(function() {
  if (this.discountType === 'percentage') {
    return (this.subtotal * this.discount) / 100;
  }
  return this.discount;
});

// Virtual for amount after discount
saleItemSchema.virtual('discountedAmount').get(function() {
  return this.subtotal - this.discountAmount;
});

// Virtual for GST amount
saleItemSchema.virtual('gstAmount').get(function() {
  return (this.discountedAmount * this.gstRate) / 100;
});

// Virtual for total amount including GST
saleItemSchema.virtual('totalAmount').get(function() {
  return this.discountedAmount + this.gstAmount;
});

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  customerAddress: {
    type: String,
    trim: true
  },
  items: [saleItemSchema],
  // Pricing Information
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  totalDiscount: {
    type: Number,
    default: 0,
    min: [0, 'Total discount cannot be negative']
  },
  totalGst: {
    type: Number,
    default: 0,
    min: [0, 'Total GST cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  roundOffAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: [true, 'Final amount is required']
  },
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'credit'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'pending', 'overdue'],
    default: 'paid'
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  balanceAmount: {
    type: Number,
    default: 0
  },
  // Transaction Details
  transactionId: {
    type: String,
    trim: true
  },
  chequeNumber: {
    type: String,
    trim: true
  },
  chequeDate: {
    type: Date
  },
  // Sale Status
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'confirmed'
  },
  // Dates
  saleDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Sale date is required']
  },
  dueDate: {
    type: Date
  },
  deliveryDate: {
    type: Date
  },
  // Additional Information
  notes: {
    type: String,
    trim: true,
    maxLength: [500, 'Notes cannot exceed 500 characters']
  },
  termsAndConditions: {
    type: String,
    trim: true
  },
  // Shipping Information
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  shippingCharges: {
    type: Number,
    default: 0,
    min: [0, 'Shipping charges cannot be negative']
  },
  // Sales Person
  salesPerson: {
    type: String,
    trim: true
  },
  // Return Information
  isReturned: {
    type: Boolean,
    default: false
  },
  returnDate: {
    type: Date
  },
  returnAmount: {
    type: Number,
    default: 0
  },
  returnReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for pending amount
saleSchema.virtual('pendingAmount').get(function() {
  return Math.max(0, this.finalAmount - this.paidAmount);
});

// Virtual for payment completion percentage
saleSchema.virtual('paymentPercentage').get(function() {
  if (this.finalAmount === 0) return 100;
  return Math.min(100, (this.paidAmount / this.finalAmount) * 100);
});

// Virtual for overdue status
saleSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.paymentStatus === 'paid') return false;
  return new Date() > this.dueDate && this.pendingAmount > 0;
});

// Indexes for better performance
saleSchema.index({ invoiceNumber: 1 });
saleSchema.index({ customer: 1 });
saleSchema.index({ saleDate: -1 });
saleSchema.index({ status: 1 });
saleSchema.index({ paymentStatus: 1 });
saleSchema.index({ customerPhone: 1 });

// Pre-save middleware to generate invoice number
saleSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Find the last invoice for this month
    const lastInvoice = await this.constructor
      .findOne({
        invoiceNumber: new RegExp(`^INV${year}${month}`)
      })
      .sort({ invoiceNumber: -1 });
    
    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.slice(-4));
      sequence = lastSequence + 1;
    }
    
    this.invoiceNumber = `INV${year}${month}${sequence.toString().padStart(4, '0')}`;
  }
  
  // Calculate balance amount
  this.balanceAmount = this.finalAmount - this.paidAmount;
  
  // Update payment status based on paid amount
  if (this.paidAmount === 0) {
    this.paymentStatus = 'pending';
  } else if (this.paidAmount >= this.finalAmount) {
    this.paymentStatus = 'paid';
  } else {
    this.paymentStatus = 'partial';
  }
  
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
