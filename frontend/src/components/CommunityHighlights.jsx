import React from 'react';
import { FiStar, FiAward, FiFileText, FiPackage, FiDownload, FiUserPlus, FiClock } from 'react-icons/fi';

export default function CommunityHighlights() 
{
    const top_contributors = [
        { id: 1, name: 'GameDevPro', posts: 245, rank: 1 },
        { id: 2, name: 'CodeMaster', posts: 198, rank: 2 },
        { id: 3, name: 'ArtWizard', posts: 176, rank: 3 }
    ];
    
    const latest_resources = [
        'Free 3D Models Pack',
        'Ultimate Shader Guide',
        'Game Design eBook',
        'Unity Best Practices'
    ];
    
    return (
        <section className = "community-section">
            <div className = "container">
                <h2 className = "section-title">
                    <span className = "gradient-text">Community Highlights</span>
                </h2>
                
                <div className = "community-grid">
                    <div className = "featured-card">
                        <div className = "featured-badge">
                            <FiStar /> Featured
                        </div>
                        <div className = "featured-content">
                            <h3 className = "featured-title">
                                The Future of Indie Game Development
                            </h3>
                            <p className = "featured-description">
                                An in-depth look at how indie developers are shaping the future of gaming with innovative approaches and technologies...
                            </p>
                            <div className = "featured-author">
                                <div className = "author-avatar">IV</div>
                                <span>Posted by IndieVision</span>
                                <div className = "featured-meta">
                                    <FiClock /> 3h ago
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className = "sidebar-cards">
                        <div className = "info-card">
                            <h3 className = "card-title">
                                <FiAward /> Top Contributors
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
                                                <FiFileText /> {user.posts} posts
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
                                <FiPackage /> Latest Resources
                            </h3>
                            <div className = "resources-list">
                                {latest_resources.map((resource, i) => (
                                    <div key = {i} className = "resource-item">
                                        <FiDownload className = "resource-icon" />
                                        <span>{resource}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className = "cta-section">
                    <h2 className = "cta-title">
                        <span className = "gradient-text">Ready to Level Up?</span>
                    </h2>
                    <p className = "cta-description">
                        Join thousands of game developers and enthusiasts in our thriving community.
                    </p>
                    <button className = "btn btn-gradient">
                        <FiUserPlus /> Create Free Account
                    </button>
                </div>
            </div>
        </section>
    );
}
