const { pool } = require('../config/db');

async function findByReference(clientOrPool, reference) {
  const db = clientOrPool || pool;
  const { rows } = await db.query('SELECT * FROM transactions WHERE reference=$1', [reference]);
  return rows[0] || null;
}

async function insert(client, tx) {
  const { rows } = await client.query(
    `INSERT INTO transactions
     (type, account_id, counterparty_account_id, amount, balance_before, balance_after, reference, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      tx.type, tx.account_id, tx.counterparty_account_id || null, tx.amount,
      tx.balance_before, tx.balance_after, tx.reference, tx.metadata || null
    ]
  );
  return rows[0];
}

async function findByAccount(clientOrPool, accountNumber, { page = 1, limit = 10, startDate, endDate }) {
  const db = clientOrPool || pool;

  const offset = (page - 1) * limit;
  const params = [accountNumber];
  let where = `a.account_number=$1`;

  if (startDate) {
    params.push(startDate);
    where += ` AND t.created_at >= $${params.length}`;
  }
  if (endDate) {
    params.push(endDate);
    where += ` AND t.created_at <= $${params.length}`;
  }

  params.push(limit, offset);

  const { rows } = await db.query(
    `SELECT t.*
     FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     WHERE ${where}
     ORDER BY t.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}


module.exports = { findByReference, insert, findByAccount };
