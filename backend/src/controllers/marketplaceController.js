const MarketplaceSale = require('../models/MarketplaceSale');
const MarketplaceConfig = require('../models/MarketplaceConfig');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const axios = require('axios');

// Marketplace service classes
class MarketplaceService {
  constructor(marketplace, config) {
    this.marketplace = marketplace;
    this.config = config;
  }

  async fetchOrders(fromDate, toDate) {
    throw new Error('fetchOrders method must be implemented by subclass');
  }

  async processOrder(orderData) {
    throw new Error('processOrder method must be implemented by subclass');
  }
}

// Meesho Service
class MeeshoService extends MarketplaceService {
  async fetchOrders(fromDate, toDate) {
    try {
      const { merchantId, supplierIdentifier, secret, apiUrl } = this.config.credentials;
      
      const response = await axios.get(`${apiUrl}/api/v1/orders`, {
        headers: {
          'Authorization': `Bearer ${secret}`,
          'Content-Type': 'application/json'
        },
        params: {
          merchant_id: merchantId,
          supplier_identifier: supplierIdentifier,
          from_date: fromDate.toISOString(),
          to_date: toDate.toISOString()
        }
      });

      return response.data.orders || [];
    } catch (error) {
      console.error('Meesho API Error:', error.message);
      throw error;
    }
  }

  async processOrder(orderData) {
    return {
      marketplace: 'meesho',
      marketplaceOrderId: orderData.order_id,
      marketplaceOrderDate: new Date(orderData.order_date),
      customer: {
        name: orderData.customer_name,
        phone: orderData.customer_phone,
        address: {
          street: orderData.shipping_address?.address_line_1,
          city: orderData.shipping_address?.city,
          state: orderData.shipping_address?.state,
          pincode: orderData.shipping_address?.pincode
        }
      },
      items: orderData.items?.map(item => ({
        marketplaceProductId: item.product_id,
        productName: item.product_name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price
      })) || [],
      totalAmount: orderData.total_amount,
      fees: {
        commission: orderData.commission_fee || 0,
        shipping: orderData.shipping_fee || 0,
        tax: orderData.tax_amount || 0
      },
      orderStatus: this.mapOrderStatus(orderData.status),
      paymentStatus: orderData.payment_status === 'paid' ? 'paid' : 'pending',
      rawData: orderData
    };
  }

  mapOrderStatus(status) {
    const statusMap = {
      'new': 'pending',
      'confirmed': 'confirmed',
      'packed': 'packed',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'returned': 'returned'
    };
    return statusMap[status] || 'pending';
  }
}

// Amazon Service
class AmazonService extends MarketplaceService {
  async fetchOrders(fromDate, toDate) {
    try {
      const { accessToken, marketplaceId, apiUrl } = this.config.credentials;
      
      const response = await axios.get(`${apiUrl}/orders/v0/orders`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          MarketplaceIds: marketplaceId,
          CreatedAfter: fromDate.toISOString(),
          CreatedBefore: toDate.toISOString()
        }
      });

      return response.data.Orders || [];
    } catch (error) {
      console.error('Amazon API Error:', error.message);
      throw error;
    }
  }

  async processOrder(orderData) {
    return {
      marketplace: 'amazon',
      marketplaceOrderId: orderData.AmazonOrderId,
      marketplaceOrderDate: new Date(orderData.PurchaseDate),
      customer: {
        name: orderData.BuyerInfo?.BuyerName || 'Amazon Customer',
        email: orderData.BuyerInfo?.BuyerEmail,
        address: {
          city: orderData.ShippingAddress?.City,
          state: orderData.ShippingAddress?.StateOrRegion,
          pincode: orderData.ShippingAddress?.PostalCode,
          country: orderData.ShippingAddress?.CountryCode
        }
      },
      items: [], // Will be fetched separately using order items API
      totalAmount: parseFloat(orderData.OrderTotal?.Amount || 0),
      fees: {
        commission: 0, // Will be calculated from settlement reports
        shipping: 0,
        tax: 0
      },
      orderStatus: this.mapOrderStatus(orderData.OrderStatus),
      paymentStatus: orderData.PaymentMethod === 'COD' ? 'pending' : 'paid',
      rawData: orderData
    };
  }

  mapOrderStatus(status) {
    const statusMap = {
      'Pending': 'pending',
      'Unshipped': 'confirmed',
      'PartiallyShipped': 'packed',
      'Shipped': 'shipped',
      'Delivered': 'delivered',
      'Canceled': 'cancelled'
    };
    return statusMap[status] || 'pending';
  }
}

