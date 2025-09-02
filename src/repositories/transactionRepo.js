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

module.exports = { findByReference, insert };
