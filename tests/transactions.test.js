const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

describe('Transactions', () => {
  const now = Date.now();
  const uid = Math.floor(Math.random() * 1e6);

  const TEST_USER_EMAIL = `tx.user.${now}.${uid}@example.com`;
  const TEST_USER_PASS = 'secret123';
  const TEST_CUST_EMAIL = `cust.b.${now}.${uid}@example.com`;
  const ref = (p) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  let token;
  let customerId;
  let srcAccount;
  let dstAccount;

  beforeAll(async () => {
    // Register & login
    await request(app).post('/api/auth/register')
      .send({ name: 'Tx User', email: TEST_USER_EMAIL, password: TEST_USER_PASS });

    const login = await request(app).post('/api/auth/login')
      .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS });

    token = login.body.token;

    // Create a customer
    const cust = await request(app).post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Customer B', email: TEST_CUST_EMAIL, phone: '08030000002' });

    customerId = cust.body.id;

    // Create two accounts
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
    const r = await request(app).post('/api/transactions/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send({ account_number: srcAccount, amount: 2000, reference: ref('dep') });

    expect([200, 201]).toContain(r.status);
    expect(r.body.type).toBe('deposit');
  });

  test('withdraw decreases balance', async () => {
    const r = await request(app).post('/api/transactions/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send({ account_number: srcAccount, amount: 500, reference: ref('wd') });

    expect([200, 201]).toContain(r.status);
    expect(r.body.type).toBe('withdrawal');
  });

  test('transfer moves funds between accounts', async () => {
    const r = await request(app).post('/api/transactions/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        source_account: srcAccount,
        destination_account: dstAccount,
        amount: 300,
        reference: ref('tr')
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
});

