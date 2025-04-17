import React, { useState } from 'react';
import MapView from './components/MapView';
import UserLocationButton from './components/UserLocationButton';
import ProductList from './components/ProductList';
import ProductFilter from './components/ProductFilter';

const mockProducts = [
  { id: 1, name: '麵包', price: 35, distance: 0.5, category: '麵包' },
  { id: 2, name: '牛奶', price: 50, distance: 1.2, category: '牛奶' },
  { id: 3, name: '蛋糕', price: 80, distance: 2.5, category: '麵包' },
];

function App() {
  const [userPosition, setUserPosition] = useState(null);
  const [filter, setFilter] = useState({});

  const categories = Array.from(new Set(mockProducts.map(p => p.category)));

  const filteredProducts = mockProducts.filter(p => {
    if (filter.distance && Number(filter.distance) < p.distance) return false;
    if (filter.price && Number(filter.price) < p.price) return false;
    if (filter.category && filter.category !== '' && filter.category !== p.category) return false;
    return true;
  });

  const handleFilter = (change) => {
    setFilter(f => ({ ...f, ...change }));
  };

  return (
    <div>
      <h1>即期品地圖服務</h1>
      <UserLocationButton onLocation={setUserPosition} />
      <ProductFilter onFilter={handleFilter} categories={categories} />
      <ProductList products={filteredProducts} />
      <MapView userPosition={userPosition} />
    </div>
  );
}

export default App; 