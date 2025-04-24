// controllers/stockInController.js
const pool = require('../db');

// GET all stock_in
const getStockIn = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stock_in');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST new stock_in
const createStockIn = async (req, res) => {
  const { ingredient_id, quantity, date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO stock_in (ingredient_id, quantity, date) VALUES ($1, $2, $3) RETURNING *',
      [ingredient_id, quantity, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// PUT update stock_in
const updateStockIn = async (req, res) => {
  const { id } = req.params;
  const { ingredient_id, quantity, date } = req.body;
  try {
    const result = await pool.query(
      'UPDATE stock_in SET ingredient_id = $1, quantity = $2, date = $3 WHERE id = $4 RETURNING *',
      [ingredient_id, quantity, date, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Stock In not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE stock_in
const deleteStockIn = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM stock_in WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Stock In not found' });
    }
    res.status(200).json({ message: 'Stock In deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { getStockIn, createStockIn, updateStockIn, deleteStockIn };
