const mongoose = require('mongoose');

const marketplaceConfigSchema = new mongoose.Schema({
  marketplace: {
    type: String,
    required: true,
    enum: ['meesho', 'amazon', 'flipkart'],
    unique: true
  },
  
  isActive: {
    type: Boolean,
    default: false
  },
  
  // API Credentials (encrypted)
  credentials: {
    // Meesho
    merchantId: String,
    supplierIdentifier: String,
    secret: String,
    
    // Amazon SP-API
    clientId: String,
    clientSecret: String,
    refreshToken: String,
    accessKeyId: String,
    secretAccessKey: String,
    roleArn: String,
    marketplaceId: String,
    
    // Flipkart
    applicationId: String,
    applicationSecret: String,
    accessToken: String,
    
    // Common
    apiUrl: String,
    apiVersion: String
  },
  
  // Sync Settings
  syncSettings: {
    autoSync: {
      type: Boolean,
      default: true
    },
    syncInterval: {
      type: Number,
      default: 30 // minutes
    },
    lastSyncDate: Date,
    syncOrdersFrom: {
      type: Date,
      default: () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    }
  },
  
  // Mapping Settings
  mappingSettings: {
    autoMapProducts: {
      type: Boolean,
      default: true
    },
    defaultCustomerGroup: String,
    defaultPaymentMethod: {
      type: String,
      default: 'online'
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'error'],
    default: 'inactive'
  },
  
  lastError: {
    message: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

// Encrypt sensitive data before saving
marketplaceConfigSchema.pre('save', function(next) {
  // In production, implement proper encryption for credentials
  next();
});

module.exports = mongoose.model('MarketplaceConfig', marketplaceConfigSchema);
