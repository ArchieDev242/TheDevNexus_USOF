import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import '../Hero/Hero.css';

export default function Hero({ isAuthenticated }) 
{
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <section className = "hero-section">
            <div className = "hero-content">
                <h1 className = "hero-title">
                    <span className = "gradient-text">TheDevNexus</span>
                </h1>
                <p className = "hero-subtitle">
                    {t('home.subtitle')}
                </p>
                <div className = "hero-buttons">
                    {!isAuthenticated ? (
                        <>
                            <button 
                                className = "btn btn-gradient"
                                onClick = {() => navigate('/register')}
                            >
                                {t('header.register')}
                            </button>
                            <button 
                                className = "btn btn-outline"
                                onClick = {() => navigate('/posts')}
                            >
                                {t('header.posts')}
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                className = "btn btn-gradient"
                                onClick = {() => navigate('/posts')}
                            >
                                {t('posts.create_post')}
                            </button>
                            <button 
                                className = "btn btn-outline"
                                onClick = {() => navigate('/posts')}
                            >
                                {t('categories.all_categories')}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className = "hero-background"></div>
        </section>
    );
}
