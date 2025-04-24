// controllers/stockInController.js
const pool = require('../db');

// GET all stock_in
const getStockIn = async (req, res) => {
  const { ingredient_name, date_from, date_to } = req.query;
  let query = `
      SELECT stock_in.*, ingredients.name AS ingredient_name
      FROM stock_in
      JOIN ingredients ON stock_in.ingredient_id = ingredients.id
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
    conditions.push(`stock_in.date >= $${counter}`);
    values.push(date_from);
    counter++;
  }

  if (date_to) {
    conditions.push(`stock_in.date <= $${counter}`);
    values.push(date_to);
    counter++;
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY stock_in.date DESC';

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stock in data' });
  }
};

// POST new stock_in
const createStockIn = async (req, res) => {
  const { ingredient_id, quantity, date, unit_price } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO stock_in (ingredient_id, quantity, date, unit_price)
         VALUES ($1, $2, $3, $4) RETURNING *`,
      [ingredient_id, quantity, date, unit_price]
    );

    // Update stock di ingredients
    await pool.query(
      'UPDATE ingredients SET stock = stock + $1 WHERE id = $2',
      [quantity, ingredient_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT update stock_in
const updateStockIn = async (req, res) => {
  const { id } = req.params;
  const { ingredient_id, quantity, date, unit_price } = req.body;
  try {
    // Ambil data lama untuk hitung selisih
    const oldData = await pool.query('SELECT * FROM stock_in WHERE id = $1', [
      id,
    ]);
    if (oldData.rows.length === 0) {
      return res.status(404).json({ error: 'Stock in not found' });
    }

    const oldQty = oldData.rows[0].quantity;
    const delta = quantity - oldQty;

    // Update data di stock_in
    const result = await pool.query(
      `UPDATE stock_in SET ingredient_id = $1, quantity = $2, date = $3, unit_price = $4
         WHERE id = $5 RETURNING *`,
      [ingredient_id, quantity, date, unit_price, id]
    );

    // Update stok sesuai selisih
    await pool.query(
      'UPDATE ingredients SET stock = stock + $1 WHERE id = $2',
      [delta, ingredient_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE stock_in
const deleteStockIn = async (req, res) => {
  const { id } = req.params;
  try {
    // Ambil data stock_in dulu
    const stockIn = await pool.query('SELECT * FROM stock_in WHERE id = $1', [
      id,
    ]);
    if (stockIn.rows.length === 0) {
      return res.status(404).json({ error: 'Stock in not found' });
    }
    const { ingredient_id, quantity } = stockIn.rows[0];

    // Hapus dari stock_in
    await pool.query('DELETE FROM stock_in WHERE id = $1', [id]);

    // Kurangi stok di ingredients
    await pool.query(
      'UPDATE ingredients SET stock = stock - $1 WHERE id = $2',
      [quantity, ingredient_id]
    );

    res.json({ message: 'Stock in deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getStockIn, createStockIn, updateStockIn, deleteStockIn };
