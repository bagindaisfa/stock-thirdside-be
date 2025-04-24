// routes/stockInRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getStockIn,
  createStockIn,
  updateStockIn,
  deleteStockIn,
} = require('../controllers/stockInController');

// GET all stock_in
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  getStockIn
);

// POST new stock_in
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  createStockIn
);

// PUT update stock_in
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  updateStockIn
);

// DELETE stock_in
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  deleteStockIn
);

module.exports = router;
