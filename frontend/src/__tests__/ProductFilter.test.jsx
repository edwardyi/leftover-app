import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductFilter from '../components/ProductFilter';

describe('ProductFilter 元件', () => {
  it('應正確渲染距離、價格、類別過濾欄位', () => {
    const { getByLabelText } = render(<ProductFilter onFilter={() => {}} categories={['麵包', '牛奶']} />);
    expect(getByLabelText('距離 (公里)')).toBeInTheDocument();
    expect(getByLabelText('價格上限')).toBeInTheDocument();
    expect(getByLabelText('類別')).toBeInTheDocument();
  });

  it('修改欄位時應觸發 onFilter', () => {
    const onFilter = jest.fn();
    const { getByLabelText } = render(<ProductFilter onFilter={onFilter} categories={['麵包', '牛奶']} />);
    fireEvent.change(getByLabelText('距離 (公里)'), { target: { value: '2' } });
    fireEvent.change(getByLabelText('價格上限'), { target: { value: '100' } });
    fireEvent.change(getByLabelText('類別'), { target: { value: '牛奶' } });
    expect(onFilter).toHaveBeenCalledTimes(3);
  });
}); 