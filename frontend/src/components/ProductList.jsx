import React from 'react';

const ProductList = ({ products, t }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border border-gray-200 rounded shadow text-sm">
      <thead className="bg-blue-100">
        <tr>
          <th className="px-3 py-2 border-b">{t('productName')}</th>
          <th className="px-3 py-2 border-b">{t('productPrice')}</th>
          <th className="px-3 py-2 border-b">{t('productDistance')}</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id} className="even:bg-gray-50 hover:bg-blue-50 transition">
            <td className="px-3 py-2 border-b">{p.name}</td>
            <td className="px-3 py-2 border-b">{p.price}</td>
            <td className="px-3 py-2 border-b">{p.distance} {t('km')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ProductList; 