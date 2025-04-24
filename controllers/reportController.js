const pool = require('../db');
const { stringify } = require('fast-csv');
const PDFDocument = require('pdfkit');

const getStockSummaryReport = async (req, res) => {
  const { date_from, date_to } = req.query;

  if (!date_from || !date_to) {
    return res
      .status(400)
      .json({ error: 'date_from and date_to are required' });
  }

  const query = `
      SELECT 
        i.id AS ingredient_id,
        i.name AS ingredient_name,
        COALESCE(SUM(si.quantity), 0) AS stock_in,
        COALESCE(SUM(su.quantity), 0) AS stock_usage,
        (COALESCE(SUM(si.quantity), 0) - COALESCE(SUM(su.quantity), 0)) AS final_stock
      FROM ingredients i
      LEFT JOIN stock_in si 
        ON si.ingredient_id = i.id AND si.date BETWEEN $1 AND $2
      LEFT JOIN stock_usage su 
        ON su.ingredient_id = i.id AND su.date BETWEEN $1 AND $2
      GROUP BY i.id, i.name
      ORDER BY i.name ASC
    `;

  try {
    const result = await pool.query(query, [date_from, date_to]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stock summary' });
  }
};

const exportStockSummaryCSV = async (req, res) => {
  const { date_from, date_to } = req.query;

  if (!date_from || !date_to) {
    return res
      .status(400)
      .json({ error: 'date_from and date_to are required' });
  }

  const query = `
      SELECT 
        i.id AS ingredient_id,
        i.name AS ingredient_name,
        COALESCE(SUM(si.quantity), 0) AS stock_in,
        COALESCE(SUM(su.quantity), 0) AS stock_usage,
        (COALESCE(SUM(si.quantity), 0) - COALESCE(SUM(su.quantity), 0)) AS final_stock
      FROM ingredients i
      LEFT JOIN stock_in si 
        ON si.ingredient_id = i.id AND si.date BETWEEN $1 AND $2
      LEFT JOIN stock_usage su 
        ON su.ingredient_id = i.id AND su.date BETWEEN $1 AND $2
      GROUP BY i.id, i.name
      ORDER BY i.name ASC
    `;

  try {
    const result = await pool.query(query, [date_from, date_to]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=stock_summary_${date_from}_to_${date_to}.csv`
    );

    stringify(result.rows, { header: true }).pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export CSV' });
  }
};

const exportStockSummaryPDF = async (req, res) => {
  const { date_from, date_to } = req.query;

  if (!date_from || !date_to) {
    return res
      .status(400)
      .json({ error: 'date_from and date_to are required' });
  }

  const query = `
      SELECT 
        i.id AS ingredient_id,
        i.name AS ingredient_name,
        COALESCE(SUM(si.quantity), 0) AS stock_in,
        COALESCE(SUM(su.quantity), 0) AS stock_usage,
        (COALESCE(SUM(si.quantity), 0) - COALESCE(SUM(su.quantity), 0)) AS final_stock
      FROM ingredients i
      LEFT JOIN stock_in si 
        ON si.ingredient_id = i.id AND si.date BETWEEN $1 AND $2
      LEFT JOIN stock_usage su 
        ON su.ingredient_id = i.id AND su.date BETWEEN $1 AND $2
      GROUP BY i.id, i.name
      ORDER BY i.name ASC
    `;

  try {
    const result = await pool.query(query, [date_from, date_to]);
    const data = result.rows;

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=stock_summary_${date_from}_to_${date_to}.pdf`
    );
    doc.pipe(res);

    doc.fontSize(18).text('Stock Summary Report', { align: 'center' });
    doc.fontSize(12).text(`Periode: ${date_from} s.d ${date_to}\n\n`);

    // Table header
    doc.font('Helvetica-Bold');
    doc
      .text('ID', 50)
      .text('Name', 100)
      .text('In', 250)
      .text('Used', 300)
      .text('Final', 350);

    doc.font('Helvetica');
    data.forEach((item) => {
      doc
        .text(item.ingredient_id, 50)
        .text(item.ingredient_name, 100)
        .text(item.stock_in.toString(), 250)
        .text(item.stock_usage.toString(), 300)
        .text(item.final_stock.toString(), 350)
        .moveDown();
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to export PDF' });
  }
};

module.exports = {
  getStockSummaryReport,
  exportStockSummaryCSV,
  exportStockSummaryPDF,
};
