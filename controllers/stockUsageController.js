// controllers/stockUsageController.js
const pool = require('../db');

// GET all stock_usage
const getStockUsage = async (req, res) => {
  const { ingredient_name, date_from, date_to } = req.query;
  let query = `
      SELECT stock_usage.*, ingredients.name AS ingredient_name
      FROM stock_usage
      JOIN ingredients ON stock_usage.ingredient_id = ingredients.id
    `;
  let conditions = [];
  let values = [];
  let counter = 1;

  if (ingredient_name) {
    conditions.push(`ingredients.name ILIKE $${counter}`);
    values.push(`%${ingredient_name}%`);
    counter++;
  }

  if (date_from) {
    conditions.push(`stock_usage.date >= $${counter}`);
    values.push(date_from);
    counter++;
  }

  if (date_to) {
    conditions.push(`stock_usage.date <= $${counter}`);
    values.push(date_to);
    counter++;
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY stock_usage.date DESC';

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stock usage data' });
  }
};

// POST new stock_usage
const createStockUsage = async (req, res) => {
  const { ingredient_id, quantity, date, note } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO stock_usage (ingredient_id, quantity, date, note) VALUES ($1, $2, $3, $4) RETURNING *',
      [ingredient_id, quantity, date, note]
    );

    // Kurangi stok di ingredients
    await pool.query(
      'UPDATE ingredients SET stock = stock - $1 WHERE id = $2',
      [quantity, ingredient_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT update stock_usage
const updateStockUsage = async (req, res) => {
  const { id } = req.params;
  const { ingredient_id, quantity, date, note } = req.body;
  try {
    // Ambil data lama untuk hitung selisih
    const oldData = await pool.query(
      'SELECT * FROM stock_usage WHERE id = $1',
      [id]
    );
    if (oldData.rows.length === 0) {
      return res.status(404).json({ error: 'Stock usage not found' });
    }

    const oldQty = oldData.rows[0].quantity;
    const delta = quantity - oldQty;

    // Update data di stock_usage
    const result = await pool.query(
      'UPDATE stock_usage SET ingredient_id = $1, quantity = $2, date = $3, note = $4 WHERE id = $5 RETURNING *',
      [ingredient_id, quantity, date, note, id]
    );

    // Update stok sesuai selisih (karena usage, maka dikurangkan)
    await pool.query(
      'UPDATE ingredients SET stock = stock - $1 WHERE id = $2',
      [delta, ingredient_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE stock_usage
const deleteStockUsage = async (req, res) => {
  const { id } = req.params;
  try {
    const usage = await pool.query('SELECT * FROM stock_usage WHERE id = $1', [
      id,
    ]);
    if (usage.rows.length === 0) {
      return res.status(404).json({ error: 'Stock usage not found' });
    }
    const { ingredient_id, quantity } = usage.rows[0];

    await pool.query('DELETE FROM stock_usage WHERE id = $1', [id]);

    // Kembalikan stok
    await pool.query(
      'UPDATE ingredients SET stock = stock + $1 WHERE id = $2',
      [quantity, ingredient_id]
    );

    res.json({ message: 'Stock usage deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getStockUsage,
  createStockUsage,
  updateStockUsage,
  deleteStockUsage,
};
