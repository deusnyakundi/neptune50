const express = require('express');

const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./db'); // Add this if not already present
const routes = require('./routes/index'); 
require('dotenv').config();


console.log('🔍 Attempting database connection...');
db.pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.stack);
    return;
  }

  
  console.log('✅ Database connected successfully');
  console.log(`📦 Database: ${process.env.DB_NAME}`);
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('❌ Query error:', err.stack);
    }
    console.log('⏰ Database timestamp:', result.rows[0].now);
  });
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());



// Basic route for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.use('/api', routes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 