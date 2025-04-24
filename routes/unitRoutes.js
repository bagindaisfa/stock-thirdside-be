const express = require('express');
const {
  getUnits,
  addUnit,
  updateUnit,
  deleteUnit,
} = require('../controllers/unitController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authenticateToken, getUnits);
router.post('/', authenticateToken, addUnit);
router.put('/:id', authenticateToken, updateUnit);
router.delete('/:id', authenticateToken, deleteUnit);

module.exports = router;
