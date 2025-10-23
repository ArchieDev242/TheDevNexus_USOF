import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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

import Header from '../components/Header';
import '../style/settings.css';

export default function SettingsPage() 
{
    const { user } = useSelector(state => state.auth);
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
        language: 'uk',

        // content
        posts_per_page: 10,
        default_sort: 'latest',
        show_nsfw: false
    });

    const handle_change = (key, value) => {
        set_settings(prev => ({ ...prev, [key]: value }));
        set_saved(false);
    };

    const handle_save = () => {
        // TODO: Save to backend
        console.log('Saving settings:', settings);
        set_saved(true);
        setTimeout(() => set_saved(false), 3000);
    };

    const sections = [
        { id: 'account', icon: <FiUser />, title: 'Account' },
        { id: 'privacy', icon: <FiShield />, title: 'Privacy & Security' },
        { id: 'notifications', icon: <FiBell />, title: 'Notifications' },
        { id: 'appearance', icon: <FiMonitor />, title: 'Appearance' },
        { id: 'content', icon: <FiGlobe />, title: 'Content Preferences' }
    ];

    return (
        <>
            <Header />
            <div className = "settings-page">
                <div className = "container">
                    <div className = "settings-header">
                        <h1 className = "gradient-text">Settings</h1>
                        <p className = "settings-subtitle">Manage your account settings and preferences</p>
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
                                    <h2 className = "section-title">Account Settings</h2>

                                    <div className = "settings-group">
                                        <h3 className = "group-title">Email Preferences</h3>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiMail />
                                                <div>
                                                    <h4>Email Notifications</h4>
                                                    <p>Receive email notifications about your activity</p>
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
                                        <h3 className = "group-title">Account Information</h3>
                                        <div className = "info-grid">
                                            <div className = "info-item">
                                                <label>Username</label>
                                                <p>{user?.login}</p>
                                            </div>
                                            <div className = "info-item">
                                                <label>Email</label>
                                                <p>{user?.email}</p>
                                            </div>
                                            <div className = "info-item">
                                                <label>Member Since</label>
                                                <p>{new Date().toLocaleDateString()}</p>
                                            </div>
                                            <div className = "info-item">
                                                <label>Account Type</label>
                                                <p className = "badge">{user?.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Privacy Section */}
                            {active_section === 'privacy' && (
                                <div className = "settings-section">
                                    <h2 className = "section-title">Privacy & Security</h2>
                                    
                                    <div className = "settings-group">
                                        <h3 className = "group-title">Profile Visibility</h3>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiEye />
                                                <div>
                                                    <h4>Who can see your profile</h4>
                                                    <p>Control who can view your profile information</p>
                                                </div>
                                            </div>
                                            <select
                                                className = "select-input"
                                                value = {settings.profile_visibility}
                                                onChange = {(e) => handle_change('profile_visibility', e.target.value)}
                                            >
                                                <option value = "public">Public</option>
                                                <option value = "members">Members Only</option>
                                                <option value = "private">Private</option>
                                            </select>
                                        </div>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiMail />
                                                <div>
                                                    <h4>Show Email on Profile</h4>
                                                    <p>Display your email address on your public profile</p>
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
                                                    <h4>Online Status</h4>
                                                    <p>Show when you're online to other members</p>
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
                                    <h2 className = "section-title">Notification Preferences</h2>

                                    <div className = "settings-group">
                                        <h3 className = "group-title">Notification Channels</h3>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiMail />
                                                <div>
                                                    <h4>Email Notifications</h4>
                                                    <p>Get notified via email about important updates</p>
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
                                                    <h4>Browser Notifications</h4>
                                                    <p>Receive push notifications in your browser</p>
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
                                    <h2 className = "section-title">Appearance</h2>

                                    <div className = "settings-group">
                                        <h3 className = "group-title">Display Settings</h3>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiMonitor />
                                                <div>
                                                    <h4>Theme</h4>
                                                    <p>Choose your preferred color scheme</p>
                                                </div>
                                            </div>
                                            <select 
                                                className = "select-input"
                                                value = {settings.theme}
                                                onChange = {(e) => handle_change('theme', e.target.value)}
                                            >
                                                <option value = "dark">Dark</option>
                                                <option value = "light">Light</option>
                                                <option value = "auto">Auto</option>
                                            </select>
                                        </div>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiMonitor />
                                                <div>
                                                    <h4>Font Size</h4>
                                                    <p>Adjust the text size for better readability</p>
                                                </div>
                                            </div>
                                            <select 
                                                className = "select-input"
                                                value = {settings.font_size}
                                                onChange = {(e) => handle_change('font_size', e.target.value)}
                                            >
                                                <option value = "small">Small</option>
                                                <option value = "medium">Medium</option>
                                                <option value = "large">Large</option>
                                            </select>
                                        </div>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiGlobe />
                                                <div>
                                                    <h4>Language / Мова</h4>
                                                    <p>Select your preferred language</p>
                                                </div>
                                            </div>
                                            <div className = "language-selector">
                                                <button
                                                    className = {`language-btn ${settings.language === 'uk' ? 'active' : ''}`}
                                                    onClick = {() => handle_change('language', 'uk')}
                                                    title = "Українська"
                                                >
                                                    <span className = "flag-icon">🇺🇦</span>
                                                    <span className = "language-name">Українська</span>
                                                </button>
                                                <button
                                                    className = {`language-btn ${settings.language === 'en' ? 'active' : ''}`}
                                                    onClick = {() => handle_change('language', 'en')}
                                                    title = "English"
                                                >
                                                    <span className = "flag-icon">🇬🇧</span>
                                                    <span className = "language-name">English</span>
                                                </button>
                                                <button
                                                    className = {`language-btn ${settings.language === 'de' ? 'active' : ''}`}
                                                    onClick = {() => handle_change('language', 'de')}
                                                    title = "Deutsch"
                                                >
                                                    <span className = "flag-icon">🇩🇪</span>
                                                    <span className = "language-name">Deutsch</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Content Preferences Section */}
                            {active_section === 'content' && (
                                <div className = "settings-section">
                                    <h2 className = "section-title">Content Preferences</h2>
                                    
                                    <div className = "settings-group">
                                        <h3 className = "group-title">Feed Settings</h3>
                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiGlobe />
                                                <div>
                                                    <h4>Posts Per Page</h4>
                                                    <p>Number of posts to display per page</p>
                                                </div>
                                            </div>
                                            <select 
                                                className = "select-input"
                                                value = {settings.posts_per_page}
                                                onChange = {(e) => handle_change('posts_per_page', parseInt(e.target.value))}
                                            >
                                                <option value = "10">10 posts</option>
                                                <option value = "25">25 posts</option>
                                                <option value = "50">50 posts</option>
                                            </select>
                                        </div>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiGlobe />
                                                <div>
                                                    <h4>Default Sort Order</h4>
                                                    <p>How posts should be sorted by default</p>
                                                </div>
                                            </div>
                                            <select 
                                                className = "select-input"
                                                value = {settings.default_sort}
                                                onChange = {(e) => handle_change('default_sort', e.target.value)}
                                            >
                                                <option value = "latest">Latest</option>
                                                <option value = "popular">Most Popular</option>
                                                <option value = "trending">Trending</option>
                                            </select>
                                        </div>

                                        <div className = "setting-item">
                                            <div className = "setting-info">
                                                <FiEye />
                                                <div>
                                                    <h4>Show NSFW Content</h4>
                                                    <p>Display content marked as not safe for work</p>
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
                                            <FiCheck /> Saved Successfully!
                                        </>
                                    ) : (
                                        <>
                                            <FiSave /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
