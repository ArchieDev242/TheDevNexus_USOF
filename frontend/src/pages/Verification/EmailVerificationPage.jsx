import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle, FiAlertCircle, FiLogIn, FiHome, FiRefreshCw } from 'react-icons/fi';
import Header from '../../components/Header';
import { useLanguage } from '../../hooks/useLanguage';
import './auth.css';

export default function EmailVerificationPage() 
{
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [status, set_status] = useState('loading');
    const [message, set_message] = useState('');
    const [particles, set_particles] = useState([]);

    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentLanguage, changeLanguage, availableLanguages, languageNames } = useLanguage();

    const flags = {
        ua: '🇺🇦',
        en: '🇬🇧',
        de: '🇩🇪'
    };

    useEffect(() => {
        const particle_array = [];

        for(let i = 0; i < 20; i++) 
            {
            particle_array.push({
                id: i,
                left: Math.random() * 100,
                animation_delay: Math.random() * 5,
                duration: 3 + Math.random() * 4
            });
        }

        set_particles(particle_array);
    }, []);

    const perform_verification = useCallback(async () => {
        if(!token || !email) 
            {
            set_status('error');
            set_message(t('auth_page.verify_email.missing_params'));
            return;
        }

        set_status('loading');
        set_message('');

        try 
        {
            const response = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, {
                method: 'GET',
                credentials: 'include'
            });

            const text = await response.text();

            if(response.ok) 
                {
                set_status('success');
                set_message(text || t('auth_page.verify_email.success_message'));
            } 
            else 
            {
                set_status('error');
                set_message(text || t('auth_page.verify_email.error_message'));
            }
        } 
        catch(error) 
        {
            console.error('Email verification error:', error);
            set_status('error');
            set_message(t('auth_page.verify_email.network_error'));
        }
    }, [token, email, t]);

    useEffect(() => {
        if(!token || !email) 
            {
            set_status('error');
            set_message(t('auth_page.verify_email.missing_params'));
            return;
        }

        perform_verification();
    }, [token, email, t, perform_verification]);

    useEffect(() => {
        if(status !== 'success') return;

        const timeout = setTimeout(() => {
            navigate('/login?verified=true', { replace: true });
        }, 3000);

        return () => clearTimeout(timeout);
    }, [status, navigate]);

    const has_params = Boolean(token && email);

    return (
        <>
            <Header />
            <div className = "auth-page">
                <div className = "auth-background">
                    {particles.map(particle => (
                        <div
                            key = {particle.id}
                            className = "particle"
                            style = {{
                                left: `${particle.left}%`,
                                animationDelay: `${particle.animation_delay}s`,
                                animationDuration: `${particle.duration}s`
                            }}
                        />
                    ))}
                    <div className = "grid-overlay"></div>
                </div>

                <div className = "auth-container">
                    <div className = "auth-card">
                        <div className = "pixel-corners"></div>

                        <div className = "auth-header">
                            <div className = "auth-language-switcher">
                                {availableLanguages.map(lng => (
                                    <button
                                        key = {lng}
                                        type = "button"
                                        className = {`auth-lang-btn ${currentLanguage === lng ? 'active' : ''}`}
                                        onClick = {() => changeLanguage(lng)}
                                        aria-label = {languageNames[lng]}
                                    >
                                        {flags[lng]}
                                    </button>
                                ))}
                            </div>

                            <h1 className = "auth-title gradient-text">{t('auth_page.verify_email.title')}</h1>
                            <p className = "auth-subtitle">{t('auth_page.verify_email.subtitle')}</p>
                        </div>

                        <div className = "auth-form">
                            {status === 'loading' && (
                                <div className = "loading-container">
                                    <div className = "loading-spinner"></div>
                                    <p>{t('auth_page.verify_email.verifying')}</p>
                                </div>
                            )}

                            {status === 'success' && (
                                <div className = "success-message">
                                    <FiCheckCircle size = {28} />
                                    <div>
                                        <strong>{t('auth_page.verify_email.success_title')}</strong>
                                        <p>{message || t('auth_page.verify_email.success_message')}</p>
                                    </div>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className = "error-message">
                                    <span className = "error-icon"><FiAlertCircle /></span>
                                    <div>
                                        <strong>{t('auth_page.verify_email.error_title')}</strong>
                                        <p>{message || t('auth_page.verify_email.error_message')}</p>
                                    </div>
                                </div>
                            )}

                            <div className = "auth-actions" style = {{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {status === 'error' && has_params && (
                                    <button
                                        type = "button"
                                        className = "btn btn-game"
                                        onClick = {perform_verification}
                                    >
                                        <FiRefreshCw /> {t('auth_page.verify_email.retry')}
                                    </button>
                                )}

                                {(status === 'success' || status === 'error') && (
                                    <Link to = "/login" className = "btn btn-game">
                                        <FiLogIn /> {t('auth_page.verify_email.cta_login')}
                                    </Link>
                                )}

                                <Link to = "/" className = "btn btn-game-outline">
                                    <FiHome /> {t('auth_page.verify_email.cta_home')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
