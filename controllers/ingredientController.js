// controllers/ingredientController.js
const pool = require('../db');

// GET all ingredients
const getIngredients = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ingredients');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST new ingredient
const createIngredient = async (req, res) => {
  const { name, unit, stock, min_stock } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ingredients (name, unit, stock, min_stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, unit, stock, min_stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// PUT update ingredient
const updateIngredient = async (req, res) => {
  const { id } = req.params;
  const { name, unit, stock, min_stock } = req.body;
  try {
    const result = await pool.query(
      'UPDATE ingredients SET name = $1, unit = $2, stock = $3, min_stock = $4 WHERE id = $5 RETURNING *',
      [name, unit, stock, min_stock, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE ingredient
const deleteIngredient = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM ingredients WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    res.status(200).json({ message: 'Ingredient deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};
