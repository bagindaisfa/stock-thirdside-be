const pool = require('../config/db');

// Ambil semua satuan
const getUnits = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM units ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch units' });
  }
};

// Tambah satuan
const addUnit = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO units (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add unit' });
  }
};

// Update satuan
const updateUnit = async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE units SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update unit' });
  }
};

// Hapus satuan
const deleteUnit = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM units WHERE id = $1', [id]);
    res.json({ message: 'Unit deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete unit' });
  }
};

module.exports = {
  getUnits,
  addUnit,
  updateUnit,
  deleteUnit,
};
