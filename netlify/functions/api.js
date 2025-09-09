// Simple Netlify Function handler
exports.handler = async (event, context) => {
  const { httpMethod, path, queryStringParameters, body } = event;
  
  // Debug logging
  console.log('Function called with:', { httpMethod, path, queryStringParameters });
  
  // For Netlify functions, the path parameter contains the route after the function name
  // So /.netlify/functions/api/auth/login becomes just /auth/login
  let apiRoute = path || '/';
  
  console.log('Processed route:', apiRoute);
  
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

  // Route handling
  const route = apiRoute;
  
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

    // Handle auth/login
    if (route === '/auth/login' && httpMethod === 'POST') {
      const requestBody = JSON.parse(body || '{}');
      const { email, password } = requestBody;
      
      // Mock authentication - replace with real auth logic
      if (email === 'admin@ankisho.com' && password === 'admin123') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Login successful',
            token: 'mock-jwt-token-admin',
            user: {
              _id: '1',
              name: 'Admin User',
              email: 'admin@ankisho.com',
              role: 'admin',
              permissions: {
                products: true,
                customers: true,
                suppliers: true,
                sales: true,
                purchases: true,
                reports: true,
                settings: true
              }
            }
          })
        };
      } else if (email === 'sharmasahab24@gmail.com' && password === 'password123') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Login successful',
            token: 'mock-jwt-token-staff',
            user: {
              _id: '2',
              name: 'Pawan Sharma',
              email: 'sharmasahab24@gmail.com',
              role: 'staff',
              permissions: {
                products: false,
                customers: true,
                suppliers: false,
                sales: true,
                purchases: false,
                reports: false,
                settings: false
              }
            }
          })
        };
      } else {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Invalid email or password'
          })
        };
      }
    }

    // Handle dashboard/stats
    if (route === '/dashboard/stats') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            inventory: {
              totalProducts: products.length,
              lowStockProducts: 0,
              outOfStockProducts: 0
            },
            customers: {
              total: customers.length,
              activeToday: 0
            },
            suppliers: {
              total: 0
            },
            sales: {
              today: {
                revenue: 0,
                orders: 0
              },
              month: {
                revenue: 200,
                orders: 1
              }
            },
            purchases: {
              today: {
                amount: 0,
                orders: 0
              },
              month: {
                amount: 0,
                orders: 0
              }
            },
            payments: {
              pending: {
                amount: 0,
                orders: 0
              }
            },
            recent: {
              sales: sales,
              purchases: []
            }
          }
        })
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
    console.log('No route matched, returning 404 for:', route);
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        message: `Route ${route} not found`,
        debug: {
          originalPath: path,
          processedRoute: route,
          method: httpMethod
        }
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
