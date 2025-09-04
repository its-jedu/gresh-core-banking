const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

describe('Accounts', () => {
  let token;
  let customerId;
  let accountNumber;

  beforeAll(async () => {
    // Register and login a user to get JWT
    await request(app).post('/api/auth/register')
      .send({ name: 'Test User', email: 'test.accounts@example.com', password: 'secret123' });

    const loginRes = await request(app).post('/api/auth/login')
      .send({ email: 'test.accounts@example.com', password: 'secret123' });

    token = loginRes.body.token;

    // Create a test customer
    const custRes = await request(app).post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Customer A', email: 'cust.a@example.com', phone: '08030000001' });

    customerId = custRes.body.id;
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

    expect(r.status).toBe(201);
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
