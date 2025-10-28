import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiBookmark, FiClock, FiMessageCircle, FiX } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { IoHeartDislike } from 'react-icons/io5';
import Header from '../components/Header/Header';
import '../style/saved-posts.css';
import { useTranslation } from 'react-i18next';

export default function SavedPostsPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector(state => state.auth);
    const [saved_posts, set_saved_posts] = useState([]);
    const [loading, set_loading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        if(!isAuthenticated) 
            {
            navigate('/login');
            return;
        }
        fetch_saved_posts();
    }, [isAuthenticated]);

    const fetch_saved_posts = async () => {
        try 
        {
            set_loading(true);
            const response = await fetch('/api/users/saved-posts', {
                credentials: 'include'
            });

            const data = await response.json();
            
            if(data.status === 'success') set_saved_posts(data.data || []);
        } catch(error) 
        {
            console.error('Error fetching saved posts:', error);
        } finally 
        {
            set_loading(false);
        }
    };

    const handle_unsave = async (post_id, event) => {
        event.stopPropagation();
        
        if(!window.confirm(t('saved_posts.confirm_unsave'))) return;

        try 
        {
            const response = await fetch(`/api/posts/${post_id}/save`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();
            
            if(data.status === 'success') set_saved_posts(prev => prev.filter(sp => sp.post_id !== post_id));
        } catch(error) 
        {
            console.error('Error unsaving post:', error);
            alert(t('saved_posts.error_unsave'));
        }
    };

    const format_date = (date_string) => {
        const date = new Date(date_string);
        const now = new Date();
        const diff = now - date;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if(seconds < 60) return t('common.time.just_now');
        if(minutes < 60) return t('common.time.minutes_ago', { count: minutes });
        if(hours < 24) return t('common.time.hours_ago', { count: hours });
        if(days === 1) return t('common.time.yesterday');
        if(days < 7) return t('common.time.days_ago', { count: days });
        if(weeks < 4) return t('common.time.weeks_ago', { count: weeks });
        if(months < 12) return t('common.time.months_ago', { count: months });
        return t('common.time.years_ago', { count: years });
    };

    const strip_markdown = (text) => {
        if(!text) return '';
        
        return text
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`[^`]+`/g, '')
            .replace(/(\*\*|__)(.*?)\1/g, '$2')
            .replace(/(\*|_)(.*?)\1/g, '$2')
            .replace(/^#{1,6}\s+/gm, '')
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
            .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
            .replace(/^>\s+/gm, '')
            .replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '')
            .replace(/^[\s]*[-*+]\s+/gm, '')
            .replace(/^[\s]*\d+\.\s+/gm, '')
            .replace(/\n\s*\n/g, '\n')
            .trim();
    };

    if(loading) 
        {
        return (
            <>
                <Header />
                <div className = "saved-posts-page">
                    <div className = "container">
                        <div className = "loading-spinner">{t('common.loading')}</div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className = "saved-posts-page">
                <div className = "container">
                    <div className = "page-header">
                        <div className = "header-content">
                            <FiBookmark className = "header-icon" />
                            <div>
                                <h1 className = "gradient-text">{t('saved_posts.title')}</h1>
                                <p className = "header-subtitle">
                                    {t('saved_posts.subtitle', { count: saved_posts.length })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {saved_posts.length === 0 ? (
                        <div className = "empty-state">
                            <FiBookmark className = "empty-icon" />
                            <h2>{t('saved_posts.empty_title')}</h2>
                            <p>
                                {t('saved_posts.empty_description_line1')}
                                <br />
                                {t('saved_posts.empty_description_line2')}
                            </p>
                            <button 
                                className = "btn btn-gradient saved-posts-browse-btn"
                                onClick = {() => navigate('/posts')}
                            >
                                {t('saved_posts.browse_posts_button')}
                            </button>
                        </div>
                    ) : (
                        <div className = "saved-posts-grid">
                            {saved_posts.map(saved => (
                                <div 
                                    key = {saved.id} 
                                    className = "saved-post-card"
                                    onClick = {() => navigate(`/posts/${saved.post_id}`)}
                                >
                                    <button 
                                        className = "unsave-btn"
                                        onClick = {(e) => handle_unsave(saved.post_id, e)}
                                        title = {t('saved_posts.remove_tooltip')}
                                    >
                                        <FiX />
                                    </button>

                                    <div className = "post-header">
                                        <span className = "author-name">
                                            @{saved.post.author.login}
                                        </span>
                                        <span className = "post-date">
                                            <FiClock /> {format_date(saved.post.publish_date)}
                                        </span>
                                    </div>

                                    <h3 className = "post-title">{saved.post.title}</h3>

                                    <p className = "post-excerpt">
                                        {strip_markdown(saved.post.content).substring(0, 200)}
                                        {saved.post.content && strip_markdown(saved.post.content).length > 200 ? '...' : ''}
                                    </p>

                                    <div className = "post-stats">
                                        <span className = "stat-item">
                                            <FaHeart /> {saved.post.stats.like_count}
                                        </span>
                                        <span className = "stat-item">
                                            <IoHeartDislike /> {saved.post.stats.dislike_count}
                                        </span>
                                        <span className = "stat-item">
                                            <FiMessageCircle /> {saved.post.stats.comment_count}
                                        </span>
                                    </div>

                                    <div className = "saved-info">
                                        <FiBookmark />
                                        <span>{t('saved_posts.saved_label', { time: format_date(saved.saved_at) })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
