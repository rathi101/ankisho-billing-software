const mongoose = require('mongoose');

const marketplaceSaleSchema = new mongoose.Schema({
  // Marketplace Information
  marketplace: {
    type: String,
    required: true,
    enum: ['meesho', 'amazon', 'flipkart'],
    index: true
  },
  marketplaceOrderId: {
    type: String,
    required: true,
    index: true
  },
  marketplaceOrderDate: {
    type: Date,
    required: true
  },
  
  // Customer Information
  customer: {
    name: { type: String, required: true },
    phone: String,
    email: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    }
  },
  
  // Product Information
  items: [{
    marketplaceProductId: { type: String, required: true },
    productName: { type: String, required: true },
    sku: String,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    
    // Link to local product if exists
    localProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  }],
  
  // Order Details
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Marketplace specific fees
  fees: {
    commission: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  
  netAmount: {
    type: Number,
    required: true
  },
  
  // Status Information
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  
  // Shipping Information
  shipping: {
    method: String,
    trackingNumber: String,
    carrier: String,
    shippedDate: Date,
    deliveredDate: Date
  },
  
  // Sync Information
  syncStatus: {
    type: String,
    enum: ['synced', 'pending', 'failed'],
    default: 'synced'
  },
  
  lastSyncDate: {
    type: Date,
    default: Date.now
  },
  
  // Raw marketplace data for reference
  rawData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better performance
marketplaceSaleSchema.index({ marketplace: 1, marketplaceOrderId: 1 }, { unique: true });
marketplaceSaleSchema.index({ marketplaceOrderDate: -1 });
marketplaceSaleSchema.index({ orderStatus: 1 });
marketplaceSaleSchema.index({ paymentStatus: 1 });
marketplaceSaleSchema.index({ syncStatus: 1 });

// Calculate net amount before saving
marketplaceSaleSchema.pre('save', function(next) {
  if (this.isModified('totalAmount') || this.isModified('fees')) {
    this.netAmount = this.totalAmount - (this.fees.commission + this.fees.shipping + this.fees.tax + this.fees.other);
  }
  next();
});

// Virtual for total fees
marketplaceSaleSchema.virtual('totalFees').get(function() {
  return this.fees.commission + this.fees.shipping + this.fees.tax + this.fees.other;
});

module.exports = mongoose.model('MarketplaceSale', marketplaceSaleSchema);
