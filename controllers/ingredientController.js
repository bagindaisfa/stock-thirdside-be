// controllers/ingredientController.js
const pool = require('../db');
const { Parser } = require('json2csv');
const fs = require('fs');

// GET all ingredients
const getIngredients = async (req, res) => {
  const { search } = req.query;
  try {
    let query = `
        SELECT 
          i.*, 
          c.name AS category_name,
          u.name AS unit_name
        FROM ingredients i
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN units u ON i.unit_id = u.id
      `;
    let values = [];

    if (search) {
      query += ' WHERE i.name ILIKE $1';
      values.push(`%${search}%`);
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
};

const getIngredientHPP = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await pool.query(
      `SELECT quantity, unit_price FROM stock_in WHERE ingredient_id = $1 AND unit_price IS NOT NULL`,
      [id]
    );

    if (data.rows.length === 0) {
      return res.json({ hpp: 0 });
    }

    const totalCost = data.rows.reduce(
      (acc, row) => acc + row.quantity * row.unit_price,
      0
    );
    const totalQty = data.rows.reduce((acc, row) => acc + row.quantity, 0);

    const hpp = totalQty === 0 ? 0 : totalCost / totalQty;

    res.json({ hpp: parseFloat(hpp.toFixed(2)) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getIngredientHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
        SELECT 'in' AS type, quantity, date, unit_price
        FROM stock_in
        WHERE ingredient_id = $1
  
        UNION ALL
  
        SELECT 'out' AS type, quantity, date, NULL AS unit_price
        FROM stock_usage
        WHERE ingredient_id = $1
  
        ORDER BY date ASC
      `,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getStockReport = async (req, res) => {
  const { id } = req.params;
  const { start, end } = req.query;

  try {
    const ingredientResult = await pool.query(
      `SELECT i.name, u.name AS unit FROM ingredients i JOIN units u ON i.unit_id = u.id WHERE i.id = $1`,
      [id]
    );

    if (ingredientResult.rowCount === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    const { name, unit } = ingredientResult.rows[0];

    const opening = await pool.query(
      `
        SELECT 
          COALESCE((
            SELECT SUM(quantity) FROM stock_in 
            WHERE ingredient_id = $1 AND date < $2
          ), 0) 
          - 
          COALESCE((
            SELECT SUM(quantity) FROM stock_usage 
            WHERE ingredient_id = $1 AND date < $2
          ), 0) AS opening_stock
      `,
      [id, start]
    );

    const stockIn = await pool.query(
      `
        SELECT COALESCE(SUM(quantity), 0) AS stock_in
        FROM stock_in
        WHERE ingredient_id = $1 AND date BETWEEN $2 AND $3
      `,
      [id, start, end]
    );

    const stockOut = await pool.query(
      `
        SELECT COALESCE(SUM(quantity), 0) AS stock_out
        FROM stock_usage
        WHERE ingredient_id = $1 AND date BETWEEN $2 AND $3
      `,
      [id, start, end]
    );

    const openingStock = parseInt(opening.rows[0].opening_stock);
    const stockInQty = parseInt(stockIn.rows[0].stock_in);
    const stockOutQty = parseInt(stockOut.rows[0].stock_out);
    const closingStock = openingStock + stockInQty - stockOutQty;

    res.json({
      ingredient_id: parseInt(id),
      ingredient_name: name,
      unit,
      start_date: start,
      end_date: end,
      opening_stock: openingStock,
      stock_in: stockInQty,
      stock_out: stockOutQty,
      closing_stock: closingStock,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllIngredientsReport = async (req, res) => {
  const { start, end } = req.query;

  try {
    const result = await pool.query(
      `
        SELECT i.id AS ingredient_id, i.name AS ingredient_name, u.name AS unit,
          COALESCE((
            SELECT SUM(quantity) FROM stock_in 
            WHERE ingredient_id = i.id AND date BETWEEN $1 AND $2
          ), 0) AS stock_in,
          COALESCE((
            SELECT SUM(quantity) FROM stock_usage 
            WHERE ingredient_id = i.id AND date BETWEEN $1 AND $2
          ), 0) AS stock_out,
          COALESCE((
            SELECT SUM(quantity) FROM stock_in 
            WHERE ingredient_id = i.id AND date < $1
          ), 0) 
          - 
          COALESCE((
            SELECT SUM(quantity) FROM stock_usage 
            WHERE ingredient_id = i.id AND date < $1
          ), 0) AS opening_stock
        FROM ingredients i
        JOIN units u ON i.unit_id = u.id
      `,
      [start, end]
    );

    const data = result.rows.map((row) => {
      const closingStock = row.opening_stock + row.stock_in - row.stock_out;
      return {
        ingredient_id: row.ingredient_id,
        ingredient_name: row.ingredient_name,
        unit: row.unit,
        start_date: start,
        end_date: end,
        opening_stock: row.opening_stock,
        stock_in: row.stock_in,
        stock_out: row.stock_out,
        closing_stock: closingStock,
      };
    });

    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const exportStockReportCSV = async (req, res) => {
  const { start, end } = req.query;

  try {
    const result = await pool.query(
      `
        SELECT i.id AS ingredient_id, i.name AS ingredient_name, u.name AS unit,
          COALESCE((
            SELECT SUM(quantity) FROM stock_in 
            WHERE ingredient_id = i.id AND date BETWEEN $1 AND $2
          ), 0) AS stock_in,
          COALESCE((
            SELECT SUM(quantity) FROM stock_usage 
            WHERE ingredient_id = i.id AND date BETWEEN $1 AND $2
          ), 0) AS stock_out,
          COALESCE((
            SELECT SUM(quantity) FROM stock_in 
            WHERE ingredient_id = i.id AND date < $1
          ), 0) 
          - 
          COALESCE((
            SELECT SUM(quantity) FROM stock_usage 
            WHERE ingredient_id = i.id AND date < $1
          ), 0) AS opening_stock
        FROM ingredients i
        JOIN units u ON i.unit_id = u.id
      `,
      [start, end]
    );

    const data = result.rows.map((row) => {
      const closingStock = row.opening_stock + row.stock_in - row.stock_out;
      return {
        ingredient_id: row.ingredient_id,
        ingredient_name: row.ingredient_name,
        unit: row.unit,
        start_date: start,
        end_date: end,
        opening_stock: row.opening_stock,
        stock_in: row.stock_in,
        stock_out: row.stock_out,
        closing_stock: closingStock,
      };
    });

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('stock_report.csv');
    res.send(csv);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST new ingredient
const createIngredient = async (req, res) => {
  const { name, unit_id, category_id, stock, min_stock } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ingredients (name, unit_id, category_id, stock, min_stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, unit_id, category_id, stock, min_stock]
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
  const { name, unit_id, category_id, stock, min_stock } = req.body;
  try {
    const result = await pool.query(
      'UPDATE ingredients SET name = $1, unit_id = $2, category_id = $3, stock = $4, min_stock = $5 WHERE id = $6 RETURNING *',
      [name, unit_id, category_id, stock, min_stock, id]
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
  getIngredientHPP,
  getIngredientHistory,
  getStockReport,
  getAllIngredientsReport,
  exportStockReportCSV,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};
