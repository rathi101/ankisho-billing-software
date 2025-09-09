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

  // Only handle GET requests
  if (event.httpMethod !== 'GET') {
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
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          inventory: {
            totalProducts: 2,
            lowStockProducts: 0,
            outOfStockProducts: 0
          },
          customers: {
            total: 2,
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
            sales: [{
              _id: '1',
              customer: { _id: '1', name: 'John Doe' },
              items: [{ product: { _id: '1', name: 'Sample Product 1' }, quantity: 2, price: 100 }],
              total: 200,
              date: new Date().toISOString(),
              status: 'completed'
            }],
            purchases: []
          }
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
