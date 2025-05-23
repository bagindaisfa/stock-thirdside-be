const express = require('express');
const dotenv = require('dotenv');
const ingredientRoutes = require('./routes/ingredientRoutes');
const stockInRoutes = require('./routes/stockInRoutes');
const stockUsageRoutes = require('./routes/stockUsageRoutes');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const unitRoutes = require('./routes/unitRoutes');
const posRoutes = require('./routes/posRoutes');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json()); // to parse JSON bodies

// Use routes

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stock_in', stockInRoutes);
app.use('/api/stock_usage', stockUsageRoutes);
app.use('/api/units', unitRoutes);

app
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  })
  .on('error', (err) => {
    console.error('Server Error:', err);
  });
