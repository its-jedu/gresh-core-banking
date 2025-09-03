const request = require('supertest'); const app = require('../src/app');
describe('Transactions', () => {
  it('health', async () => {
    const r = await request(app).get('/health');
    expect(r.status).toBe(200); expect(r.body.status).toBe('ok');
  });
});
