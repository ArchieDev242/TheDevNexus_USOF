import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiBookmark, FiClock, FiMessageCircle, FiX } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { IoHeartDislike } from 'react-icons/io5';
import Header from '../components/Header';
import '../style/saved-posts.css';

export default function SavedPostsPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const [saved_posts, set_saved_posts] = useState([]);
    const [loading, set_loading] = useState(true);

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
        
        if(!window.confirm('Прибрати цей пост зі збережених?')) return;

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
            alert('Помилка видалення поста зі збережених');
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

        if(seconds < 60) return 'щойно';
        if(minutes < 60) return `${minutes} хв тому`;
        if(hours < 24) return `${hours} год тому`;
        if(days === 1) return 'вчора';
        if(days < 7) return `${days} дн тому`;
        if(weeks < 4) return `${weeks} тиж тому`;
        if(months < 12) return `${months} міс тому`;
        
        const years_txt = years === 1 ? 'рік' : years < 5 ? 'роки' : 'років';
        return `${years} ${years_txt} тому`;
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
                        <div className = "loading-spinner">Завантаження...</div>
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
                                <h1 className = "gradient-text">Збережені пости</h1>
                                <p className = "header-subtitle">
                                    Ваша колекція збережених постів ({saved_posts.length})
                                </p>
                            </div>
                        </div>
                    </div>

                    {saved_posts.length === 0 ? (
                        <div className = "empty-state">
                            <FiBookmark className = "empty-icon" />
                            <h2>Немає збережених постів</h2>
                            <p>
                                Збережіть цікаві пости щоб повернутися до них пізніше.
                                <br />
                                Натисніть на іконку закладки під постом щоб зберегти його.
                            </p>
                            <button 
                                className = "btn btn-gradient"
                                onClick = {() => navigate('/posts')}
                            >
                                Переглянути пости
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
                                        title = "Прибрати зі збережених"
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
                                        <span>Збережено {format_date(saved.saved_at)}</span>
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
