import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import Header from '../components/Header/Header';
import { useLanguage } from '../hooks/useLanguage';
import '../style/auth.css';

export default function ResetPasswordPage() 
{
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    const [form_data, set_form_data] = useState({
        password: '',
        confirm_password: ''
    });
    const [show_password, set_show_password] = useState(false);
    const [show_confirm, set_show_confirm] = useState(false);
    const [loading, set_loading] = useState(false);
    const [verifying, set_verifying] = useState(true);
    const [error, set_error] = useState('');
    const [success, set_success] = useState(false);
    const [particles, set_particles] = useState([]);
    const [token_valid, set_token_valid] = useState(false);
    
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
    
    useEffect(() => {
        const verify_token = async () => {
            if(!token || !email) 
                {
                set_error(t('auth_page.reset_password.invalid_token'));
                set_verifying(false);
                return;
            }
            
            try 
            {
                const response = await fetch('/api/auth/verify-reset-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ token, email })
                });

                const data = await response.json();
                
                if(data.message) set_token_valid(true);
            } catch(err) 
            {
                console.error('Token verification error:', err);
                set_error(t('auth_page.reset_password.invalid_token'));
            } finally 
            {
                set_verifying(false);
            }
        };
        
        verify_token();
    }, [token, email, t]);
    
    const handle_change = (e) => {
        set_form_data({
            ...form_data,
            [e.target.name]: e.target.value
        });
        set_error('');
    };
    
    const handle_submit = async (e) => {
        e.preventDefault();
        
        if(form_data.password.length < 8) 
            {
            set_error(t('auth_page.reset_password.password_requirements'));

            return;
        }
        
        if(form_data.password !== form_data.confirm_password) 
            {
            set_error(t('auth_page.reset_password.password_mismatch'));

            return;
        }
        
        set_loading(true);
        set_error('');
        
        try 
        {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: 
                {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',
                body: JSON.stringify({
                    token,
                    email,
                    newPassword: form_data.password
                })
            });

            const data = await response.json();
            
            if(data.message) 
                {
                set_success(true);
                setTimeout(() => {
                    navigate('/login?reset=success', { replace: true });
                }, 3000);
            }
        } catch(err) 
        {
            console.error('Reset password error:', err);
            set_error(t('auth_page.reset_password.error_message'));
        } finally 
        {
            set_loading(false);
        }
    };
    
    if(verifying) 
        {
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
                            <div className = "loading-container">
                                <div className = "loading-spinner"></div>
                                <p>Verifying reset link...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    
    if (!token_valid) {
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
                            <div className = "error-container">
                                <div className = "error-icon-large">
                                    <FiAlertCircle size={64} />
                                </div>
                                <h2 className = "error-title">{t('auth_page.reset_password.invalid_token')}</h2>
                                <p className = "error-text">
                                    {t('auth_page.reset_password.error_message')}
                                </p>
                                <Link to = "/forgot-password" className = "btn btn-game">
                                    {t('auth_page.reset_password.resend_link')}
                                </Link>
                                <Link to = "/login" className = "back-link">
                                    <FiArrowLeft /> {t('auth_page.reset_password.back_to_login')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    
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
                            <h1 className = "auth-title gradient-text">{t('auth_page.reset_password.title')}</h1>
                            <p className = "auth-subtitle">{t('auth_page.reset_password.subtitle')}</p>
                        </div>
                        
                        {success ? (
                            <div className = "success-container">
                                <div className = "success-icon">
                                    <FiCheckCircle size={64} />
                                </div>
                                <h2 className = "success-title">{t('auth_page.reset_password.success_message')}</h2>
                                <p className = "success-text">
                                    {t('auth_page.reset_password.redirecting')}
                                </p>
                            </div>
                        ) : (
                            <form onSubmit = {handle_submit} className = "auth-form">
                                {error && (
                                    <div className = "error-message">
                                        <span className = "error-icon">⚠</span>
                                        {error}
                                    </div>
                                )}

                                <div className = "form-group">
                                    <label htmlFor = "password" className = "form-label">
                                        <FiLock /> {t('auth_page.reset_password.password_label')}
                                    </label>
                                    <div className = "input-wrapper">
                                        <input
                                            type = {show_password ? "text" : "password"}
                                            id = "password"
                                            name = "password"
                                            value = {form_data.password}
                                            onChange = {handle_change}
                                            className = "form-input"
                                            placeholder = {t('auth_page.reset_password.password_placeholder')}
                                            required
                                        />
                                        <button
                                            type = "button"
                                            className = "password-toggle"
                                            onClick = {() => set_show_password(!show_password)}
                                        >
                                            {show_password ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                        <div className = "input-glow"></div>
                                    </div>
                                    <small className = "form-hint">
                                        {t('auth_page.reset_password.password_requirements')}
                                    </small>
                                </div>

                                <div className = "form-group">
                                    <label htmlFor = "confirm_password" className = "form-label">
                                        <FiLock /> {t('auth_page.reset_password.confirm_password_label')}
                                    </label>
                                    <div className = "input-wrapper">
                                        <input
                                            type = {show_confirm ? "text" : "password"}
                                            id = "confirm_password"
                                            name = "confirm_password"
                                            value = {form_data.confirm_password}
                                            onChange = {handle_change}
                                            className = "form-input"
                                            placeholder = {t('auth_page.reset_password.confirm_password_placeholder')}
                                            required
                                        />
                                        <button
                                            type = "button"
                                            className = "password-toggle"
                                            onClick = {() => set_show_confirm(!show_confirm)}
                                        >
                                            {show_confirm ? <FiEyeOff /> : <FiEye />}
                                        </button>
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
                                            {t('auth_page.reset_password.loading')}
                                        </>
                                    ) : (
                                        <>
                                            <FiLock /> {t('auth_page.reset_password.submit')}
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        <div className = "auth-footer">
                            <Link to = "/login" className = "back-link">
                                <FiArrowLeft /> {t('auth_page.reset_password.back_to_login')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
