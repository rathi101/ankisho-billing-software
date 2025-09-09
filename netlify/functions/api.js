// Simple Netlify Function handler
exports.handler = async (event, context) => {
  const { httpMethod, path, queryStringParameters, body } = event;
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

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

  // Route handling - path in Netlify Functions is just the path after the function name
  const route = path || '/';
  
  try {
    // Handle root path
    if (route === '/' || route === '') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: '🧾 Welcome to Ankisho Billing Software API',
          version: '1.0.0',
          type: 'serverless',
          status: 'running'
        })
      };
    }

    // Handle health check
    if (route === '/health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Ankisho Billing Software API is running',
          timestamp: new Date().toISOString(),
          environment: 'serverless'
        })
      };
    }

    // Handle products
    if (route === '/products') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: products })
      };
    }

    // Handle customers
    if (route === '/customers') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: customers })
      };
    }

    // Handle sales
    if (route === '/sales') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: sales })
      };
    }

    // Handle dashboard
    if (route === '/dashboard') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
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
        })
      };
    }

    // Handle purchases
    if (route === '/purchases') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: [] })
      };
    }

    // Handle suppliers
    if (route === '/suppliers') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: [] })
      };
    }

    // Handle staff
    if (route === '/staff') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: [] })
      };
    }

    // Handle marketplace configs
    if (route === '/marketplace/configs') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: [] })
      };
    }

    // Default 404
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        message: `Route ${route} not found`
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};
