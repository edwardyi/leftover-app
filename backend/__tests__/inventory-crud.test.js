const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../index');

const dataPath = path.join(__dirname, '../mock-data/inventory.json');
let backup;
let token;

describe('庫存 CRUD API', () => {
  beforeAll(async () => {
    backup = fs.readFileSync(dataPath, 'utf-8');
    // 登入取得 token
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'admin@example.com', password: '123456' });
    token = res.body.token;
  });
  afterAll(() => {
    fs.writeFileSync(dataPath, backup);
  });

  let testProductId = 999;

  it('可以新增庫存', async () => {
    const res = await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: testProductId, stock: 20 });
    expect(res.statusCode).toBe(201);
    expect(res.body.productId).toBe(testProductId);
    expect(res.body.stock).toBe(20);
  });

  it('可以更新庫存', async () => {
    const res = await request(app)
      .put(`/api/inventory/${testProductId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: 15 });
    expect(res.statusCode).toBe(200);
    expect(res.body.stock).toBe(15);
  });

  it('可以刪除庫存', async () => {
    const res = await request(app)
      .delete(`/api/inventory/${testProductId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.productId).toBe(testProductId);
    // 刪除後再次查詢應不存在
    const check = await request(app)
      .get('/api/inventory');
    expect(check.body.find(i => i.productId === testProductId)).toBeUndefined();
  });

  it('查詢不存在庫存應回傳 404', async () => {
    const res = await request(app)
      .get('/api/inventory/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: 1 });
    expect(res.statusCode).toBe(404);
  });
}); 