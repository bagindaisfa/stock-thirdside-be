const express = require('express');
const { createSale } = require('../controllers/posController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/sales', authenticateToken, createSale);

module.exports = router;
