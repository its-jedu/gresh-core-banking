const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: String(process.env.DB_USER || '').trim(),
  password: String(process.env.DB_PASS || '').trim(),
  host: String(process.env.DB_HOST || 'localhost').trim(),
  port: Number(process.env.DB_PORT || 5432),
  database: String(process.env.DB_NAME || '').trim(),
  ssl: false,
});

// Quick sanity log (won't print the password)
console.log('DB cfg →', {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  passType: typeof process.env.DB_PASS,
});

module.exports = { pool };
