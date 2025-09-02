const { pool } = require('../config/db');

async function findByAccountNumber(clientOrPool, accountNumber) {
  const db = clientOrPool || pool;
  const { rows } = await db.query('SELECT * FROM accounts WHERE account_number=$1', [accountNumber]);
  return rows[0] || null;
}

async function create(client, { customer_id, account_number, type }) {
  const { rows } = await client.query(
    `INSERT INTO accounts (customer_id, account_number, type)
     VALUES ($1,$2,$3) RETURNING *`,
    [customer_id, account_number, type]
  );
  return rows[0];
}

async function updateMeta(client, { account_number, type, status }) {
  const fields = []; const values = []; let i = 1;
  if (type)   { fields.push(`type=$${i++}`);   values.push(type); }
  if (status) { fields.push(`status=$${i++}`); values.push(status); }
  values.push(account_number);
  const { rows } = await client.query(
    `UPDATE accounts SET ${fields.join(', ')} WHERE account_number=$${i} RETURNING *`,
    values
  );
  return rows[0] || null;
}

module.exports = { findByAccountNumber, create, updateMeta };
