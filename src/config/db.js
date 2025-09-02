const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Optional: test DB connection
pool.connect()
  .then(client => {
    console.log('✅ Connected to database');
    client.release();
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });

module.exports = { pool };
