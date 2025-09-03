const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

describe('Transactions', () => {
  let customerId;
  let srcAccount;
  let dstAccount;

  beforeAll(async () => {
    // Insert (or get) test customer
    const { rows } = await pool.query(
      `INSERT INTO customers (name, email, phone)
       VALUES ('Tx User','tx.user+jest@example.com','08030000123')
       ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name
       RETURNING id`
    );
    customerId = rows[0].id;

    // Create source & destination accounts via API
    const a = await request(app).post('/api/accounts').send({ customer_id: customerId, type: 'savings' });
    const b = await request(app).post('/api/accounts').send({ customer_id: customerId, type: 'current' });

    srcAccount = a.body.account_number;
    dstAccount = b.body.account_number;
  });

  afterAll(async () => {
    await pool.end();
  });

  test('health', async () => {
    const r = await request(app).get('/health');
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('ok');
  });

  test('deposit increases balance', async () => {
    const ref = `jest-dep-${Date.now()}`;
    const r = await request(app)
      .post('/api/transactions/deposit')
      .send({ account_number: srcAccount, amount: 2000, reference: ref });

    expect([200, 201]).toContain(r.status);
    expect(r.body.type).toBe('deposit');
    expect(Number(r.body.amount)).toBeCloseTo(2000);

    // Verify balance via account GET
    const g = await request(app).get(`/api/accounts/${srcAccount}`);
    expect(Number(g.body.balance)).toBeCloseTo(2000);
  });

  test('withdraw decreases balance', async () => {
    const ref = `jest-wd-${Date.now()}`;
    const r = await request(app)
      .post('/api/transactions/withdraw')
      .send({ account_number: srcAccount, amount: 500, reference: ref });

    expect([200, 201]).toContain(r.status);
    expect(r.body.type).toBe('withdrawal');

    const g = await request(app).get(`/api/accounts/${srcAccount}`);
    expect(Number(g.body.balance)).toBeCloseTo(1500);
  });

  test('transfer moves funds between accounts', async () => {
    const ref = `jest-tr-${Date.now()}`;
    const r = await request(app)
      .post('/api/transactions/transfer')
      .send({
        source_account: srcAccount,
        destination_account: dstAccount,
        amount: 300,
        reference: ref
      });

    expect([200, 201]).toContain(r.status);
    expect(r.body.type).toBe('transfer');
    expect(r.body.reference).toContain('-debit');

    // Check balances
    const g1 = await request(app).get(`/api/accounts/${srcAccount}`);
    const g2 = await request(app).get(`/api/accounts/${dstAccount}`);

    expect(Number(g1.body.balance)).toBeCloseTo(1200); // 1500 - 300
    // Destination increased by 300 (started at 0)
    expect(Number(g2.body.balance)).toBeCloseTo(300);
  });

  test('history returns recent transactions', async () => {
    const r = await request(app).get(`/api/transactions/history/${srcAccount}?limit=5&page=1`);
    expect(r.status).toBe(200);
    expect(Array.isArray(r.body)).toBe(true);
    expect(r.body.length).toBeGreaterThan(0);
  });

  test('insufficient funds causes error', async () => {
    const ref = `jest-wd-big-${Date.now()}`;
    const r = await request(app)
      .post('/api/transactions/withdraw')
      .send({ account_number: srcAccount, amount: 999999, reference: ref });

    // Our service throws -> global handler returns 500 with message
    expect(r.status).toBeGreaterThanOrEqual(400);
    expect(r.body).toHaveProperty('message');
    // message may be 'Insufficient funds'
  });
});
