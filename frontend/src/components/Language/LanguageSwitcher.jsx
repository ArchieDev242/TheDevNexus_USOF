import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { FiGlobe } from 'react-icons/fi';
import '../../style/language-switcher.css';

export default function LanguageSwitcher() 
{
    const { currentLanguage, changeLanguage, availableLanguages, languageNames } = useLanguage();
    const [is_open, set_is_open] = React.useState(false);

    return (
        <div className = "language-switcher">
            <button 
                className = "language-switcher__button"
                onClick = {() => set_is_open(!is_open)}
                aria-label = "Change language"
                aria-expanded = {is_open}
            >
                <FiGlobe />
                <span className = "language-switcher__current">
                    {languageNames[currentLanguage]}
                </span>
            </button>

            {is_open && (
                <div className = "language-switcher__dropdown">
                    {availableLanguages.map(lng => (
                        <button
                            key = {lng}
                            className = {`language-switcher__option ${currentLanguage === lng ? 'active' : ''}`}
                            onClick = {() => {
                                changeLanguage(lng);
                                set_is_open(false);
                            }}
                        >
                            {languageNames[lng]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