// Flipkart Service
class FlipkartService extends MarketplaceService {
  async fetchOrders(fromDate, toDate) {
    try {
      const { applicationId, applicationSecret, apiUrl } = this.config.credentials;
      
      const response = await axios.get(`${apiUrl}/v3/orders/search`, {
        headers: {
          'Authorization': `Bearer ${applicationSecret}`,
          'Content-Type': 'application/json'
        },
        params: {
          filter: {
            orderDate: {
              fromDate: fromDate.toISOString().split('T')[0],
              toDate: toDate.toISOString().split('T')[0]
            }
          }
        }
      });

      return response.data.orderItems || [];
    } catch (error) {
      console.error('Flipkart API Error:', error.message);
      throw error;
    }
  }

  async processOrder(orderData) {
    return {
      marketplace: 'flipkart',
      marketplaceOrderId: orderData.orderId,
      marketplaceOrderDate: new Date(orderData.orderDate),
      customer: {
        name: orderData.shippingAddress?.name || 'Flipkart Customer',
        phone: orderData.shippingAddress?.phone,
        address: {
          street: orderData.shippingAddress?.addressLine1,
          city: orderData.shippingAddress?.city,
          state: orderData.shippingAddress?.state,
          pincode: orderData.shippingAddress?.pincode
        }
      },
      items: [{
        marketplaceProductId: orderData.sku,
        productName: orderData.productTitle,
        sku: orderData.sku,
        quantity: orderData.quantity,
        unitPrice: orderData.sellingPrice,
        totalPrice: orderData.totalPrice
      }],
      totalAmount: orderData.totalPrice,
      fees: {
        commission: orderData.commissionAmount || 0,
        shipping: orderData.shippingFee || 0,
        tax: orderData.taxAmount || 0
      },
      orderStatus: this.mapOrderStatus(orderData.orderItemStatus),
      paymentStatus: orderData.paymentType === 'COD' ? 'pending' : 'paid',
      rawData: orderData
    };
  }

  mapOrderStatus(status) {
    const statusMap = {
      'APPROVED': 'confirmed',
      'PACKING_IN_PROGRESS': 'packed',
      'PACKED': 'packed',
      'SHIPPED': 'shipped',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled',
      'RETURNED': 'returned'
    };
    return statusMap[status] || 'pending';
  }
}

