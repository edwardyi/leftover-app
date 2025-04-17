import React from 'react';

const ProductFilter = ({ onFilter, categories, t }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilter({ [name]: value });
  };

  return (
    <form className="flex flex-col md:flex-row gap-2 md:gap-4 items-center">
      <label className="flex flex-col text-sm font-medium text-gray-700">
        {t('distance')}
        <input name="distance" type="number" min="0" onChange={handleChange} aria-label={t('distance')} className="mt-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" />
      </label>
      <label className="flex flex-col text-sm font-medium text-gray-700">
        {t('price')}
        <input name="price" type="number" min="0" onChange={handleChange} aria-label={t('price')} className="mt-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" />
      </label>
      <label className="flex flex-col text-sm font-medium text-gray-700">
        {t('category')}
        <select name="category" onChange={handleChange} aria-label={t('category')} className="mt-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300">
          <option value="">{t('all')}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </label>
    </form>
  );
};

export default ProductFilter; 