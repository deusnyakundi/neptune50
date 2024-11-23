const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.name,
  password: config.db.password,
  port: config.db.port,
});

// Test and log database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.stack);
    return;
  }
  console.log('✅ Database connected successfully');
  console.log(`📦 Database: ${config.db.name}`);
  console.log(`👤 User: ${config.db.user}`);
  console.log(`🏠 Host: ${config.db.host}:${config.db.port}`);
  
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('❌ Query error:', err.stack);
    }
    console.log('⏰ Database timestamp:', result.rows[0].now);
  });
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool // Export pool for direct access if needed
};