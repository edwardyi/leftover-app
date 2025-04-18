const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../index');

const dataPath = path.join(__dirname, '../mock-data/users.json');
let backup;
let token;

describe('用戶 CRUD API', () => {
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

  let newId;

  it('可以新增用戶', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '測試用戶', email: 'testuser@example.com', password: '123456', isAdmin: false });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('測試用戶');
    newId = res.body.id;
  });

  it('可以更新用戶', async () => {
    const res = await request(app)
      .put(`/api/users/${newId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'updated@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('updated@example.com');
  });

  it('可以刪除用戶', async () => {
    const res = await request(app)
      .delete(`/api/users/${newId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(newId);
  });

  it('查詢不存在用戶應回傳 404', async () => {
    const res = await request(app)
      .get('/api/users/999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
}); 