const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateSale = [
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').notEmpty().withMessage('Product is required'),
  body('items.*.quantity').isNumeric({ gt: 0 }).withMessage('Quantity must be greater than 0'),
  body('items.*.unitPrice').isNumeric({ gte: 0 }).withMessage('Unit price must be non-negative'),
  body('paymentMethod').isIn(['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'credit']).withMessage('Invalid payment method'),
];

// GET /api/sales - Get all sales
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status,
      paymentStatus,
      startDate,
      endDate,
      sortBy = 'saleDate',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }
    
    if (startDate || endDate) {
      filter.saleDate = {};
      if (startDate) filter.saleDate.$gte = new Date(startDate);
      if (endDate) filter.saleDate.$lte = new Date(endDate);
    }
    
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sales, total] = await Promise.all([
      Sale.find(filter)
        .populate('customer', 'name phone email')
        .populate('items.product', 'name sku')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Sale.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: sales,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/sales/:id - Get single sale
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer')
      .populate('items.product');
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/sales - Create new sale
router.post('/', validateSale, async (req, res) => {
  try {
    console.log('🚀 Received sale data:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;
    let totalGst = 0;

    // Validate and calculate item totals
    for (let item of req.body.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
        });
      }

      // Set product name and calculate amounts
      item.productName = product.name;
      const itemSubtotal = item.quantity * item.unitPrice;
      const discountAmount = item.discountType === 'percentage' 
        ? (itemSubtotal * item.discount) / 100 
        : item.discount;
      const discountedAmount = itemSubtotal - discountAmount;
      const gstAmount = (discountedAmount * item.gstRate) / 100;

      subtotal += itemSubtotal;
      totalDiscount += discountAmount;
      totalGst += gstAmount;
    }

    const totalAmount = subtotal - totalDiscount + totalGst;
    const finalAmount = Math.round(totalAmount);
    const roundOffAmount = finalAmount - totalAmount;

    // Create sale
    const saleData = {
      ...req.body,
      subtotal,
      totalDiscount,
      totalGst,
      totalAmount,
      finalAmount,
      roundOffAmount
    };

    const sale = new Sale(saleData);
    await sale.save();

    // Update product stock
    for (let item of req.body.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Update customer statistics if customer exists
    if (req.body.customer) {
      await Customer.findByIdAndUpdate(
        req.body.customer,
        {
          $inc: { 
            totalSales: finalAmount,
            totalOrders: 1,
            currentBalance: sale.paymentStatus === 'paid' ? 0 : finalAmount
          },
          lastOrderDate: new Date()
        }
      );
    }

    res.status(201).json({
      success: true,
      data: sale,
      message: 'Sale created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/sales/:id - Update sale
router.put('/:id', validateSale, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customer').populate('items.product');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: sale,
      message: 'Sale updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH /api/sales/:id/payment - Update payment status
router.patch('/:id/payment', async (req, res) => {
  try {
    const { paidAmount, paymentMethod, transactionId } = req.body;

    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    sale.paidAmount = paidAmount;
    if (paymentMethod) sale.paymentMethod = paymentMethod;
    if (transactionId) sale.transactionId = transactionId;

    await sale.save();

    res.json({
      success: true,
      data: sale,
      message: 'Payment updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/sales/:id - Delete sale
router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Restore product stock
    for (let item of sale.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    res.json({
      success: true,
      message: 'Sale cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
