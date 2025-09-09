exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only handle POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed'
      })
    };
  }

  try {
    const { email, password } = JSON.parse(event.body || '{}');
    
    // Mock authentication
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
