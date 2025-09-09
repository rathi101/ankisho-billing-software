const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Sample data
const products = [
  { _id: '1', name: 'Sample Product 1', price: 100, stock: 50, category: 'Electronics' },
  { _id: '2', name: 'Sample Product 2', price: 200, stock: 30, category: 'Clothing' }
];

const customers = [
  { _id: '1', name: 'John Doe', email: 'john@example.com', phone: '9876543210' },
  { _id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '9876543211' }
];

const sales = [
  { 
    _id: '1', 
    customer: { _id: '1', name: 'John Doe' },
    items: [{ product: { _id: '1', name: 'Sample Product 1' }, quantity: 2, price: 100 }],
    total: 200,
    date: new Date().toISOString(),
    status: 'completed'
  }
];

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🧾 Ankisho Billing Software API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/products', (req, res) => {
  res.json({ success: true, data: products });
});

app.get('/api/customers', (req, res) => {
  res.json({ success: true, data: customers });
});

app.get('/api/sales', (req, res) => {
  res.json({ success: true, data: sales });
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      totalSales: 200,
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalPurchases: 0,
      recentSales: sales,
      salesData: [
        { month: 'Jan', sales: 1000 },
        { month: 'Feb', sales: 1500 },
        { month: 'Mar', sales: 2000 }
      ]
    }
  });
});

app.get('/api/purchases', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/suppliers', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/staff', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/marketplace/configs', (req, res) => {
  res.json({ success: true, data: [] });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
