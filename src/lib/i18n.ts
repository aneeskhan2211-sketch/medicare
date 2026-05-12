import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "Settings": "Settings",
      "Notifications": "Notifications",
      "Language": "Language",
      "Language changed to English": "Language changed to English"
    }
  },
  hi: {
    translation: {
      "Settings": "सेटिंग्स",
      "Notifications": "सूचनाएं",
      "Language": "भाषा",
      "Language changed to English": "भाषा अंग्रेजी में बदल दी गई"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
