import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './components/MapView';
import UserLocationButton from './components/UserLocationButton';
import ProductList from './components/ProductList';
import ProductFilter from './components/ProductFilter';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

function App() {
  const [userPosition, setUserPosition] = useState(null);
  const [filter, setFilter] = useState({});
  const [products, setProducts] = useState([]);
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState('list'); // 響應式分頁
  const [mapCenter, setMapCenter] = useState([25.033964, 121.564468]);

  useEffect(() => {
    // 向後端取得商品資料
    axios.get('http://localhost:3001/api/products')
      .then(res => setProducts(res.data))
      .catch(err => {
        alert('無法取得商品資料');
        setProducts([]);
      });
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3001/api/i18n')
      .then(res => {
        Object.keys(res.data).forEach(lang => {
          i18n.addResourceBundle(lang, 'translation', res.data[lang].translation, true, true);
        });
      });
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category)));

  // 推薦排序：預設依 createdAt 由新到舊排序
  const sortedProducts = [...products].sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const filteredProducts = sortedProducts.filter(p => {
    if (filter.distance && Number(filter.distance) < p.distance) return false;
    if (filter.price && Number(filter.price) < p.price) return false;
    if (filter.category && filter.category !== '' && filter.category !== p.category) return false;
    return true;
  });

  const handleFilter = (change) => {
    setFilter(f => ({ ...f, ...change }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-2 md:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">{t('title')}</h1>
          <div className="space-x-2">
            <button onClick={() => i18n.changeLanguage('zhTW')} className="px-2 py-1 rounded border text-sm hover:bg-blue-100">繁體</button>
            <button onClick={() => i18n.changeLanguage('zhCN')} className="px-2 py-1 rounded border text-sm hover:bg-blue-100">简体</button>
            <button onClick={() => i18n.changeLanguage('en')} className="px-2 py-1 rounded border text-sm hover:bg-blue-100">EN</button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <UserLocationButton onLocation={setUserPosition} label={t('getLocation')} />
          <ProductFilter onFilter={handleFilter} categories={categories} t={t} />
        </div>
        {/* 響應式分頁：手機顯示分頁，桌機並排 */}
        <div className="block md:hidden mb-4">
          <div className="flex justify-center gap-2">
            <button onClick={() => setTab('list')} className={`px-4 py-2 rounded-t-lg border-b-2 ${tab === 'list' ? 'border-blue-600 text-blue-700 font-bold' : 'border-transparent text-gray-500'}`}>{t('productName')}</button>
            <button onClick={() => setTab('map')} className={`px-4 py-2 rounded-t-lg border-b-2 ${tab === 'map' ? 'border-blue-600 text-blue-700 font-bold' : 'border-transparent text-gray-500'}`}>Map</button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* 手機分頁顯示，桌機並排 */}
          <div className={"" + (tab === 'list' || window.innerWidth >= 768 ? '' : 'hidden')}> <ProductList products={filteredProducts} t={t} onCenter={(lat, lng) => setMapCenter([lat, lng])} mapCenter={mapCenter} /> </div>
          <div className={"" + (tab === 'map' || window.innerWidth >= 768 ? '' : 'hidden')}> <MapView userPosition={userPosition} products={filteredProducts} t={t} center={mapCenter} /> </div>
        </div>
      </div>
    </div>
  );
}

export default App;
