import React from 'react';
import { FiTwitter, FiGithub, FiYoutube, FiMessageCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import './Footer.css'

export default function Footer() 
{
    const { t } = useTranslation();
    
    return (
        <footer className = "site-footer">
            <div className = "container">
                <div className = "footer-grid">
                    <div className = "footer-col">
                        <h3 className = "footer-logo gradient-text">TheDevNexus</h3>
                        <p className = "footer-description">
                            {t('footer.description')}
                        </p>
                    </div>
                    
                    <div className = "footer-col">
                        <h4 className = "footer-heading">{t('footer.quick_links')}</h4>
                        <ul className = "footer-links">
                            <li><a href = "/">{t('header.home')}</a></li>
                            <li><a href = "/posts">{t('footer.link_forums')}</a></li>
                            <li><a href = "/categories">{t('categories.title')}</a></li>
                            <li><a href = "/about">{t('header.about')}</a></li>
                        </ul>
                    </div>
                    
                    <div className = "footer-col">
                        <h4 className = "footer-heading">{t('footer.categories')}</h4>
                        <ul className = "footer-links">
                            <li><a href = "/about">{t('footer.category_gamedev')}</a></li>
                            <li><a href = "/about">{t('footer.category_programming')}</a></li>
                            <li><a href = "/about">{t('footer.category_design')}</a></li>
                            <li><a href = "/about">{t('footer.category_career')}</a></li>
                        </ul>
                    </div>
                    
                    <div className = "footer-col">
                        <h4 className = "footer-heading">{t('footer.connect')}</h4>
                        <div className = "footer-social-links">
                            <a href = "#" className = "social-link" aria-label = {t('footer.twitter')}>
                                <FiTwitter />
                            </a>
                            <a href = "#" className = "social-link" aria-label = {t('footer.github')}>
                                <FiGithub />
                            </a>
                            <a href = "#" className = "social-link" aria-label = {t('footer.youtube')}>
                                <FiYoutube />
                            </a>
                            <a href = "#" className = "social-link" aria-label = {t('footer.discord')}>
                                <FiMessageCircle />
                            </a>
                        </div>
                    </div>
                </div>
                
                <div className = "footer-bottom">
                    <p>{t('footer.copyright', { year: '2025' })}</p>
                </div>
            </div>
        </footer>
    );
}
