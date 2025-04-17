import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 初始只設空語系，後續動態載入

i18n.use(initReactI18next).init({
  lng: 'zhTW',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: {},
});

export default i18n; 