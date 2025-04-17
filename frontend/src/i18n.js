import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  zhTW: {
    translation: {
      title: '即期品地圖服務',
      getLocation: '取得目前位置',
      distance: '距離 (公里)',
      price: '價格上限',
      category: '類別',
      all: '全部',
      productName: '商品名稱',
      productPrice: '價格',
      productDistance: '距離',
      currentPosition: '目前位置',
      km: '公里',
    },
  },
  zhCN: {
    translation: {
      title: '临期品地图服务',
      getLocation: '获取当前位置',
      distance: '距离 (公里)',
      price: '价格上限',
      category: '类别',
      all: '全部',
      productName: '商品名称',
      productPrice: '价格',
      productDistance: '距离',
      currentPosition: '当前位置',
      km: '公里',
    },
  },
  en: {
    translation: {
      title: 'Expiring Products Map Service',
      getLocation: 'Get Current Location',
      distance: 'Distance (km)',
      price: 'Max Price',
      category: 'Category',
      all: 'All',
      productName: 'Product Name',
      productPrice: 'Price',
      productDistance: 'Distance',
      currentPosition: 'Current Position',
      km: 'km',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'zhTW',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n; 