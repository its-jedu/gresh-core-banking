const { pool } = require('../config/db');

exports.create = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO customers (name, email, phone)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [name, email, phone]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
};

exports.list = async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM customers ORDER BY created_at DESC`);
    res.json(rows);
  } catch (e) { next(e); }
};
