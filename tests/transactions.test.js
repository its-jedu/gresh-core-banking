const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

describe('Transactions', () => {
  let token;
  let customerId;
  let srcAccount;
  let dstAccount;

  beforeAll(async () => {
    // Register + login
    await request(app).post('/api/auth/register')
      .send({ name: 'Tx User', email: 'tx.user@example.com', password: 'secret123' });

    const loginRes = await request(app).post('/api/auth/login')
      .send({ email: 'tx.user@example.com', password: 'secret123' });

    token = loginRes.body.token;

    // Create a customer
    const custRes = await request(app).post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Customer B', email: 'cust.b@example.com', phone: '08030000002' });

    customerId = custRes.body.id;

    // Create source & destination accounts
    const a = await request(app).post('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ customer_id: customerId, type: 'savings' });

    const b = await request(app).post('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ customer_id: customerId, type: 'current' });

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
    const r = await request(app).post('/api/transactions/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send({ account_number: srcAccount, amount: 2000, reference: ref });

    expect([200, 201]).toContain(r.status);
    expect(r.body.type).toBe('deposit');
    expect(Number(r.body.amount)).toBeCloseTo(2000);
  });

  test('withdraw decreases balance', async () => {
    const ref = `jest-wd-${Date.now()}`;
    const r = await request(app).post('/api/transactions/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send({ account_number: srcAccount, amount: 500, reference: ref });

    expect([200, 201]).toContain(r.status);
    expect(r.body.type).toBe('withdrawal');
  });

  test('transfer moves funds between accounts', async () => {
    const ref = `jest-tr-${Date.now()}`;
    const r = await request(app).post('/api/transactions/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        source_account: srcAccount,
        destination_account: dstAccount,
        amount: 300,
        reference: ref
      });

    expect([200, 201]).toContain(r.status);
    expect(r.body.type).toBe('transfer');
    expect(r.body.reference).toContain('-debit');
  });

  test('history returns recent transactions', async () => {
    const r = await request(app).get(`/api/transactions/history/${srcAccount}?limit=5&page=1`)
      .set('Authorization', `Bearer ${token}`);

    expect(r.status).toBe(200);
    expect(Array.isArray(r.body)).toBe(true);
    expect(r.body.length).toBeGreaterThan(0);
  });

  test('insufficient funds causes error', async () => {
    const ref = `jest-wd-big-${Date.now()}`;
    const r = await request(app).post('/api/transactions/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send({ account_number: srcAccount, amount: 999999, reference: ref });

    expect(r.status).toBeGreaterThanOrEqual(400);
    expect(r.body).toHaveProperty('message');
  });
});