// Controller functions
const marketplaceController = {
  // Get marketplace configurations
  async getConfigs(req, res) {
    try {
      const configs = await MarketplaceConfig.find({});
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update marketplace configuration
  async updateConfig(req, res) {
    try {
      const { marketplace } = req.params;
      const configData = req.body;

      const config = await MarketplaceConfig.findOneAndUpdate(
        { marketplace },
        configData,
        { new: true, upsert: true }
      );

      res.json(config);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Sync orders from marketplace
  async syncOrders(req, res) {
    try {
      const { marketplace } = req.params;
      const { fromDate, toDate } = req.query;

      const config = await MarketplaceConfig.findOne({ marketplace, isActive: true });
      if (!config) {
        return res.status(404).json({ error: 'Marketplace configuration not found or inactive' });
      }

      let service;
      switch (marketplace) {
        case 'meesho':
          service = new MeeshoService(marketplace, config);
          break;
        case 'amazon':
          service = new AmazonService(marketplace, config);
          break;
        case 'flipkart':
          service = new FlipkartService(marketplace, config);
          break;
        default:
          return res.status(400).json({ error: 'Unsupported marketplace' });
      }

      const from = fromDate ? new Date(fromDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const to = toDate ? new Date(toDate) : new Date();

      const orders = await service.fetchOrders(from, to);
      const processedOrders = [];

      for (const orderData of orders) {
        try {
          const processedOrder = await service.processOrder(orderData);
          
          // Check if order already exists
          const existingOrder = await MarketplaceSale.findOne({
            marketplace: processedOrder.marketplace,
            marketplaceOrderId: processedOrder.marketplaceOrderId
          });

          if (existingOrder) {
            // Update existing order
            Object.assign(existingOrder, processedOrder);
            await existingOrder.save();
            processedOrders.push(existingOrder);
          } else {
            // Create new order
            const newOrder = new MarketplaceSale(processedOrder);
            await newOrder.save();
            processedOrders.push(newOrder);
          }
        } catch (orderError) {
          console.error(`Error processing order ${orderData.order_id || orderData.AmazonOrderId || orderData.orderId}:`, orderError.message);
        }
      }

      // Update last sync date
      config.syncSettings.lastSyncDate = new Date();
      await config.save();

      res.json({
        success: true,
        ordersProcessed: processedOrders.length,
        orders: processedOrders
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get marketplace sales
  async getMarketplaceSales(req, res) {
    try {
      const { marketplace, status, fromDate, toDate, page = 1, limit = 50 } = req.query;
      
      const filter = {};
      if (marketplace) filter.marketplace = marketplace;
      if (status) filter.orderStatus = status;
      if (fromDate || toDate) {
        filter.marketplaceOrderDate = {};
        if (fromDate) filter.marketplaceOrderDate.$gte = new Date(fromDate);
        if (toDate) filter.marketplaceOrderDate.$lte = new Date(toDate);
      }

      const sales = await MarketplaceSale.find(filter)
        .sort({ marketplaceOrderDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('items.localProduct');

      const total = await MarketplaceSale.countDocuments(filter);

      res.json({
        success: true,
        data: {
          sales,
          total,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Convert marketplace sale to local sale
  async convertToLocalSale(req, res) {
    try {
      const { id } = req.params;
      
      const marketplaceSale = await MarketplaceSale.findById(id);
      if (!marketplaceSale) {
        return res.status(404).json({ error: 'Marketplace sale not found' });
      }

      // Check if already converted
      const existingSale = await Sale.findOne({ 
        'metadata.marketplaceSaleId': marketplaceSale._id 
      });
      
      if (existingSale) {
        return res.status(400).json({ error: 'Sale already converted' });
      }

      // Find or create customer
      let customer = await Customer.findOne({ 
        phone: marketplaceSale.customer.phone 
      });
      
      if (!customer) {
        customer = new Customer({
          name: marketplaceSale.customer.name,
          phone: marketplaceSale.customer.phone,
          email: marketplaceSale.customer.email,
          address: marketplaceSale.customer.address,
          source: marketplaceSale.marketplace
        });
        await customer.save();
      }

      // Process items and find/create products
      const saleItems = [];
      for (const item of marketplaceSale.items) {
        let product = item.localProduct;
        
        if (!product) {
          // Try to find by SKU or name
          product = await Product.findOne({
            $or: [
              { sku: item.sku },
              { name: { $regex: item.productName, $options: 'i' } }
            ]
          });
        }

        if (!product) {
          // Create new product
          product = new Product({
            name: item.productName,
            sku: item.sku || `${marketplaceSale.marketplace}-${item.marketplaceProductId}`,
            price: item.unitPrice,
            category: 'Marketplace',
            stock: 0, // Will need to be updated manually
            source: marketplaceSale.marketplace
          });
          await product.save();
        }

        saleItems.push({
          product: product._id,
          quantity: item.quantity,
          price: item.unitPrice
        });

        // Link product to marketplace item
        item.localProduct = product._id;
      }

      await marketplaceSale.save();

      // Create local sale
      const sale = new Sale({
        customer: customer._id,
        items: saleItems,
        totalAmount: marketplaceSale.totalAmount,
        paidAmount: marketplaceSale.paymentStatus === 'paid' ? marketplaceSale.netAmount : 0,
        paymentStatus: marketplaceSale.paymentStatus,
        status: marketplaceSale.orderStatus === 'delivered' ? 'completed' : 'pending',
        saleDate: marketplaceSale.marketplaceOrderDate,
        metadata: {
          source: marketplaceSale.marketplace,
          marketplaceSaleId: marketplaceSale._id,
          marketplaceOrderId: marketplaceSale.marketplaceOrderId
        }
      });

      await sale.save();

      res.json({
        success: true,
        sale,
        message: 'Marketplace sale converted to local sale successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get marketplace analytics
  async getAnalytics(req, res) {
    try {
      const { fromDate, toDate } = req.query;
      
      const filter = {};
      if (fromDate || toDate) {
        filter.marketplaceOrderDate = {};
        if (fromDate) filter.marketplaceOrderDate.$gte = new Date(fromDate);
        if (toDate) filter.marketplaceOrderDate.$lte = new Date(toDate);
      }

      const analytics = await MarketplaceSale.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$marketplace',
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            totalFees: { $sum: '$totalFees' },
            netRevenue: { $sum: '$netAmount' },
            avgOrderValue: { $avg: '$totalAmount' }
          }
        }
      ]);

      const summary = await MarketplaceSale.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            totalFees: { $sum: '$totalFees' },
            netRevenue: { $sum: '$netAmount' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          byMarketplace: analytics,
          summary: summary[0] || {
            totalOrders: 0,
            totalRevenue: 0,
            totalFees: 0,
            netRevenue: 0
          },
          trends: {
            daily: [],
            monthly: []
          }
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = marketplaceController;
