const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'https://ankisho-billing-software.netlify.app',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// In-memory data store (for demo)
let products = [
  { _id: '1', name: 'Sample Product 1', price: 100, stock: 50, category: 'Electronics' },
  { _id: '2', name: 'Sample Product 2', price: 200, stock: 30, category: 'Clothing' }
];

let customers = [
  { _id: '1', name: 'John Doe', email: 'john@example.com', phone: '9876543210' },
  { _id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '9876543211' }
];

let sales = [
  { 
    _id: '1', 
    customer: { _id: '1', name: 'John Doe' },
    items: [{ product: { _id: '1', name: 'Sample Product 1' }, quantity: 2, price: 100 }],
    total: 200,
    date: new Date().toISOString(),
    status: 'completed'
  }
];

let purchases = [];
let suppliers = [];

// Generate ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Ankisho Billing Software API is running',
    timestamp: new Date().toISOString(),
    environment: 'serverless'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Ankisho Billing Software API is running',
    timestamp: new Date().toISOString(),
    environment: 'serverless'
  });
});

// Products Routes
app.get('/api/products', (req, res) => {
  res.json({ success: true, data: products });
});

app.post('/api/products', (req, res) => {
  const product = { _id: generateId(), ...req.body };
  products.push(product);
  res.status(201).json({ success: true, data: product });
});

app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p._id === req.params.id);
  if (index !== -1) {
    products[index] = { ...products[index], ...req.body };
    res.json({ success: true, data: products[index] });
  } else {
    res.status(404).json({ success: false, message: 'Product not found' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  products = products.filter(p => p._id !== req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});

// Customers Routes
app.get('/api/customers', (req, res) => {
  res.json({ success: true, data: customers });
});

app.post('/api/customers', (req, res) => {
  const customer = { _id: generateId(), ...req.body };
  customers.push(customer);
  res.status(201).json({ success: true, data: customer });
});

app.put('/api/customers/:id', (req, res) => {
  const index = customers.findIndex(c => c._id === req.params.id);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...req.body };
    res.json({ success: true, data: customers[index] });
  } else {
    res.status(404).json({ success: false, message: 'Customer not found' });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  customers = customers.filter(c => c._id !== req.params.id);
  res.json({ success: true, message: 'Customer deleted' });
});

// Sales Routes
app.get('/api/sales', (req, res) => {
  res.json({ success: true, data: sales });
});

app.post('/api/sales', (req, res) => {
  const sale = { 
    _id: generateId(), 
    ...req.body,
    date: new Date().toISOString(),
    status: 'completed'
  };
  sales.push(sale);
  res.status(201).json({ success: true, data: sale });
});

// Purchases Routes
app.get('/api/purchases', (req, res) => {
  res.json({ success: true, data: purchases });
});

app.post('/api/purchases', (req, res) => {
  const purchase = { 
    _id: generateId(), 
    ...req.body,
    date: new Date().toISOString(),
    status: 'completed'
  };
  purchases.push(purchase);
  res.status(201).json({ success: true, data: purchase });
});

// Suppliers Routes
app.get('/api/suppliers', (req, res) => {
  res.json({ success: true, data: suppliers });
});

app.post('/api/suppliers', (req, res) => {
  const supplier = { _id: generateId(), ...req.body };
  suppliers.push(supplier);
  res.status(201).json({ success: true, data: supplier });
});

// Dashboard Routes
app.get('/api/dashboard', (req, res) => {
  const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const recentSales = sales.slice(-5);

  res.json({
    success: true,
    data: {
      totalSales,
      totalProducts,
      totalCustomers,
      totalPurchases: purchases.length,
      recentSales,
      salesData: [
        { month: 'Jan', sales: 1000 },
        { month: 'Feb', sales: 1500 },
        { month: 'Mar', sales: 2000 },
        { month: 'Apr', sales: 1800 },
        { month: 'May', sales: 2500 }
      ]
    }
  });
});

// Auth Routes (Mock)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@ankisho.com' && password === 'admin123') {
    res.json({
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: { id: '1', name: 'Admin', email: 'admin@ankisho.com', role: 'admin' }
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Staff Routes (Mock)
app.get('/api/staff', (req, res) => {
  res.json({ success: true, data: [] });
});

// Marketplace Routes (Mock)
app.get('/api/marketplace/configs', (req, res) => {
  res.json({ success: true, data: [] });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🧾 Welcome to Ankisho Billing Software API',
    version: '1.0.0',
    type: 'serverless',
    endpoints: {
      health: '/.netlify/functions/api/health',
      products: '/.netlify/functions/api/products',
      customers: '/.netlify/functions/api/customers',
      sales: '/.netlify/functions/api/sales',
      dashboard: '/.netlify/functions/api/dashboard'
    }
  });
});

// Handle all routes with /api prefix
app.use('/api', (req, res, next) => {
  // Strip /api from the path and continue
  req.url = req.url.replace('/api', '');
  next();
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Export serverless function
module.exports.handler = serverless(app);
