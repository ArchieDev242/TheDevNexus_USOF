import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FiMessageSquare, FiHeart, FiClock, FiChevronRight } from 'react-icons/fi';

export default function TrendingPosts() 
{
    const { posts, loading } = useSelector(state => state.posts);
    const { t } = useTranslation();
    
    if(loading) return <div className="loading-spinner">{t('common.loading')}</div>;
    
    const display_posts = Array.isArray(posts) ? posts.slice(0, 6) : [];
    
    return (
        <section className = "trending-section">
            <div className = "container">
                <div className = "section-header">
                    <h2 className = "section-title">
                        <span className = "gradient-text">{t('home.trending')}</span>
                    </h2>
                    <a href = "/posts" className = "view-all-link">
                        {t('home.view_all')} <FiChevronRight />
                    </a>
                </div>

                <div className = "posts-grid">
                    {display_posts.length > 0 ? (
                        display_posts.map((post) => (
                            <div key = {post.id} className = "post-card">
                                <div className = "post-card-header">
                                    <div className = "post-author">
                                        <div className = "author-avatar">
                                            {post.author_avatar ? (
                                                <img 
                                                    src = {post.author_avatar} 
                                                    alt = {post.author_name} 
                                                    style = {{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '50%' }}
                                                />
                                            ) : (
                                                <img 
                                                    src = "/user/avatar.jpg" 
                                                    alt = {post.author_name} 
                                                    style = {{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '50%' }}
                                                />
                                            )}
                                        </div>
                                        <div className = "author-info">
                                            <h3 className = "post-title">{post.title}</h3>
                                            <p className = "author-name">
                                                {t('home.by_author', { author: post.author_name || t('common.anonymous') })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p className = "post-excerpt">
                                    {post.content?.substring(0, 120)}...
                                </p>
                                <div className = "post-meta">
                                    <div className = "meta-item">
                                        <FiMessageSquare />
                                        <span>{t('home.trending_comments', { count: post.comments_count || 0 })}</span>
                                    </div>
                                    <div className = "meta-item">
                                        <FiHeart />
                                        <span>{t('home.trending_likes', { count: post.likes || 0 })}</span>
                                    </div>
                                    <div className = "meta-item">
                                        <FiClock />
                                        <span>{t('home.trending_recent_time')}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className = "no-posts">
                            <p>{t('home.trending_empty')}</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
