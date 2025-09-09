const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validatePurchase = [
  body('supplier').notEmpty().withMessage('Supplier is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').notEmpty().withMessage('Product is required'),
  body('items.*.quantity').isNumeric({ gt: 0 }).withMessage('Quantity must be greater than 0'),
  body('items.*.unitPrice').isNumeric({ gte: 0 }).withMessage('Unit price must be non-negative'),
  body('paymentMethod').isIn(['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'credit']).withMessage('Invalid payment method'),
];

// GET /api/purchases - Get all purchases
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
      sortBy = 'orderDate',
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
      filter.orderDate = {};
      if (startDate) filter.orderDate.$gte = new Date(startDate);
      if (endDate) filter.orderDate.$lte = new Date(endDate);
    }
    
    if (search) {
      filter.$or = [
        { purchaseOrderNumber: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
        { supplierPhone: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [purchases, total] = await Promise.all([
      Purchase.find(filter)
        .populate('supplier', 'name companyName phone email')
        .populate('items.product', 'name sku')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Purchase.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: purchases,
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

// GET /api/purchases/:id - Get single purchase
router.get('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier')
      .populate('items.product');
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      data: purchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/purchases - Create new purchase
router.post('/', validatePurchase, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Get supplier details
    const supplier = await Supplier.findById(req.body.supplier);
    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier not found'
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

    const totalAmount = subtotal - totalDiscount + totalGst + 
      (req.body.shippingCharges || 0) + 
      (req.body.packingCharges || 0) + 
      (req.body.otherCharges || 0);
    const finalAmount = Math.round(totalAmount);
    const roundOffAmount = finalAmount - totalAmount;

    // Create purchase
    const purchaseData = {
      ...req.body,
      supplierName: supplier.displayName,
      supplierPhone: supplier.phone,
      supplierAddress: supplier.fullAddress,
      subtotal,
      totalDiscount,
      totalGst,
      totalAmount,
      finalAmount,
      roundOffAmount
    };

    const purchase = new Purchase(purchaseData);
    await purchase.save();

    // Update supplier statistics
    await Supplier.findByIdAndUpdate(
      req.body.supplier,
      {
        $inc: { 
          totalPurchases: finalAmount,
          totalOrders: 1,
          currentBalance: purchase.paymentStatus === 'paid' ? 0 : -finalAmount
        },
        lastOrderDate: new Date()
      }
    );

    res.status(201).json({
      success: true,
      data: purchase,
      message: 'Purchase order created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/purchases/:id - Update purchase
router.put('/:id', validatePurchase, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('supplier').populate('items.product');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      data: purchase,
      message: 'Purchase updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH /api/purchases/:id/receive - Update received quantities
router.patch('/:id/receive', async (req, res) => {
  try {
    const { items } = req.body;

    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // Update received quantities and product stock
    for (let receivedItem of items) {
      const purchaseItem = purchase.items.find(item => 
        item.product.toString() === receivedItem.product
      );
      
      if (purchaseItem) {
        const additionalReceived = receivedItem.receivedQuantity - purchaseItem.receivedQuantity;
        purchaseItem.receivedQuantity = receivedItem.receivedQuantity;
        
        // Update product stock
        if (additionalReceived > 0) {
          await Product.findByIdAndUpdate(
            receivedItem.product,
            { $inc: { stock: additionalReceived } }
          );
        }
      }
    }

    await purchase.save();

    res.json({
      success: true,
      data: purchase,
      message: 'Received quantities updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH /api/purchases/:id/payment - Update payment status
router.patch('/:id/payment', async (req, res) => {
  try {
    const { paidAmount, paymentMethod, transactionId } = req.body;

    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    purchase.paidAmount = paidAmount;
    if (paymentMethod) purchase.paymentMethod = paymentMethod;
    if (transactionId) purchase.transactionId = transactionId;

    await purchase.save();

    res.json({
      success: true,
      data: purchase,
      message: 'Payment updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/purchases/:id - Delete purchase
router.delete('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      message: 'Purchase cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
