import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ua_global from '../translations/ua/global.json';
import en_global from '../translations/en/global.json';
import de_global from '../translations/de/global.json';

const resources = {
    ua: {
        global: ua_global
    },
    en: {
        global: en_global
    },
    de: {
        global: de_global
    }
};

const saved_lang = localStorage.getItem('i18nextLng') || 'ua';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: saved_lang,
        fallbackLng: 'ua',
        defaultNS: 'global',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
