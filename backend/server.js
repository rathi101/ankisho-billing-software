const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config({ path: './config.env' });

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/billing-software', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/staff-requests', require('./src/routes/staffRequests'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/customers', require('./src/routes/customers'));
app.use('/api/suppliers', require('./src/routes/suppliers'));
app.use('/api/sales', require('./src/routes/sales'));
app.use('/api/purchases', require('./src/routes/purchases'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/staff', require('./src/routes/staff'));
app.use('/api/marketplace', require('./src/routes/marketplace'));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ankisho Billing Software API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: '🧾 Welcome to Ankisho Billing Software API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      customers: '/api/customers',
      suppliers: '/api/suppliers',
      sales: '/api/sales',
      purchases: '/api/purchases',
      dashboard: '/api/dashboard',
      marketplace: '/api/marketplace'
    }
  });
});

// Error Handling Middleware
app.use(require('./src/middleware/errorHandler'));

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔗 API Health Check: http://localhost:${PORT}/api/health`);
});
