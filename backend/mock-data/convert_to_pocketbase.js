const fs = require('fs');
const path = require('path');

// 欄位白名單
const productFields = ['name', 'price', 'category', 'latitude', 'longitude', 'svgUrl'];
const inventoryFields = ['productId', 'stock'];
const userFields = ['name', 'email', 'password', 'isAdmin'];
const locationFields = ['name', 'latitude', 'longitude'];

function pick(obj, fields) {
  const out = {};
  for (const k of fields) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

function convertAndSave(inputPath, key, outputPath, fields, mapFn) {
  const raw = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  let arr = raw[key];
  if (typeof mapFn === 'function') arr = arr.map(mapFn);
  arr = arr.map(item => pick(item, fields));
  fs.writeFileSync(outputPath, JSON.stringify(arr, null, 2));
  console.log(`已產生 ${outputPath}`);
}

// 轉換 products
convertAndSave(
  path.join(__dirname, 'products.json'),
  'products',
  path.join(__dirname, 'products_pb.json'),
  productFields
);

// 轉換 inventory
convertAndSave(
  path.join(__dirname, 'inventory.json'),
  'inventory',
  path.join(__dirname, 'inventory_pb.json'),
  inventoryFields
);

// 轉換 users（密碼改為明文123456，isAdmin保留）
convertAndSave(
  path.join(__dirname, 'users.json'),
  'users',
  path.join(__dirname, 'users_pb.json'),
  userFields,
  u => ({ ...u, password: '123456', isAdmin: !!u.isAdmin })
);

// 轉換 locations
convertAndSave(
  path.join(__dirname, 'locations.json'),
  'locations',
  path.join(__dirname, 'locations_pb.json'),
  locationFields
); 