const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

describe('Accounts', () => {
  let customerId;
  let accountNumber;

  beforeAll(async () => {
    // Ensure a test customer exists
    const { rows } = await pool.query(
      `INSERT INTO customers (name, email, phone)
       VALUES ('Test User','test.user+jest@example.com','08030000099')
       ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name
       RETURNING id`
    );
    customerId = rows[0].id;
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
    const r = await request(app)
      .post('/api/accounts')
      .send({ customer_id: customerId, type: 'savings' });

    expect(r.status).toBe(201);
    expect(r.body).toHaveProperty('account_number');
    expect(r.body.type).toBe('savings');
    expect(r.body.status).toBe('active');

    accountNumber = r.body.account_number;
  });

  test('get account by accountNumber', async () => {
    const r = await request(app).get(`/api/accounts/${accountNumber}`);
    expect(r.status).toBe(200);
    expect(r.body.account_number).toBe(accountNumber);
  });

  test('patch account type', async () => {
    const r = await request(app)
      .patch(`/api/accounts/${accountNumber}`)
      .send({ type: 'current' });
    expect(r.status).toBe(200);
    expect(r.body.type).toBe('current');
  });

  test('close account', async () => {
    const r = await request(app).delete(`/api/accounts/${accountNumber}`);
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('closed');
  });
});
