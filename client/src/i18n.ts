import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files directly to avoid extra HTTP requests for now
import translationES from '../public/locales/es/translation.json';
import translationEN from '../public/locales/en/translation.json';

const resources = {
    es: {
        translation: translationES
    },
    en: {
        translation: translationEN
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'es',
        debug: false,
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        detection: {
            order: ['queryString', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
            caches: ['localStorage', 'cookie'],
        }
    });

export default i18n;
