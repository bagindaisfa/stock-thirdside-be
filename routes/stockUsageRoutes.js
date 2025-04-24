// routes/stockUsageRoutes.js
const express = require('express');
const router = express.Router();
const {
  getStockUsage,
  createStockUsage,
  updateStockUsage,
  deleteStockUsage,
} = require('../controllers/stockUsageController');

// GET all stock_usage
router.get('/', getStockUsage);

// POST new stock_usage
router.post('/', createStockUsage);

// PUT update stock_usage
router.put('/:id', updateStockUsage);

// DELETE stock_usage
router.delete('/:id', deleteStockUsage);

module.exports = router;
