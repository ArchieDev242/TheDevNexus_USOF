import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import Header from '../components/Header/Header';
import { useLanguage } from '../hooks/useLanguage';
import '../style/auth.css';

export default function ForgotPasswordPage() 
{
    const [email, set_email] = useState('');
    const [loading, set_loading] = useState(false);
    const [error, set_error] = useState('');
    const [success, set_success] = useState(false);
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
    
    const handle_change = (e) => {
        set_email(e.target.value);
        set_error('');
    };
    
    const handle_submit = async (e) => {
        e.preventDefault();
        
        if(!email.trim()) 
            {
            set_error(t('auth_page.forgot_password.email_placeholder'));
            return;
        }
        
        set_loading(true);
        set_error('');
        
        try 
        {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            
            if(data.message) 
                {
                set_success(true);

                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch(err) 
        {
            console.error('Forgot password error:', err);
            set_success(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } finally 
        {
            set_loading(false);
        }
    };
    
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
                    <div className = "auth-header">
                        <div className = "pixel-corners"></div>
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
                        <h1 className = "auth-title gradient-text">{t('auth_page.forgot_password.title')}</h1>
                        <p className = "auth-subtitle">{t('auth_page.forgot_password.subtitle')}</p>
                    </div>
                    
                    {success ? (
                        <div className = "success-container">
                            <div className = "success-icon">
                                <FiCheckCircle size={64} />
                            </div>
                            <h2 className = "success-title">{t('auth_page.forgot_password.success_message')}</h2>
                            <p className = "success-text">
                                Redirecting to login page...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit = {handle_submit} className = "auth-form">
                            <p className = "form-description">
                                {t('auth_page.forgot_password.description')}
                            </p>

                            {error && (
                                <div className = "error-message">
                                    <span className = "error-icon">⚠</span>
                                    {error}
                                </div>
                            )}

                            <div className = "form-group">
                                <label htmlFor = "email" className = "form-label">
                                    <FiMail /> {t('auth_page.forgot_password.email_label')}
                                </label>
                                <div className = "input-wrapper">
                                    <input
                                        type = "email"
                                        id = "email"
                                        name = "email"
                                        value = {email}
                                        onChange = {handle_change}
                                        className = "form-input"
                                        placeholder = {t('auth_page.forgot_password.email_placeholder')}
                                        required
                                    />
                                    <div className = "input-glow"></div>
                                </div>
                            </div>
                            
                            <button
                                type = "submit"
                                className = "btn btn-game"
                                disabled = {loading}
                            >
                                {loading ? (
                                    <>
                                        <span className = "loading-spinner"></span>
                                        {t('auth_page.forgot_password.loading')}
                                    </>
                                ) : (
                                    <>
                                        <FiMail /> {t('auth_page.forgot_password.submit')}
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className = "auth-footer">
                        <Link to = "/login" className = "back-link">
                            <FiArrowLeft /> {t('auth_page.forgot_password.back_to_login')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
