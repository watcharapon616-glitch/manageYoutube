import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translations.json';
import th from './locales/es/translations.json';

i18n.use(initReactI18next).init({
  fallbackLng: 'th',
  lng: 'th',
  resources: {
    en: {
      translations: en
    },
    th: {
      translations: th
    }
  },
  ns: ['translations'],
  defaultNS: 'translations'
});

i18n.languages = ['en', 'th'];

export default i18n;


