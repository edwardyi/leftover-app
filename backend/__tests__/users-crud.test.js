const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../index');

const dataPath = path.join(__dirname, '../mock-data/users.json');
let backup;

describe('用戶 CRUD API', () => {
  beforeAll(() => {
    backup = fs.readFileSync(dataPath, 'utf-8');
  });
  afterAll(() => {
    fs.writeFileSync(dataPath, backup);
  });

  let newId;

  it('可以新增用戶', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: '測試用戶', email: 'testuser@example.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('測試用戶');
    newId = res.body.id;
  });

  it('可以更新用戶', async () => {
    const res = await request(app)
      .put(`/api/users/${newId}`)
      .send({ email: 'updated@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('updated@example.com');
  });

  it('可以刪除用戶', async () => {
    const res = await request(app)
      .delete(`/api/users/${newId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(newId);
  });

  it('查詢不存在用戶應回傳 404', async () => {
    const res = await request(app).put('/api/users/999999').send({ name: 'no' });
    expect(res.statusCode).toBe(404);
  });
}); 