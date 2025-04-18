const request = require('supertest');
const app = require('../index');

describe('GET /api/inventory', () => {
  it('應該回傳所有商品庫存', async () => {
    const res = await request(app).get('/api/inventory');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('productId');
    expect(res.body[0]).toHaveProperty('stock');
  });

  it('庫存數量應為數字', async () => {
    const res = await request(app).get('/api/inventory');
    expect(typeof res.body[0].stock).toBe('number');
  });
}); 