import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem('gsb_lang', lng);
    } catch (e) {
      // ignore storage errors
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm text-gray-500">{t('language') || 'Language'}:</label>
      <button
        onClick={() => changeLanguage('en')}
        className="text-sm px-2 py-1 rounded hover:bg-gray-100"
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('fr')}
        className="text-sm px-2 py-1 rounded hover:bg-gray-100"
        aria-label="Switch to French"
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
