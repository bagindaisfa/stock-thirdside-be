// controllers/stockUsageController.js
const pool = require('../db');

// GET all stock_usage
const getStockUsage = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stock_usage');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST new stock_usage
const createStockUsage = async (req, res) => {
  const { ingredient_id, quantity, date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO stock_usage (ingredient_id, quantity, date) VALUES ($1, $2, $3) RETURNING *',
      [ingredient_id, quantity, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// PUT update stock_usage
const updateStockUsage = async (req, res) => {
  const { id } = req.params;
  const { ingredient_id, quantity, date } = req.body;
  try {
    const result = await pool.query(
      'UPDATE stock_usage SET ingredient_id = $1, quantity = $2, date = $3 WHERE id = $4 RETURNING *',
      [ingredient_id, quantity, date, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Stock Usage not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE stock_usage
const deleteStockUsage = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM stock_usage WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Stock Usage not found' });
    }
    res.status(200).json({ message: 'Stock Usage deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getStockUsage,
  createStockUsage,
  updateStockUsage,
  deleteStockUsage,
};
