import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
    const { i18n } = useTranslation();

    const change_lang = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('i18nextLng', lng);
    };

    const current_lang = i18n.language || 'ua';

    return {
        currentLanguage: current_lang,
        changeLanguage: change_lang,
        availableLanguages: ['ua', 'en', 'de'],
        languageNames: {
            ua: 'Українська',
            en: 'English',
            de: 'Deutsch'
        }
    };
};
