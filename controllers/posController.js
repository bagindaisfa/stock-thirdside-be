const pool = require('../db');

const createSale = async (req, res) => {
  const client = await pool.connect();
  try {
    const { sale_date, item_name, quantity, total_price, ingredients } =
      req.body;
    await client.query('BEGIN');

    const saleResult = await client.query(
      `INSERT INTO pos_sales (sale_date, item_name, quantity, total_price)
         VALUES ($1, $2, $3, $4) RETURNING id`,
      [sale_date, item_name, quantity, total_price]
    );

    const saleId = saleResult.rows[0].id;

    for (const ing of ingredients) {
      const usedQtyTotal = ing.used_quantity * quantity;

      await client.query(
        `INSERT INTO pos_sale_ingredients (pos_sale_id, ingredient_id, used_quantity)
           VALUES ($1, $2, $3)`,
        [saleId, ing.ingredient_id, usedQtyTotal]
      );

      await client.query(
        `UPDATE ingredients SET stock = stock - $1 WHERE id = $2`,
        [usedQtyTotal, ing.ingredient_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Sale recorded and stock updated.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Failed to process sale.' });
  } finally {
    client.release();
  }
};

module.exports = { createSale };
