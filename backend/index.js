const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/products', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'products.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  let products = data.products;

  // 取得查詢參數
  const { distance, price, category, lat, lng } = req.query;

  // 距離過濾
  if (distance && lat && lng) {
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    products = products.filter(p => getDistance(Number(lat), Number(lng), p.latitude, p.longitude) <= Number(distance));
  }

  // 價格過濾
  if (price) {
    products = products.filter(p => p.price <= Number(price));
  }

  // 類別過濾
  if (category) {
    products = products.filter(p => p.category === category);
  }

  res.json(products);
});

app.get('/api/i18n', (req, res) => {
  const results = [];
  fs.createReadStream(path.join(__dirname, 'mock-data', 'locales.csv'))
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // 轉換成 i18n 格式
      const i18nJson = { zhTW: { translation: {} }, zhCN: { translation: {} }, en: { translation: {} } };
      results.forEach(row => {
        i18nJson.zhTW.translation[row.key] = row.zhTW;
        i18nJson.zhCN.translation[row.key] = row.zhCN;
        i18nJson.en.translation[row.key] = row.en;
      });
      res.json(i18nJson);
    });
});

// 新增取得單一商品 API
app.get('/api/products/:id', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'products.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const product = data.products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

app.get('/api/locations', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'locations.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  res.json(data.locations);
});

// 新增商品
app.post('/api/products', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'products.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const products = data.products;
  const newProduct = req.body;
  newProduct.id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  products.push(newProduct);
  fs.writeFileSync(dataPath, JSON.stringify({ products }, null, 2));
  res.status(201).json(newProduct);
});

// 更新商品
app.put('/api/products/:id', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'products.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const products = data.products;
  const idx = products.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updated = { ...products[idx], ...req.body, id: products[idx].id };
  products[idx] = updated;
  fs.writeFileSync(dataPath, JSON.stringify({ products }, null, 2));
  res.json(updated);
});

// 刪除商品
app.delete('/api/products/:id', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'products.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  let products = data.products;
  const idx = products.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = products[idx];
  products.splice(idx, 1);
  fs.writeFileSync(dataPath, JSON.stringify({ products }, null, 2));
  res.json(deleted);
});

// 新增商品庫存
app.post('/api/inventory', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'inventory.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const inventory = data.inventory;
  const newItem = req.body;
  newItem.productId = Number(newItem.productId);
  newItem.stock = Number(newItem.stock);
  if (inventory.find(i => i.productId === newItem.productId)) {
    return res.status(400).json({ error: 'productId already exists' });
  }
  inventory.push(newItem);
  fs.writeFileSync(dataPath, JSON.stringify({ inventory }, null, 2));
  res.status(201).json(newItem);
});

// 更新商品庫存
app.put('/api/inventory/:productId', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'inventory.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const inventory = data.inventory;
  const idx = inventory.findIndex(i => i.productId === Number(req.params.productId));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updated = { ...inventory[idx], ...req.body, productId: inventory[idx].productId };
  updated.stock = Number(updated.stock);
  inventory[idx] = updated;
  fs.writeFileSync(dataPath, JSON.stringify({ inventory }, null, 2));
  res.json(updated);
});

// 刪除商品庫存
app.delete('/api/inventory/:productId', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'inventory.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  let inventory = data.inventory;
  const idx = inventory.findIndex(i => i.productId === Number(req.params.productId));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = inventory[idx];
  inventory.splice(idx, 1);
  fs.writeFileSync(dataPath, JSON.stringify({ inventory }, null, 2));
  res.json(deleted);
});

// 新增用戶
app.post('/api/users', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'users.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const users = data.users;
  const newUser = req.body;
  newUser.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  users.push(newUser);
  fs.writeFileSync(dataPath, JSON.stringify({ users }, null, 2));
  res.status(201).json(newUser);
});

// 更新用戶
app.put('/api/users/:id', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'users.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const users = data.users;
  const idx = users.findIndex(u => u.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updated = { ...users[idx], ...req.body, id: users[idx].id };
  users[idx] = updated;
  fs.writeFileSync(dataPath, JSON.stringify({ users }, null, 2));
  res.json(updated);
});

// 刪除用戶
app.delete('/api/users/:id', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'users.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  let users = data.users;
  const idx = users.findIndex(u => u.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = users[idx];
  users.splice(idx, 1);
  fs.writeFileSync(dataPath, JSON.stringify({ users }, null, 2));
  res.json(deleted);
});

// 取得所有商品庫存
app.get('/api/inventory', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'inventory.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  res.json(data.inventory);
});

// 取得單一用戶
app.get('/api/users/:id', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'users.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const user = data.users.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

// 取得所有用戶
app.get('/api/users', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'users.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  res.json(data.users);
});

app.listen(PORT, () => {
  console.log(`Mock API server running on port ${PORT}`);
});

module.exports = app; 