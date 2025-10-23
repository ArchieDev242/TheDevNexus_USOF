import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../style/user-profile.css';

const UserProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const current_user = useSelector((state) => state.auth.user);
    
    const [user, set_user] = useState(null);
    const [posts, set_posts] = useState([]);
    const [achievements, set_achievements] = useState([]);
    const [rating, set_rating] = useState(null);
    const [loading, set_loading] = useState(true);
    const [active_tab, set_active_tab] = useState('posts');

    useEffect(() => {
        fetch_user_data();
    }, [userId]);

    const fetch_user_data = async () => {
        try {
            set_loading(true);

            // Fetch user profile
            const user_res = await fetch(`/api/users/${userId}`, {
                credentials: 'include'
            });
            const user_data = await user_res.json();
            set_user(user_data.data);

            // Fetch user rating
            const rating_res = await fetch(`/api/likes/user/${userId}/rating`, {
                credentials: 'include'
            });
            const rating_data = await rating_res.json();
            set_rating(rating_data);

            // Fetch user posts
            const posts_res = await fetch(`/api/users/${userId}/posts?limit=10`, {
                credentials: 'include'
            });
            const posts_data = await posts_res.json();
            set_posts(posts_data.data);

            // Fetch user achievements
            const achievements_res = await fetch(`/api/users/${userId}/achievements`, {
                credentials: 'include'
            });
            const achievements_data = await achievements_res.json();
            set_achievements(achievements_data.data);

        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            set_loading(false);
        }
    };

    const handle_rate_user = async (value) => {
        if (!current_user) {
            alert('Увійдіть щоб оцінити користувача');
            return;
        }

        if (current_user.id === parseInt(userId)) {
            alert('Ви не можете оцінити себе');
            return;
        }

        try {
            const res = await fetch(`/api/likes/user/${userId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ value })
            });

            if (res.ok) {
                // Refresh rating
                const rating_res = await fetch(`/api/likes/user/${userId}/rating`, {
                    credentials: 'include'
                });
                const rating_data = await rating_res.json();
                set_rating(rating_data);

                // Refresh user data to get updated rating
                const user_res = await fetch(`/api/users/${userId}`, {
                    credentials: 'include'
                });
                const user_data = await user_res.json();
                set_user(user_data.data);
            }
        } catch (error) {
            console.error('Error rating user:', error);
        }
    };

    const format_date = (date_string) => {
        const date = new Date(date_string);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'щойно';
        if (minutes < 60) return `${minutes} хв тому`;
        if (hours < 24) return `${hours} год тому`;
        if (days < 7) return `${days} дн тому`;
        
        return date.toLocaleDateString('uk-UA');
    };

    const strip_markdown = (text) => {
        if (!text) return '';
        
        // Remove code blocks
        text = text.replace(/```[\s\S]*?```/g, '[код]');
        // Remove inline code
        text = text.replace(/`([^`]+)`/g, '$1');
        // Remove bold
        text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
        // Remove italic
        text = text.replace(/\*([^*]+)\*/g, '$1');
        // Remove headers
        text = text.replace(/#{1,6}\s+/g, '');
        // Remove links
        text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        // Remove images
        text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
        // Remove blockquotes
        text = text.replace(/^>\s+/gm, '');
        // Remove list markers
        text = text.replace(/^[-*+]\s+/gm, '');
        
        return text.substring(0, 200) + (text.length > 200 ? '...' : '');
    };

    if (loading) {
        return (
            <div className="app">
                <Header />
                <main className="user-profile-page">
                    <div className="loading">Завантаження...</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="app">
                <Header />
                <main className="user-profile-page">
                    <div className="error">Користувача не знайдено</div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="app">
            <Header />
            <main className="user-profile-page">
                <div className="profile-container">
                    {/* User Header */}
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <img src={user.avatar} alt={user.login} />
                        </div>
                        <div className="profile-info">
                            <h1>{user.login}</h1>
                            <p className="profile-fullname">{user.full_name}</p>
                            <div className="profile-stats">
                                <div className="stat">
                                    <span className="stat-value">{user.rating}</span>
                                    <span className="stat-label">Рейтинг</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{posts?.length || 0}</span>
                                    <span className="stat-label">Постів</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{achievements?.length || 0}</span>
                                    <span className="stat-label">Ачівок</span>
                                </div>
                            </div>
                            <div className="profile-member-since">
                                Зареєстрований: {new Date(user.created_at).toLocaleDateString('uk-UA')}
                            </div>
                        </div>

                        {/* Rating Buttons */}
                        {current_user && current_user.id !== parseInt(userId) && (
                            <div className="profile-rating-buttons">
                                <button 
                                    className={`rating-btn like-btn ${rating?.user_vote === 1 ? 'active' : ''}`}
                                    onClick={() => handle_rate_user(1)}
                                    title="Лайк"
                                >
                                    <span>👍</span>
                                    <span>{rating?.likes_count || 0}</span>
                                </button>
                                <button 
                                    className={`rating-btn dislike-btn ${rating?.user_vote === -1 ? 'active' : ''}`}
                                    onClick={() => handle_rate_user(-1)}
                                    title="Дизлайк"
                                >
                                    <span>👎</span>
                                    <span>{rating?.dislikes_count || 0}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="profile-tabs">
                        <button 
                            className={`tab-btn ${active_tab === 'posts' ? 'active' : ''}`}
                            onClick={() => set_active_tab('posts')}
                        >
                            Пости ({posts?.length || 0})
                        </button>
                        <button 
                            className={`tab-btn ${active_tab === 'achievements' ? 'active' : ''}`}
                            onClick={() => set_active_tab('achievements')}
                        >
                            Ачівки ({achievements?.length || 0})
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="profile-content">
                        {active_tab === 'posts' && (
                            <div className="posts-list">
                                {!posts || posts.length === 0 ? (
                                    <div className="empty-state">Користувач ще не створював постів</div>
                                ) : (
                                    posts.map(post => (
                                        <div 
                                            key={post.id} 
                                            className="post-card"
                                            onClick={() => navigate(`/posts/${post.id}`)}
                                        >
                                            <div className="post-header">
                                                <h3>{post.title}</h3>
                                                <span className="post-date">{format_date(post.created_at)}</span>
                                            </div>
                                            <p className="post-preview">{strip_markdown(post.content)}</p>
                                            {post.categories && post.categories.length > 0 && (
                                                <div className="post-categories">
                                                    {post.categories.map((cat, idx) => (
                                                        <span key={idx} className="category-tag">{cat}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="post-stats">
                                                <span>❤️ {post.likes_count || 0}</span>
                                                <span>💬 {post.comments_count || 0}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {active_tab === 'achievements' && (
                            <div className="achievements-grid">
                                {!achievements || achievements.length === 0 ? (
                                    <div className="empty-state">Ачівок ще не отримано</div>
                                ) : (
                                    achievements.map(ach => (
                                        <div key={ach.id} className="achievement-card">
                                            <div className="achievement-icon">
                                                <img src={`/${ach.icon}`} alt={ach.title} />
                                            </div>
                                            <div className="achievement-info">
                                                <h4>{ach.title}</h4>
                                                <p>{ach.description}</p>
                                                <div className="achievement-meta">
                                                    <span className="achievement-points">+{ach.points} рейтингу</span>
                                                    <span className="achievement-date">
                                                        {new Date(ach.earned_at).toLocaleDateString('uk-UA')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default UserProfilePage;
