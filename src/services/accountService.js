const { pool } = require('../config/db');
const genAcctNo = require('../utils/generateAccountNumber');
const accountRepo = require('../repositories/accountRepo');

async function createAccount({ customer_id, type }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const account_number = genAcctNo();
    const acc = await accountRepo.create(client, { customer_id, account_number, type });
    await client.query('COMMIT');
    return acc;
  } catch (e) {
    await client.query('ROLLBACK'); throw e;
  } finally { client.release(); }
}

async function getAccount(account_number) {
  return accountRepo.findByAccountNumber(null, account_number);
}

async function updateAccount({ account_number, type, status }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updated = await accountRepo.updateMeta(client, { account_number, type, status });
    await client.query('COMMIT');
    return updated;
  } catch (e) {
    await client.query('ROLLBACK'); throw e;
  } finally { client.release(); }
}

async function closeAccount(account_number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE accounts SET status='closed' WHERE account_number=$1 RETURNING *`,
      [account_number]
    );
    await client.query('COMMIT');
    return rows[0] || null;
  } catch (e) {
    await client.query('ROLLBACK'); throw e;
  } finally { client.release(); }
}

module.exports = { createAccount, getAccount, updateAccount, closeAccount };
