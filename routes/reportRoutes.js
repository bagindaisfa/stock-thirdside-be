const express = require('express');
const router = express.Router();
const {
  getStockSummaryReport,
  exportStockSummaryCSV,
  exportStockSummaryPDF,
} = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.get('/stock-summary', authenticateToken, getStockSummaryReport);
router.get('/stock-summary/csv', authenticateToken, exportStockSummaryCSV);
router.get('/stock-summary/pdf', authenticateToken, exportStockSummaryPDF);

module.exports = router;
