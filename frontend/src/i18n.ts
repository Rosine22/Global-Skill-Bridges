import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fr from './locales/fr.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

const persisted = typeof window !== 'undefined' ? localStorage.getItem('gsb_lang') : null;

i18n.use(initReactI18next).init({
  resources,
  lng: persisted || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
