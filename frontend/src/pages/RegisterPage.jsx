import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register } from '../redux/slices/authSlice';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus, FiLogIn } from 'react-icons/fi';
import Header from '../components/Header';
import { useLanguage } from '../hooks/useLanguage';
import '../style/auth.css';

export default function RegisterPage() 
{
    const [form_data, set_form_data] = useState({
        login: '',
        email: '',
        password: '',
        password_confirmation: '',
        full_name: ''
    });
    const [show_password, set_show_password] = useState(false);
    const [show_confirm_password, set_show_confirm_password] = useState(false);
    const [particles, set_particles] = useState([]);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector(state => state.auth);
    const { t } = useTranslation();
    const { currentLanguage, changeLanguage, availableLanguages, languageNames } = useLanguage();
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
    
    const handle_change = (e) => {
        set_form_data({
            ...form_data,
            [e.target.name]: e.target.value
        });
    };
    
    const handle_submit = async (e) => {
        e.preventDefault();
        
        if(form_data.password !== form_data.password_confirmation) 
            {
            alert(t('auth_page.register.password_mismatch'));

            return;
        }
        
        const result = await dispatch(register(form_data));
        
        if(result.type === 'auth/register/fulfilled') navigate('/login');
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
                        <h1 className = "auth-title gradient-text">{t('auth_page.register.title')}</h1>
                        <p className = "auth-subtitle">{t('auth_page.register.subtitle')}</p>
                    </div>

                    <form onSubmit = {handle_submit} className = "auth-form">
                        {error && (
                            <div className = "error-message">
                                <span className = "error-icon">⚠</span>
                                {error}
                            </div>
                        )}
                        
                        <div className = "form-group">
                            <label htmlFor = "login" className = "form-label">
                                <FiUser /> {t('auth_page.register.username_label')}
                            </label>
                            <div className = "input-wrapper">
                                <input
                                    type = "text"
                                    id = "login"
                                    name = "login"
                                    value = {form_data.login}
                                    onChange = {handle_change}
                                    className = "form-input"
                                    placeholder={t('auth_page.register.username_placeholder')}
                                    required
                                />
                                <div className = "input-glow"></div>
                            </div>
                        </div>
                        
                        <div className = "form-group">
                            <label htmlFor = "full_name" className = "form-label">
                                <FiUser /> {t('auth_page.register.full_name_label')}
                            </label>
                            <div className = "input-wrapper">
                                <input
                                    type = "text"
                                    id = "full_name"
                                    name = "full_name"
                                    value = {form_data.full_name}
                                    onChange = {handle_change}
                                    className = "form-input"
                                    placeholder = {t('auth_page.register.full_name_placeholder')}
                                    required
                                />
                                <div className = "input-glow"></div>
                            </div>
                        </div>

                        <div className = "form-group">
                            <label htmlFor = "email" className = "form-label">
                                <FiMail /> {t('auth_page.register.email_label')}
                            </label>
                            <div className = "input-wrapper">
                                <input
                                    type = "email"
                                    id = "email"
                                    name = "email"
                                    value = {form_data.email}
                                    onChange = {handle_change}
                                    className = "form-input"
                                    placeholder = {t('auth_page.register.email_placeholder')}
                                    required
                                />
                                <div className = "input-glow"></div>
                            </div>
                        </div>

                        <div className = "form-group">
                            <label htmlFor = "password" className = "form-label">
                                <FiLock /> {t('auth_page.register.password_label')}
                            </label>
                            <div className = "input-wrapper">
                                <input
                                    type = {show_password ? "text" : "password"}
                                    id = "password"
                                    name = "password"
                                    value = {form_data.password}
                                    onChange = {handle_change}
                                    className = "form-input"
                                    placeholder = {t('auth_page.register.password_placeholder')}
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

                        <div className = "form-group">
                            <label htmlFor = "password_confirmation" className = "form-label">
                                <FiLock /> {t('auth_page.register.confirm_password_label')}
                            </label>
                            <div className = "input-wrapper">
                                <input
                                    type = {show_confirm_password ? "text" : "password"}
                                    id = "password_confirmation"
                                    name = "password_confirmation"
                                    value = {form_data.password_confirmation}
                                    onChange = {handle_change}
                                    className = "form-input"
                                    placeholder = {t('auth_page.register.confirm_password_placeholder')}
                                    required
                                />
                                <button
                                    type = "button"
                                    className = "password-toggle"
                                    onClick = {() => set_show_confirm_password(!show_confirm_password)}
                                >
                                    {show_confirm_password ? <FiEyeOff /> : <FiEye />}
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
                                    {t('auth_page.register.loading')}
                                </>
                            ) : (
                                <>
                                    <FiUserPlus /> {t('auth_page.register.submit')}
                                </>
                            )}
                        </button>

                        <div className = "auth-divider">
                            <span>{t('auth_page.common.or')}</span>
                        </div>

                        <Link to = "/login" className = "btn btn-game-outline">
                            <FiLogIn /> {t('auth_page.register.login_button')}
                        </Link>
                    </form>

                    <div className = "auth-footer">
                        <p>
                            {t('auth_page.register.footer_text')}{' '}
                            <Link to="/login">{t('auth_page.register.footer_link')}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
