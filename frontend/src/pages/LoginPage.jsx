import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '../redux/slices/authSlice';
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn, FiUserPlus } from 'react-icons/fi';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { useLanguage } from '../hooks/useLanguage';
import '../style/auth.css';

export default function LoginPage() 
{
    const [form_data, set_form_data] = useState({
        login: '',
        password: ''
    });
    const [show_password, set_show_password] = useState(false);
    const [particles, set_particles] = useState([]);
    const [status_messages, set_status_messages] = useState([]);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector(state => state.auth);
    const { t } = useTranslation();
    const { currentLanguage, changeLanguage, availableLanguages, languageNames } = useLanguage();
    const [searchParams] = useSearchParams();
    const languageFlags = {
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
        const messages = [];

        if(searchParams.get('verified') === 'true') {
            messages.push(t('auth_page.login.verified_success'));
        }

        if(searchParams.get('reset') === 'success') {
            messages.push(t('auth_page.login.reset_success'));
        }

        set_status_messages(messages);
    }, [searchParams, t]);
    
    const handle_change = (e) => {
        set_form_data({
            ...form_data,
            [e.target.name]: e.target.value
        });
    };
    
    const handle_submit = async (e) => {
        e.preventDefault();
        const result = await dispatch(login(form_data));
        
        if(result.type === 'auth/login/fulfilled') navigate('/');
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
                                    {languageFlags[lng]}
                                </button>
                            ))}
                        </div>
                        <h1 className = "auth-title gradient-text">{t('auth_page.login.title')}</h1>
                        <p className = "auth-subtitle">{t('auth_page.login.subtitle')}</p>
                    </div>
                    
                    <form onSubmit = {handle_submit} className = "auth-form">
                        {status_messages.length > 0 && (
                            <div className = "success-message">
                                {status_messages.map((message, index) => (
                                    <p key = {index}>{message}</p>
                                ))}
                            </div>
                        )}
                        {error && (
                            <div className = "error-message">
                                <span className = "error-icon">⚠</span>
                                {error}
                            </div>
                        )}

                        <div className = "form-group">
                            <label htmlFor = "login" className = "form-label">
                                <FiUser /> {t('auth_page.login.username_label')}
                            </label>
                            <div className = "input-wrapper">
                                <input
                                    type = "text"
                                    id = "login"
                                    name = "login"
                                    value = {form_data.login}
                                    onChange = {handle_change}
                                    className = "form-input"
                                    placeholder = {t('auth_page.login.username_placeholder')}
                                    required
                                />
                                <div className = "input-glow"></div>
                            </div>
                        </div>

                        <div className = "form-group">
                            <label htmlFor = "password" className = "form-label">
                                <FiLock /> {t('auth_page.login.password_label')}
                            </label>
                            <div className = "input-wrapper">
                                <input
                                    type = {show_password ? "text" : "password"}
                                    id = "password"
                                    name = "password"
                                    value = {form_data.password}
                                    onChange = {handle_change}
                                    className = "form-input"
                                    placeholder = {t('auth_page.login.password_placeholder')}
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
                        </div>

                        <div className = "form-footer">
                            <a href = "/forgot-password" className = "forgot-link">
                                {t('auth_page.login.forgot_password')}
                            </a>
                        </div>
                        
                        <button
                            type = "submit"
                            className = "btn btn-game"
                            disabled = {loading}
                        >
                            {loading ? (
                                <>
                                    <span className = "loading-spinner"></span>
                                    {t('auth_page.login.loading')}
                                </>
                            ) : (
                                <>
                                    <FiLogIn /> {t('auth_page.login.submit')}
                                </>
                            )}
                        </button>

                        <div className = "auth-divider">
                            <span>{t('auth_page.common.or')}</span>
                        </div>

                        <Link to = "/register" className = "btn btn-game-outline">
                            <FiUserPlus /> {t('auth_page.login.create_account')}
                        </Link>
                    </form>

                    <div className = "auth-footer">
                        <p>
                            {t('auth_page.login.footer_text')}{' '}
                            <Link to = "/register">{t('auth_page.login.footer_link')}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        </>
    );
}
