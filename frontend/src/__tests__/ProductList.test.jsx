import React from 'react';
import { render, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductList from '../components/ProductList';

const mockProducts = [
  { id: 1, name: '麵包', price: 35, distance: 0.5 },
  { id: 2, name: '牛奶', price: 50, distance: 1.2 },
];

describe('ProductList 元件', () => {
  it('應正確渲染商品名稱、價格、距離', () => {
    const { getAllByRole } = render(<ProductList products={mockProducts} />);
    const rows = getAllByRole('row');
    // 第一列是表頭，第二列開始是資料
    const firstProductCells = within(rows[1]).getAllByRole('cell');
    expect(firstProductCells[0]).toHaveTextContent('麵包');
    expect(firstProductCells[1]).toHaveTextContent('35');
    expect(firstProductCells[2]).toHaveTextContent('0.5 公里');

    const secondProductCells = within(rows[2]).getAllByRole('cell');
    expect(secondProductCells[0]).toHaveTextContent('牛奶');
    expect(secondProductCells[1]).toHaveTextContent('50');
    expect(secondProductCells[2]).toHaveTextContent('1.2 公里');
  });
}); 