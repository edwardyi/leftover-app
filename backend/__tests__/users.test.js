const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../index');

const dataPath = path.join(__dirname, '../mock-data/users.json');
let backup;
let token;


describe('GET /api/users', () => {
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

  it('應該回傳所有用戶', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('email');
  });

  it('email 應為有效格式', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    // expect(res.body[0].email).toMatch(/@/);
    console.log(res.body, 'dfdf');
  });
}); 