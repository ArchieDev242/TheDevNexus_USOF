import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import 
{ 
    FiUser, 
    FiLock, 
    FiBell, 
    FiEye,
    FiMail,
    FiMonitor,
    FiGlobe,
    FiShield,
    FiSave,
    FiCheck
} from 'react-icons/fi';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer'
import './settings.css';

export default function SettingsPage() 
{
    const { user } = useSelector(state => state.auth);
    const { t, i18n } = useTranslation();
    const [active_section, set_active_section] = useState('account');
    const [saved, set_saved] = useState(false);

    const [settings, set_settings] = useState({
        // account
        email_notifications: true,
        browser_notifications: false,

        // privacy
        profile_visibility: 'public',
        show_email: false,
        show_online_status: true,

        // appearance
        theme: 'dark',
        font_size: 'medium',
        language: i18n.language || 'uk',

        // content
        posts_per_page: 10,
        default_sort: 'latest',
        show_nsfw: false
    });

    const handle_change = (key, value) => {
        set_settings(prev => ({ ...prev, [key]: value }));
        if(key === 'language') {
            i18n.changeLanguage(value);
        }
        set_saved(false);
    };

    const handle_save = () => {
        // TODO: Save to backend
        console.log('Saving settings:', settings);
        set_saved(true);
        setTimeout(() => set_saved(false), 3000);
    };

    const sections = [
        { id: 'account', icon: <FiUser />, title: t('settings_page.sidebar.account') },
        { id: 'privacy', icon: <FiShield />, title: t('settings_page.sidebar.privacy') },
        { id: 'notifications', icon: <FiBell />, title: t('settings_page.sidebar.notifications') },
        { id: 'appearance', icon: <FiMonitor />, title: t('settings_page.sidebar.appearance') },
        { id: 'content', icon: <FiGlobe />, title: t('settings_page.sidebar.content') }
    ];

    return (
        <>
            <Header />
            <div className = "settings-page">
                <div className = "container">
                    <div className = "settings-header">
                        <h1 className = "gradient-text">{t('settings.title')}</h1>
                        <p className = "settings-subtitle">{t('settings_page.subtitle')}</p>
                    </div>

                    <div className = "settings-layout">
                        {/* Sidebar */}
                        <aside className = "settings-sidebar">
                            <nav className = "settings-nav">
                                {sections.map(section => (
                                    <button
                                        key = {section.id}
                                        className = {`settings-nav-item ${active_section === section.id ? 'active' : ''}`}
                                        onClick = {() => set_active_section(section.id)}
                                    >
                                        {section.icon}
                                        <span>{section.title}</span>
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* Main Content */}
                        <main className = "settings-content">
                            {/* Account Section */}
                            {active_section === 'account' && (
                                <div className = "settings-section">
                                    <h2 className = "section-title">{t('settings_page.account.title')}</h2>

                                    <div className = "settings-group">
                                        <h3 className = "group-title">{t('settings_page.account.email_preferences.title')}</h3>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiMail />
                                                <div>
                                                    <h4>{t('settings_page.account.email_preferences.email_notifications.title')}</h4>
                                                    <p>{t('settings_page.account.email_preferences.email_notifications.description')}</p>
                                                </div>
                                            </div>
                                            <label className = "toggle">
                                                <input
                                                    type = "checkbox"
                                                    checked = {settings.email_notifications}
                                                    onChange = {(e) => handle_change('email_notifications', e.target.checked)}
                                                />
                                                <span className = "toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className = "settings-group">
                                        <h3 className = "group-title">{t('settings_page.account.info.title')}</h3>
                                        <div className = "info-grid">
                                            <div className = "info-item">
                                                <label>{t('settings_page.account.info.username')}</label>
                                                <p>{user?.login}</p>
                                            </div>
                                            <div className = "info-item">
                                                <label>Email</label>
                                                <p>{user?.email}</p>
                                            </div>
                                            <div className = "info-item">
                                                <label>{t('settings_page.account.info.member_since')}</label>
                                                <p>{new Date().toLocaleDateString(i18n.language || undefined)}</p>
                                            </div>
                                            <div className = "info-item">
                                                <label>{t('settings_page.account.info.account_type')}</label>
                                                <p className = "badge">{user?.role === 'admin' ? 'Admin' : 'User'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Privacy Section */}
                            {active_section === 'privacy' && (
                                <div className = "settings-section">
                                    <h2 className = "section-title">{t('settings_page.privacy.title')}</h2>
                                    
                                    <div className = "settings-group">
                                        <h3 className = "group-title">{t('settings_page.privacy.profile_visibility.title')}</h3>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiEye />
                                                <div>
                                                    <h4>{t('settings_page.privacy.profile_visibility.setting_title')}</h4>
                                                    <p>{t('settings_page.privacy.profile_visibility.setting_description')}</p>
                                                </div>
                                            </div>
                                            <select
                                                className = "select-input"
                                                value = {settings.profile_visibility}
                                                onChange = {(e) => handle_change('profile_visibility', e.target.value)}
                                            >
                                                <option value = "public">{t('settings_page.privacy.profile_visibility.options.public')}</option>
                                                <option value = "members">{t('settings_page.privacy.profile_visibility.options.members')}</option>
                                                <option value = "private">{t('settings_page.privacy.profile_visibility.options.private')}</option>
                                            </select>
                                        </div>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiMail />
                                                <div>
                                                    <h4>{t('settings_page.privacy.show_email.title')}</h4>
                                                    <p>{t('settings_page.privacy.show_email.description')}</p>
                                                </div>
                                            </div>
                                            <label className = "toggle">
                                                <input
                                                    type = "checkbox"
                                                    checked = {settings.show_email}
                                                    onChange = {(e) => handle_change('show_email', e.target.checked)}
                                                />
                                                <span className = "toggle-slider"></span>
                                            </label>
                                        </div>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiUser />
                                                <div>
                                                    <h4>{t('settings_page.privacy.online_status.title')}</h4>
                                                    <p>{t('settings_page.privacy.online_status.description')}</p>
                                                </div>
                                            </div>
                                            <label className = "toggle">
                                                <input
                                                    type = "checkbox"
                                                    checked = {settings.show_online_status}
                                                    onChange = {(e) => handle_change('show_online_status', e.target.checked)}
                                                />
                                                <span className = "toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Section */}
                            {active_section === 'notifications' && (
                                <div className = "settings-section">
                                    <h2 className = "section-title">{t('settings_page.notifications.title')}</h2>

                                    <div className = "settings-group">
                                        <h3 className = "group-title">{t('settings_page.notifications.channels.title')}</h3>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiMail />
                                                <div>
                                                    <h4>{t('settings_page.notifications.channels.email.title')}</h4>
                                                    <p>{t('settings_page.notifications.channels.email.description')}</p>
                                                </div>
                                            </div>
                                            <label className = "toggle">
                                                <input
                                                    type = "checkbox"
                                                    checked = {settings.email_notifications}
                                                    onChange = {(e) => handle_change('email_notifications', e.target.checked)}
                                                />
                                                <span className = "toggle-slider"></span>
                                            </label>
                                        </div>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiBell />
                                                <div>
                                                    <h4>{t('settings_page.notifications.channels.browser.title')}</h4>
                                                    <p>{t('settings_page.notifications.channels.browser.description')}</p>
                                                </div>
                                            </div>
                                            <label className = "toggle">
                                                <input
                                                    type = "checkbox"
                                                    checked = {settings.browser_notifications}
                                                    onChange = {(e) => handle_change('browser_notifications', e.target.checked)}
                                                />
                                                <span className = "toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Appearance Section */}
                            {active_section === 'appearance' && (
                                <div className = "settings-section">
                                    <h2 className = "section-title">{t('settings_page.appearance.title')}</h2>

                                    <div className = "settings-group">
                                        <h3 className = "group-title">{t('settings_page.appearance.display.title')}</h3>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiMonitor />
                                                <div>
                                                    <h4>{t('settings_page.appearance.display.theme.title')}</h4>
                                                    <p>{t('settings_page.appearance.display.theme.description')}</p>
                                                </div>
                                            </div>
                                            <select 
                                                className = "select-input"
                                                value = {settings.theme}
                                                onChange = {(e) => handle_change('theme', e.target.value)}
                                            >
                                                <option value = "dark">{t('settings_page.appearance.display.theme.options.dark')}</option>
                                                <option value = "light">{t('settings_page.appearance.display.theme.options.light')}</option>
                                                <option value = "auto">{t('settings_page.appearance.display.theme.options.auto')}</option>
                                            </select>
                                        </div>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiMonitor />
                                                <div>
                                                    <h4>{t('settings_page.appearance.display.font_size.title')}</h4>
                                                    <p>{t('settings_page.appearance.display.font_size.description')}</p>
                                                </div>
                                            </div>
                                            <select 
                                                className = "select-input"
                                                value = {settings.font_size}
                                                onChange = {(e) => handle_change('font_size', e.target.value)}
                                            >
                                                <option value = "small">{t('settings_page.appearance.display.font_size.options.small')}</option>
                                                <option value = "medium">{t('settings_page.appearance.display.font_size.options.medium')}</option>
                                                <option value = "large">{t('settings_page.appearance.display.font_size.options.large')}</option>
                                            </select>
                                        </div>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiGlobe />
                                                <div>
                                                    <h4>{t('settings_page.appearance.language.title')}</h4>
                                                    <p>{t('settings_page.appearance.language.description')}</p>
                                                </div>
                                            </div>
                                            <div className = "language-selector">
                                                <button
                                                    className = {`language-btn ${settings.language === 'uk' ? 'active' : ''}`}
                                                    onClick = {() => handle_change('language', 'uk')}
                                                    title = {t('settings_page.appearance.language.options.uk.tooltip')}
                                                >
                                                    <span className = "flag-icon">🇺🇦</span>
                                                    <span className = "language-name">{t('settings_page.appearance.language.options.uk.label')}</span>
                                                </button>
                                                <button
                                                    className = {`language-btn ${settings.language === 'en' ? 'active' : ''}`}
                                                    onClick = {() => handle_change('language', 'en')}
                                                    title = {t('settings_page.appearance.language.options.en.tooltip')}
                                                >
                                                    <span className = "flag-icon">🇬🇧</span>
                                                    <span className = "language-name">{t('settings_page.appearance.language.options.en.label')}</span>
                                                </button>
                                                <button
                                                    className = {`language-btn ${settings.language === 'de' ? 'active' : ''}`}
                                                    onClick = {() => handle_change('language', 'de')}
                                                    title = {t('settings_page.appearance.language.options.de.tooltip')}
                                                >
                                                    <span className = "flag-icon">🇩🇪</span>
                                                    <span className = "language-name">{t('settings_page.appearance.language.options.de.label')}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Content Preferences Section */}
                            {active_section === 'content' && (
                                <div className = "settings-section">
                                    <h2 className = "section-title">{t('settings_page.content.title')}</h2>
                                    
                                    <div className = "settings-group">
                                        <h3 className = "group-title">{t('settings_page.content.feed.title')}</h3>
                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiGlobe />
                                                <div>
                                                    <h4>{t('settings_page.content.feed.posts_per_page.title')}</h4>
                                                    <p>{t('settings_page.content.feed.posts_per_page.description')}</p>
                                                </div>
                                            </div>
                                            <select 
                                                className = "select-input"
                                                value = {settings.posts_per_page}
                                                onChange = {(e) => handle_change('posts_per_page', parseInt(e.target.value))}
                                            >
                                                <option value = "10">{t('settings_page.content.feed.posts_per_page.options.ten')}</option>
                                                <option value = "25">{t('settings_page.content.feed.posts_per_page.options.twenty_five')}</option>
                                                <option value = "50">{t('settings_page.content.feed.posts_per_page.options.fifty')}</option>
                                            </select>
                                        </div>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiGlobe />
                                                <div>
                                                    <h4>{t('settings_page.content.feed.default_sort.title')}</h4>
                                                    <p>{t('settings_page.content.feed.default_sort.description')}</p>
                                                </div>
                                            </div>
                                            <select 
                                                className = "select-input"
                                                value = {settings.default_sort}
                                                onChange = {(e) => handle_change('default_sort', e.target.value)}
                                            >
                                                <option value = "latest">{t('settings_page.content.feed.default_sort.options.latest')}</option>
                                                <option value = "popular">{t('settings_page.content.feed.default_sort.options.popular')}</option>
                                                <option value = "trending">{t('settings_page.content.feed.default_sort.options.trending')}</option>
                                            </select>
                                        </div>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiEye />
                                                <div>
                                                    <h4>{t('settings_page.content.feed.show_nsfw.title')}</h4>
                                                    <p>{t('settings_page.content.feed.show_nsfw.description')}</p>
                                                </div>
                                            </div>
                                            <label className = "toggle">
                                                <input
                                                    type = "checkbox"
                                                    checked = {settings.show_nsfw}
                                                    onChange = {(e) => handle_change('show_nsfw', e.target.checked)}
                                                />
                                                <span className = "toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            <div className = "settings-footer">
                                <button
                                    className = {`btn ${saved ? 'btn-success' : 'btn-gradient'}`}
                                    onClick = {handle_save}
                                >
                                    {saved ? (
                                        <>
                                            <FiCheck /> {t('settings_page.actions.saved')}
                                        </>
                                    ) : (
                                        <>
                                            <FiSave /> {t('settings_page.actions.save')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
