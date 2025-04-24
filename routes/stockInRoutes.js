// routes/stockInRoutes.js
const express = require('express');
const router = express.Router();
const {
  getStockIn,
  createStockIn,
  updateStockIn,
  deleteStockIn,
} = require('../controllers/stockInController');

// GET all stock_in
router.get('/', getStockIn);

// POST new stock_in
router.post('/', createStockIn);

// PUT update stock_in
router.put('/:id', updateStockIn);

// DELETE stock_in
router.delete('/:id', deleteStockIn);

module.exports = router;
