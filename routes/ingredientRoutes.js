// routes/ingredientRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getIngredients,
  getIngredientHPP,
  getIngredientHistory,
  getStockReport,
  getAllIngredientsReport,
  getLowStockIngredients,
  exportStockReportCSV,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} = require('../controllers/ingredientController');

// GET all ingredients
router.get('/', authenticateToken, getIngredients);

// GET hpp ingredient
router.get(
  '/ingredients/:id/hpp',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  getIngredientHPP
);

// GET history ingredient
router.get(
  '/ingredients/:id/history',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  getIngredientHistory
);

// GET report ingredient
router.get(
  '/ingredients/:id/report',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  getStockReport
);

// GET report all ingredients
router.get(
  '/ingredients/report/all',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  getAllIngredientsReport
);

// GET csv ingredient
router.get(
  '/ingredients/report/export',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  exportStockReportCSV
);

// GET low stock ingredient
router.get(
  '/ingredients/low-stock',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  getLowStockIngredients
);

// POST new ingredient
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  createIngredient
);

// PUT update ingredient
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  updateIngredient
);

// DELETE ingredient
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'gudang'),
  deleteIngredient
);

module.exports = router;
