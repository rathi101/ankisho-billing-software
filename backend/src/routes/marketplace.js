const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Marketplace configuration routes
router.get('/configs', marketplaceController.getConfigs);
router.put('/configs/:marketplace', marketplaceController.updateConfig);

// Sync routes
router.post('/sync/:marketplace', marketplaceController.syncOrders);

// Sales routes
router.get('/sales', marketplaceController.getMarketplaceSales);
router.post('/sales/:id/convert', marketplaceController.convertToLocalSale);

// Analytics routes
router.get('/analytics', marketplaceController.getAnalytics);

module.exports = router;
