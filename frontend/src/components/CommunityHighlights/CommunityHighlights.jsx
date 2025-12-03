import React from 'react';
import { FiStar, FiAward, FiFileText, FiPackage, FiDownload, FiUserPlus, FiClock } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import './CommunityHighlights.css'

export default function CommunityHighlights() 
{
    const top_contributors = [
        { id: 1, name: 'GameDevPro', posts: 245, rank: 1 },
        { id: 2, name: 'CodeMaster', posts: 198, rank: 2 },
        { id: 3, name: 'ArtWizard', posts: 176, rank: 3 }
    ];
    
    const { t } = useTranslation();

    const latest_resources = [
        'home.community_resource_1',
        'home.community_resource_2',
        'home.community_resource_3',
        'home.community_resource_4'
    ];
    
    return (
        <section className = "community-section">
            <div className = "container">
                <h2 className = "section-title">
                    <span className = "gradient-text">{t('home.community_title')}</span>
                </h2>
                
                <div className = "community-grid">
                    <div className = "featured-card">
                        <div className = "featured-badge">
                            <FiStar /> {t('home.community_featured_badge')}
                        </div>
                        <div className = "featured-content">
                            <h3 className = "featured-title">
                                {t('home.community_featured_title')}
                            </h3>
                            <p className = "featured-description">
                                {t('home.community_featured_description')}
                            </p>
                            <div className = "featured-author">
                                <div className = "author-avatar">IV</div>
                                <span>{t('home.community_posted_by', { author: 'IndieVision' })}</span>
                                <div className = "featured-meta">
                                    <FiClock /> {t('home.community_recent_time')}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className = "sidebar-cards">
                        <div className = "info-card">
                            <h3 className = "card-title">
                                <FiAward /> {t('home.community_top_contributors')}
                            </h3>
                            <div className = "contributors-list">
                                {top_contributors.map((user) => (
                                    <div key = {user.id} className = "contributor-item">
                                        <div className = "contributor-avatar">
                                            {user.name[0]}
                                        </div>
                                        <div className = "contributor-info">
                                            <h4>{user.name}</h4>
                                            <p>
                                                <FiFileText /> {t('home.community_posts_count', { count: user.posts })}
                                            </p>
                                        </div>
                                        <div className = "contributor-score">
                                            <FiStar /> {user.rank * 56}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className = "info-card">
                            <h3 className = "card-title">
                                <FiPackage /> {t('home.community_latest_resources')}
                            </h3>
                            <div className = "resources-list">
                                {latest_resources.map((resource, i) => (
                                    <div key = {i} className = "resource-item">
                                        <FiDownload className = "resource-icon" />
                                        <span>{t(resource)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className = "cta-section">
                    <h2 className = "cta-title">
                        <span className = "gradient-text">{t('home.community_cta_title')}</span>
                    </h2>
                    <p className = "cta-description">
                        {t('home.community_cta_description')}
                    </p>
                    <button className = "btn btn-gradient">
                        <FiUserPlus /> {t('home.community_cta_button')}
                    </button>
                </div>
            </div>
        </section>
    );
}
