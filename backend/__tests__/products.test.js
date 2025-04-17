const request = require('supertest');
const app = require('../index');

describe('GET /api/products', () => {
  it('應回傳 products 陣列', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
}); 