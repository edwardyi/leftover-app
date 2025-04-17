const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get('/api/products', (req, res) => {
  const dataPath = path.join(__dirname, 'mock-data', 'products.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  res.json(data.products);
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

app.listen(PORT, () => {
  console.log(`Mock API server running on port ${PORT}`);
});

module.exports = app; 