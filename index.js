const express = require('express');
const dotenv = require('dotenv');
const ingredientRoutes = require('./routes/ingredientRoutes');
const stockInRoutes = require('./routes/stockInRoutes');
const stockUsageRoutes = require('./routes/stockUsageRoutes');
const authRoutes = require('./routes/authRoutes');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json()); // to parse JSON bodies

// Use routes

app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/stock_in', stockInRoutes);
app.use('/api/stock_usage', stockUsageRoutes);

app
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  })
  .on('error', (err) => {
    console.error('Server Error:', err);
  });
