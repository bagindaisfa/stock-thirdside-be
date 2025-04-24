// routes/stockUsageRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getStockUsage,
  createStockUsage,
  updateStockUsage,
  deleteStockUsage,
} = require('../controllers/stockUsageController');

// GET all stock_usage
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  getStockUsage
);

// POST new stock_usage
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  createStockUsage
);

// PUT update stock_usage
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  updateStockUsage
);

// DELETE stock_usage
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  deleteStockUsage
);

module.exports = router;
