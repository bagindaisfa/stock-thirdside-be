const express = require('express');
const {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authenticateToken, getCategories);
router.post('/', authenticateToken, addCategory);
router.put('/:id', authenticateToken, updateCategory);
router.delete('/:id', authenticateToken, deleteCategory);

module.exports = router;
