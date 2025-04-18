import React from 'react';

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
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
}

const ProductList = ({ products, t, onCenter, mapCenter }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border border-gray-200 rounded shadow text-sm">
      <thead className="bg-blue-100">
        <tr>
          <th className="px-3 py-2 border-b">{t('productName')}</th>
          <th className="px-3 py-2 border-b">{t('productPrice')}</th>
          <th className="px-3 py-2 border-b">{t('productDistance')}</th>
          <th className="px-3 py-2 border-b">操作</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id} className="even:bg-gray-50 hover:bg-blue-50 transition cursor-pointer" onClick={() => onCenter && onCenter(p.latitude, p.longitude)}>
            <td className="px-3 py-2 border-b">{p.name}</td>
            <td className="px-3 py-2 border-b">{p.price}</td>
            <td className="px-3 py-2 border-b">{getDistanceFromLatLonInKm(mapCenter[0], mapCenter[1], p.latitude, p.longitude).toFixed(2)} {t('km')}</td>
            <td className="px-3 py-2 border-b">
              <button className="px-2 py-1 bg-blue-100 rounded text-blue-700 hover:bg-blue-200" onClick={e => { e.stopPropagation(); onCenter && onCenter(p.latitude, p.longitude); }}>定位</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ProductList; 