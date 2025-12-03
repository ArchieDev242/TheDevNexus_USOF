import React from 'react';
import { useTranslation } from 'react-i18next';
import 
{  
    FiCode, 
    FiUsers, 
    FiHeart,
    FiTrendingUp,
    FiMessageCircle,
    FiBook,
    FiZap,
    FiGlobe,
    FiStar,
    FiMonitor,
    FiCpu,
    FiBox,
    FiTarget,
    FiLayers
} from 'react-icons/fi';
import { SiUnrealengine, SiUnity, SiGodotengine, SiPython, SiVulkan } from 'react-icons/si';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './about.css';

export default function AboutPage() 
{
    const { t } = useTranslation();
    
    const engines = [
        { name: 'Unreal Engine', icon: <SiUnrealengine />, description: t('engines.unreal_engine') },
        { name: 'Unity', icon: <SiUnity />, description: t('engines.unity') },
        { name: 'Godot', icon: <SiGodotengine />, description: t('engines.godot') },
        { name: "Ren'Py", icon: <SiPython />, description: 'Спеціалізований для візуальних новел' },
        { name: 'GameMaker', icon: <FiTarget />, description: '2D ігри для багатьох платформ' },
        { name: 'CryEngine', icon: <FiZap />, description: 'Професійний двигун для AAA проектів' },
        { name: 'Custom Engines', icon: <SiVulkan />, description: 'Власні розробки розробників' },
        { name: 'OpenGL / Vulkan', icon: <FiLayers />, description: 'Low-level графічні фреймворки' }
    ];

    const features = [
        {
            icon: <FiUsers />,
            title: t('about.ukrainian_community'),
            description: t('about.ukrainian_community_desc')
        },
        {
            icon: <FiCode />,
            title: t('about.for_all_levels'),
            description: t('about.for_all_levels_desc')
        },
        {
            icon: <FiBook />,
            title: t('about.knowledge_base'),
            description: t('about.knowledge_base_desc')
        },
        {
            icon: <FiMessageCircle />,
            title: t('about.active_discussions'),
            description: t('about.active_discussions_desc')
        },
        {
            icon: <FiZap />,
            title: t('about.quick_help'),
            description: t('about.quick_help_desc')
        },
        {
            icon: <FiHeart />,
            title: t('about.open_source'),
            description: t('about.open_source_desc')
        }
    ];

    return (
        <>
            <Header />
            <div className = "about-page">
                <div className = "animated-background"></div>
                <div className = "container">
                    {/* Hero Section */}
                    <section className = "about-hero">
                        <h1 className = "gradient-text">
                            {t('about.page_title')}
                        </h1>
                        <p className = "hero-subtitle-about">
                            {t('about.page_subtitle')}
                        </p>
                    </section>

                    {/* Mission Section */}
                    <section className = "about-mission">
                        <div className = "mission-card">
                            <div className = "mission-icon">
                                <FiGlobe size = {48} />
                            </div>
                            <h2 className = "gradient-text">{t('about.mission')}</h2>
                            <p>
                                {t('about.mission_text')}
                            </p>
                        </div>
                    </section>

                    {/* Target Audience */}
                    <section className = "about-audience">
                        <h2 className = "section-title">
                            <span className = "gradient-text">{t('about.who_is_for')}</span>
                        </h2>
                        <div className = "audience-grid">
                            <div className = "audience-card">
                                <div className = "audience-icon"><FiMonitor size={48} /></div>
                                <h3>{t('about.game_developers')}</h3>
                                <p>
                                    {t('about.game_developers_desc')}
                                </p>
                            </div>
                            <div className = "audience-card">
                                <div className = "audience-icon"><FiCpu size={48} /></div>
                                <h3>{t('about.modders')}</h3>
                                <p>
                                    {t('about.modders_desc')}
                                </p>
                            </div>
                            <div className = "audience-card">
                                <div className = "audience-icon"><FiBox size={48} /></div>
                                <h3>{t('about.engine_engineers')}</h3>
                                <p>
                                    {t('about.engine_engineers_desc')}
                                </p>
                            </div>
                            <div className = "audience-card">
                                <div className = "audience-icon"><FiBook size={48} /></div>
                                <h3>{t('about.beginners')}</h3>
                                <p>
                                    {t('about.beginners_desc')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Supported Engines */}
                    <section className = "about-engines">
                        <h2 className = "section-title">
                            <span className = "gradient-text">{t('about.supported_technologies')}</span>
                        </h2>
                        <p className = "engines-description">
                            {t('about.supported_technologies_desc')}
                        </p>
                        <div className = "engines-grid">
                            {engines.map((engine, index) => (
                                <div key = {index} className = "engine-card">
                                    <div className = "engine-icon">{engine.icon}</div>
                                    <h4>{engine.name}</h4>
                                    {engine.description && <p className = "engine-description">{engine.description}</p>}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Features */}
                    <section className = "about-features">
                        <h2 className = "section-title">
                            <span className = "gradient-text">{t('about.what_we_offer')}</span>
                        </h2>
                        <div className = "features-grid">
                            {features.map((feature, index) => (
                                <div key = {index} className = "feature-card">
                                    <div className = "feature-icon">
                                        {feature.icon}
                                    </div>
                                    <h3>{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Stats */}
                    <section className = "about-stats">
                        <div className = "stats-grid">
                            <div className = "stat-card">
                                <FiUsers size = {40} />
                                <h3 className = "stat-number">500+</h3>
                                <p>{t('about.active_users')}</p>
                            </div>
                            <div className = "stat-card">
                                <FiMessageCircle size = {40} />
                                <h3 className = "stat-number">1000+</h3>
                                <p>{t('about.discussions')}</p>
                            </div>
                            <div className = "stat-card">
                                <FiStar size = {40} />
                                <h3 className = "stat-number">8</h3>
                                <p>{t('about.game_engines')}</p>
                            </div>
                            <div className = "stat-card">
                                <FiTrendingUp size = {40} />
                                <h3 className = "stat-number">100%</h3>
                                <p>{t('about.ukrainian_language')}</p>
                            </div>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className = "about-cta">
                        <div className = "cta-content">
                            <h2 className = "gradient-text">{t('about.join_community')}</h2>
                            <p>
                                {t('about.join_community_desc')}
                            </p>
                            <div className = "cta-buttons">
                                <a href = "/register" className = "btn btn-gradient">
                                    {t('about.sign_up')}
                                </a>
                                <a href = "/posts" className = "btn btn-outline">
                                    {t('about.view_posts')}
                                </a>
                            </div>
                        </div>
                    </section>
                    
                </div>
            </div>
            <Footer />
        </>
    );
}
