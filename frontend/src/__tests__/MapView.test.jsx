import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapView from '../components/MapView';

describe('MapView 元件', () => {
  it('應正確渲染 Leaflet 地圖', () => {
    const { container } = render(<MapView />);
    // 檢查地圖容器是否存在
    expect(container.querySelector('.leaflet-container')).toBeInTheDocument();
  });

  it('應根據 props 顯示目前位置標記', () => {
    const position = { lat: 25.033964, lng: 121.564468 };
    const { getByTitle } = render(<MapView userPosition={position} />);
    // 檢查標記是否存在
    expect(getByTitle('目前位置')).toBeInTheDocument();
  });
}); 