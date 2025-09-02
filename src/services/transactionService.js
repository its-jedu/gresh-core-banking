const { pool } = require('../config/db');
const accountRepo = require('../repositories/accountRepo');
const txRepo = require('../repositories/transactionRepo');

/** Helper: lock account row and return it */
async function lockAccount(client, account_number) {
  const { rows } = await client.query(
    `SELECT * FROM accounts WHERE account_number=$1 FOR UPDATE`,
    [account_number]
  );
  return rows[0] || null;
}

async function deposit({ account_number, amount, reference }) {
  const client = await pool.connect();
  try {
    // idempotency
    const existing = await txRepo.findByReference(client, reference);
    if (existing) return { idempotent: true, tx: existing };

    await client.query('BEGIN');

    const acc = await lockAccount(client, account_number);
    if (!acc) throw new Error('Account not found');
    if (acc.status !== 'active') throw new Error('Account not active');

    const before = acc.balance;
    const after  = (Number(before) + Number(amount)).toFixed(2);

    await client.query('UPDATE accounts SET balance=$1 WHERE id=$2', [after, acc.id]);

    const tx = await txRepo.insert(client, {
      type: 'deposit', account_id: acc.id, amount,
      balance_before: before, balance_after: after,
      reference, metadata: {}
    });

    await client.query('COMMIT');
    return { tx };
  } catch (e) {
    await client.query('ROLLBACK'); throw e;
  } finally { client.release(); }
}

async function withdraw({ account_number, amount, reference }) {
  const client = await pool.connect();
  try {
    const existing = await txRepo.findByReference(client, reference);
    if (existing) return { idempotent: true, tx: existing };

    await client.query('BEGIN');

    const acc = await lockAccount(client, account_number);
    if (!acc) throw new Error('Account not found');
    if (acc.status !== 'active') throw new Error('Account not active');

    const before = acc.balance;
    if (Number(before) < Number(amount)) throw new Error('Insufficient funds');

    const after  = (Number(before) - Number(amount)).toFixed(2);
    await client.query('UPDATE accounts SET balance=$1 WHERE id=$2', [after, acc.id]);

    const tx = await txRepo.insert(client, {
      type: 'withdrawal', account_id: acc.id, amount,
      balance_before: before, balance_after: after,
      reference, metadata: {}
    });

    await client.query('COMMIT');
    return { tx };
  } catch (e) {
    await client.query('ROLLBACK'); throw e;
  } finally { client.release(); }
}

async function transfer({ source_account, destination_account, amount, reference }) {
  const client = await pool.connect();
  try {
    const existing = await txRepo.findByReference(client, reference);
    if (existing) return { idempotent: true, tx: existing };

    await client.query('BEGIN');

    // Lock accounts in stable order to avoid deadlocks
    const [a, b] = source_account < destination_account
      ? [source_account, destination_account] : [destination_account, source_account];

    const first  = await lockAccount(client, a);
    const second = await lockAccount(client, b);

    const src = first.account_number === source_account ? first : second;
    const dst = first.account_number === source_account ? second : first;

    if (!src || !dst) throw new Error('Account(s) not found');
    if (src.status !== 'active' || dst.status !== 'active') throw new Error('Account not active');

    if (Number(src.balance) < Number(amount)) throw new Error('Insufficient funds');

    const srcBefore = src.balance;
    const srcAfter  = (Number(src.balance) - Number(amount)).toFixed(2);
    const dstBefore = dst.balance;
    const dstAfter  = (Number(dst.balance) + Number(amount)).toFixed(2);

    await client.query('UPDATE accounts SET balance=$1 WHERE id=$2', [srcAfter, src.id]);
    await client.query('UPDATE accounts SET balance=$1 WHERE id=$2', [dstAfter, dst.id]);

    // Record both sides
    const outTx = await txRepo.insert(client, {
      type: 'transfer', account_id: src.id, counterparty_account_id: dst.id,
      amount, balance_before: srcBefore, balance_after: srcAfter,
      reference: reference + '-debit', metadata: { direction: 'debit' }
    });
    await txRepo.insert(client, {
      type: 'transfer', account_id: dst.id, counterparty_account_id: src.id,
      amount, balance_before: dstBefore, balance_after: dstAfter,
      reference: reference + '-credit', metadata: { direction: 'credit' }
    });

    await client.query('COMMIT');
    return { tx: outTx };
  } catch (e) {
    await client.query('ROLLBACK'); throw e;
  } finally { client.release(); }
}

async function history(account_number, filters = {}) {
  return txRepo.findByAccount(null, account_number, filters);
}

module.exports = { deposit, withdraw, transfer, history };
