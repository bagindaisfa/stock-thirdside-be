// routes/ingredientRoutes.js
const express = require('express');
const router = express.Router();
const {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} = require('../controllers/ingredientController');

// GET all ingredients
router.get('/', getIngredients);

// POST new ingredient
router.post('/', createIngredient);

// PUT update ingredient
router.put('/:id', updateIngredient);

// DELETE ingredient
router.delete('/:id', deleteIngredient);

module.exports = router;
