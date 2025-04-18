const request = require('supertest');
const app = require('../index');

describe('GET /api/users', () => {
  it('應該回傳所有用戶', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('email');
  });

  it('email 應為有效格式', async () => {
    const res = await request(app).get('/api/users');
    expect(res.body[0].email).toMatch(/@/);
  });
}); 