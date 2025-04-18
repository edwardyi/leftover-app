const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../index');

const dataPath = path.join(__dirname, '../mock-data/products.json');
let backup;
let token;

describe('商品 CRUD API', () => {
  beforeAll(async () => {
    // 備份原始資料
    backup = fs.readFileSync(dataPath, 'utf-8');
    // 登入取得 token
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'admin@example.com', password: '123456' });
    token = res.body.token;
  });
  afterAll(() => {
    // 還原原始資料
    fs.writeFileSync(dataPath, backup);
  });

  let newId;

  it('可以新增商品', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '測試商品', price: 99, category: '測試', latitude: 25, longitude: 121, svgUrl: '', distance: 1 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('測試商品');
    newId = res.body.id;
  });

  it('可以更新商品', async () => {
    const res = await request(app)
      .put(`/api/products/${newId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 88 });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(88);
  });

  it('可以刪除商品', async () => {
    const res = await request(app)
      .delete(`/api/products/${newId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(newId);
    // 刪除後再次查詢應不存在
    const check = await request(app)
      .get(`/api/products/${newId}`);
    expect(check.body.error).toBe('Not found');
  });

  it('查詢不存在商品應回傳 404', async () => {
    const res = await request(app)
      .get('/api/products/999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
}); 