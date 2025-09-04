const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

describe('Accounts', () => {
  const now = Date.now();
  const uid = Math.floor(Math.random() * 1e6);

  const TEST_USER_EMAIL = `test.accounts.${now}.${uid}@example.com`;
  const TEST_USER_PASS = 'secret123';
  const TEST_CUST_EMAIL = `cust.a.${now}.${uid}@example.com`;

  let token;
  let customerId;
  let accountNumber;

  beforeAll(async () => {
    // Register & login to obtain JWT
    await request(app).post('/api/auth/register')
      .send({ name: 'Test User', email: TEST_USER_EMAIL, password: TEST_USER_PASS });

    const login = await request(app).post('/api/auth/login')
      .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS });

    token = login.body.token;

    // Create a customer
    const cust = await request(app).post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Customer A', email: TEST_CUST_EMAIL, phone: '08030000001' });

    customerId = cust.body.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  test('health works', async () => {
    const r = await request(app).get('/health');
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('ok');
  });

  test('create account', async () => {
    const r = await request(app).post('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ customer_id: customerId, type: 'savings' });

    expect([200, 201]).toContain(r.status);
    expect(r.body).toHaveProperty('account_number');
    expect(r.body.type).toBe('savings');
    expect(r.body.status).toBe('active');

    accountNumber = r.body.account_number;
  });

  test('get account by accountNumber', async () => {
    const r = await request(app).get(`/api/accounts/${accountNumber}`)
      .set('Authorization', `Bearer ${token}`);

    expect(r.status).toBe(200);
    expect(r.body.account_number).toBe(accountNumber);
  });

  test('patch account type', async () => {
    const r = await request(app).patch(`/api/accounts/${accountNumber}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'current' });

    expect(r.status).toBe(200);
    expect(r.body.type).toBe('current');
  });

  test('close account', async () => {
    const r = await request(app).delete(`/api/accounts/${accountNumber}`)
      .set('Authorization', `Bearer ${token}`);

    expect(r.status).toBe(200);
    expect(r.body.status).toBe('closed');
  });
});

