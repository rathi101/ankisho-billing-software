const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Parallel queries for better performance
    const [
      totalProducts,
      totalCustomers,
      totalSuppliers,
      lowStockProducts,
      todaySales,
      monthSales,
      todayPurchases,
      monthPurchases,
      pendingPayments,
      recentSales,
      recentPurchases
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Customer.countDocuments({ isActive: true }),
      Supplier.countDocuments({ isActive: true }),
      Product.countDocuments({ 
        isActive: true, 
        $expr: { $lte: ['$stock', '$minStock'] } 
      }),
      
      // Today's sales
      Sale.aggregate([
        {
          $match: {
            saleDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'cancelled' },
            ...(req.user.role === 'staff' ? { createdBy: req.user.id } : {})
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$finalAmount' },
            totalOrders: { $sum: 1 }
          }
        }
      ]),
      
      // This month's sales
      Sale.aggregate([
        {
          $match: {
            saleDate: { $gte: startOfMonth, $lte: endOfMonth },
            status: { $ne: 'cancelled' },
            ...(req.user.role === 'staff' ? { createdBy: req.user.id } : {})
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$finalAmount' },
            totalOrders: { $sum: 1 }
          }
        }
      ]),
      
      // Today's purchases
      Purchase.aggregate([
        {
          $match: {
            orderDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            totalPurchases: { $sum: '$finalAmount' },
            totalOrders: { $sum: 1 }
          }
        }
      ]),
      
      // This month's purchases
      Purchase.aggregate([
        {
          $match: {
            orderDate: { $gte: startOfMonth, $lte: endOfMonth },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            totalPurchases: { $sum: '$finalAmount' },
            totalOrders: { $sum: 1 }
          }
        }
      ]),
      
      // Pending payments
      Sale.aggregate([
        {
          $match: {
            paymentStatus: { $in: ['pending', 'partial'] },
            ...(req.user.role === 'staff' ? { createdBy: req.user.id } : {})
          }
        },
        {
          $group: {
            _id: null,
            pendingAmount: { $sum: '$balanceAmount' },
            pendingOrders: { $sum: 1 }
          }
        }
      ]),
      
      // Recent sales (last 10)
      Sale.find({ 
        status: { $ne: 'cancelled' },
        ...(req.user.role === 'staff' ? { createdBy: req.user.id } : {})
      })
        .populate('customer', 'name')
        .sort({ saleDate: -1 })
        .limit(10)
        .select('invoiceNumber customerName finalAmount saleDate paymentStatus'),
      
      // Recent purchases (last 10)
      Purchase.find({ status: { $ne: 'cancelled' } })
        .populate('supplier', 'name companyName')
        .sort({ orderDate: -1 })
        .limit(10)
        .select('purchaseOrderNumber supplierName finalAmount orderDate paymentStatus')
    ]);

    // Format the data
    const stats = {
      inventory: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts: await Product.countDocuments({ 
          isActive: true, 
          stock: 0 
        })
      },
      
      customers: {
        total: totalCustomers,
        activeToday: await Customer.countDocuments({
          lastOrderDate: { $gte: startOfDay, $lte: endOfDay }
        })
      },
      
      suppliers: {
        total: totalSuppliers
      },
      
      sales: {
        today: {
          revenue: todaySales[0]?.totalSales || 0,
          orders: todaySales[0]?.totalOrders || 0
        },
        month: {
          revenue: monthSales[0]?.totalSales || 0,
          orders: monthSales[0]?.totalOrders || 0
        }
      },
      
      purchases: {
        today: {
          amount: todayPurchases[0]?.totalPurchases || 0,
          orders: todayPurchases[0]?.totalOrders || 0
        },
        month: {
          amount: monthPurchases[0]?.totalPurchases || 0,
          orders: monthPurchases[0]?.totalOrders || 0
        }
      },
      
      payments: {
        pending: {
          amount: pendingPayments[0]?.pendingAmount || 0,
          orders: pendingPayments[0]?.pendingOrders || 0
        }
      },
      
      recent: {
        sales: recentSales,
        purchases: recentPurchases
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/dashboard/charts - Get chart data
router.get('/charts', async (req, res) => {
  try {
    const { period = '7days' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '7days':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // Sales trend
    const salesTrend = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$saleDate' }
          },
          revenue: { $sum: '$finalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Top selling products
    const topProducts = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalAmount' }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Payment method distribution
    const paymentMethods = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$finalAmount' }
        }
      }
    ]);

    // Category wise sales
    const categorySales = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSales: { $sum: '$items.totalAmount' },
          totalQuantity: { $sum: '$items.quantity' }
        }
      },
      {
        $sort: { totalSales: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        salesTrend,
        topProducts,
        paymentMethods,
        categorySales
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
