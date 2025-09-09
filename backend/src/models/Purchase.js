const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema({
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
  },
  receivedQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Received quantity cannot be negative']
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for item subtotal before discount
purchaseItemSchema.virtual('subtotal').get(function() {
  return this.quantity * this.unitPrice;
});

// Virtual for discount amount
purchaseItemSchema.virtual('discountAmount').get(function() {
  if (this.discountType === 'percentage') {
    return (this.subtotal * this.discount) / 100;
  }
  return this.discount;
});

// Virtual for amount after discount
purchaseItemSchema.virtual('discountedAmount').get(function() {
  return this.subtotal - this.discountAmount;
});

// Virtual for GST amount
purchaseItemSchema.virtual('gstAmount').get(function() {
  return (this.discountedAmount * this.gstRate) / 100;
});

// Virtual for total amount including GST
purchaseItemSchema.virtual('totalAmount').get(function() {
  return this.discountedAmount + this.gstAmount;
});

// Virtual for pending quantity
purchaseItemSchema.virtual('pendingQuantity').get(function() {
  return Math.max(0, this.quantity - this.receivedQuantity);
});

const purchaseSchema = new mongoose.Schema({
  purchaseOrderNumber: {
    type: String,
    required: [true, 'Purchase order number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required']
  },
  supplierName: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true
  },
  supplierPhone: {
    type: String,
    trim: true
  },
  supplierAddress: {
    type: String,
    trim: true
  },
  items: [purchaseItemSchema],
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
  // Additional Charges
  shippingCharges: {
    type: Number,
    default: 0,
    min: [0, 'Shipping charges cannot be negative']
  },
  packingCharges: {
    type: Number,
    default: 0,
    min: [0, 'Packing charges cannot be negative']
  },
  otherCharges: {
    type: Number,
    default: 0,
    min: [0, 'Other charges cannot be negative']
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
    default: 'pending'
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
  // Purchase Status
  status: {
    type: String,
    enum: ['draft', 'ordered', 'partial_received', 'received', 'cancelled'],
    default: 'draft'
  },
  // Dates
  orderDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Order date is required']
  },
  expectedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  dueDate: {
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
  // Purchase Person
  purchasedBy: {
    type: String,
    trim: true
  },
  // Invoice Information from Supplier
  supplierInvoiceNumber: {
    type: String,
    trim: true
  },
  supplierInvoiceDate: {
    type: Date
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
purchaseSchema.virtual('pendingAmount').get(function() {
  return Math.max(0, this.finalAmount - this.paidAmount);
});

// Virtual for payment completion percentage
purchaseSchema.virtual('paymentPercentage').get(function() {
  if (this.finalAmount === 0) return 100;
  return Math.min(100, (this.paidAmount / this.finalAmount) * 100);
});

// Virtual for overdue status
purchaseSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.paymentStatus === 'paid') return false;
  return new Date() > this.dueDate && this.pendingAmount > 0;
});

// Virtual for delivery status
purchaseSchema.virtual('deliveryStatus').get(function() {
  if (this.status === 'cancelled') return 'cancelled';
  if (!this.expectedDeliveryDate) return 'no_date';
  
  const now = new Date();
  const expected = new Date(this.expectedDeliveryDate);
  
  if (this.status === 'received') return 'delivered';
  if (now > expected) return 'overdue';
  if (now.toDateString() === expected.toDateString()) return 'due_today';
  return 'on_time';
});

// Virtual for total received items
purchaseSchema.virtual('totalReceivedItems').get(function() {
  return this.items.reduce((total, item) => total + item.receivedQuantity, 0);
});

// Virtual for total ordered items
purchaseSchema.virtual('totalOrderedItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Indexes for better performance
purchaseSchema.index({ purchaseOrderNumber: 1 });
purchaseSchema.index({ supplier: 1 });
purchaseSchema.index({ orderDate: -1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ paymentStatus: 1 });
purchaseSchema.index({ expectedDeliveryDate: 1 });

// Pre-save middleware to generate purchase order number
purchaseSchema.pre('save', async function(next) {
  if (!this.purchaseOrderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Find the last purchase order for this month
    const lastPurchase = await this.constructor
      .findOne({
        purchaseOrderNumber: new RegExp(`^PO${year}${month}`)
      })
      .sort({ purchaseOrderNumber: -1 });
    
    let sequence = 1;
    if (lastPurchase) {
      const lastSequence = parseInt(lastPurchase.purchaseOrderNumber.slice(-4));
      sequence = lastSequence + 1;
    }
    
    this.purchaseOrderNumber = `PO${year}${month}${sequence.toString().padStart(4, '0')}`;
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
  
  // Update status based on received items
  const totalReceived = this.totalReceivedItems;
  const totalOrdered = this.totalOrderedItems;
  
  if (totalReceived === 0 && this.status !== 'draft' && this.status !== 'cancelled') {
    this.status = 'ordered';
  } else if (totalReceived > 0 && totalReceived < totalOrdered) {
    this.status = 'partial_received';
  } else if (totalReceived >= totalOrdered && totalOrdered > 0) {
    this.status = 'received';
    if (!this.actualDeliveryDate) {
      this.actualDeliveryDate = new Date();
    }
  }
  
  next();
});

module.exports = mongoose.model('Purchase', purchaseSchema);
