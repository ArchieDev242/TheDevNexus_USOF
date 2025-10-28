import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaHeart } from 'react-icons/fa';
import { BiLike, BiDislike } from 'react-icons/bi';
import { FiMessageCircle, FiFlag, FiEye } from 'react-icons/fi';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import ReportModal from '../components/ReportModal/ReportModal';
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
    const [show_report_modal, set_show_report_modal] = useState(false);
    const [post_stats_modal, set_post_stats_modal] = useState(null);

    useEffect(() => {
        console.log('useEffect triggered with userId:', userId);
        fetch_user_data();
    }, [userId]);

    const fetch_user_data = async () => {
        try 
        {
            set_loading(true);
            console.log('Fetching data for userId:', userId);

            const user_res = await fetch(`/api/users/${userId}`, { credentials: 'include' });
            if(!user_res.ok) throw new Error('User not found');
            
            const user_data = await user_res.json();
            console.log('User data fetched:', user_data);
            set_user(user_data.data);

            const rating_res = await fetch(`/api/likes/user/${userId}/rating`, { credentials: 'include' });
            const rating_data = await rating_res.json();
            set_rating(rating_data);

            const posts_res = await fetch(`/api/users/${userId}/posts?limit=10`, { credentials: 'include' });
            const posts_data = await posts_res.json();
            console.log('Posts data fetched:', posts_data);
            set_posts(posts_data.data || []);

            console.log('Fetching achievements for userId:', userId);
            const achievements_res = await fetch(`/api/users/${userId}/achievements`, { credentials: 'include' });
            const achievements_data = await achievements_res.json();
            console.log('Achievements response:', achievements_data);
            set_achievements(achievements_data.data || []);

        } catch(error) 
        {
            console.error('Error fetching user data:', error);
        } finally 
        {
            set_loading(false);
        }
    };

    const handle_rate_user = async (value) => {
        if(!current_user) 
            {
            alert('Увійдіть щоб оцінити користувача');
            return;
        }

        if(current_user.id === parseInt(userId)) 
            {
            alert('Ви не можете оцінити себе');
            return;
        }

        try 
        {
            const res = await fetch(`/api/likes/user/${userId}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ value })
            });

            if(res.ok) 
                {
                const rating_res = await fetch(`/api/likes/user/${userId}/rating`, { credentials: 'include' });
                const rating_data = await rating_res.json();
                set_rating(rating_data);

                const user_res = await fetch(`/api/users/${userId}`, { credentials: 'include' });
                const user_data = await user_res.json();
                set_user(user_data.data);
            }
        } catch(error) 
        {
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

        if(minutes < 1) return 'щойно';
        if(minutes < 60) return `${minutes} хв тому`;
        if(hours < 24) return `${hours} год тому`;
        if(days < 7) return `${days} дн тому`;
        return date.toLocaleDateString('uk-UA');
    };

    const strip_markdown = (text) => {
        if(!text) return '';
        text = text.replace(/```[\s\S]*?```/g, '[код]');
        text = text.replace(/`([^`]+)`/g, '$1');
        text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
        text = text.replace(/\*([^*]+)\*/g, '$1');
        text = text.replace(/#{1,6}\s+/g, '');
        text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
        text = text.replace(/^>\s+/gm, '');
        text = text.replace(/^[-*+]\s+/gm, '');
        return text.substring(0, 200) + (text.length > 200 ? '...' : '');
    };

    if(loading) 
        {
        return (
            <>
                <Header />
                <div className = "profile-loading-state">
                    <p>Завантаження...</p>
                </div>
                <Footer />
            </>
        );
    }

    if(!user) 
        {
        return (
            <>
                <Header />
                <div className = "profile-error-state">
                    <p>Користувача не знайдено</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className = "profile-wrapper">
                <div className = "profile-container">
                    {/* Left Sidebar */}
                    <aside className = "profile-sidebar">
                        <div className = "profile-card">
                            <div className = "avatar-container">
                                <img src = {user.avatar || '/user/avatar.jpg'} alt = {user.login} className = "avatar" />
                            </div>

                            <h1 className = "user-login">{user.login}</h1>
                            <p className = "user-fullname">{user.full_name}</p>

                            <div className = "stats-grid">
                                <div className = "stat-box">
                                    <span className = "stat-num">{user.rating}</span>
                                    <span className = "stat-name">Рейтинг</span>
                                </div>
                                <div className = "stat-box">
                                    <span className = "stat-num">{posts.length}</span>
                                    <span className = "stat-name">Постів</span>
                                </div>
                                <div className = "stat-box">
                                    <span className = "stat-num">{achievements.length}</span>
                                    <span className = "stat-name">Ачівок</span>
                                </div>
                            </div>

                            <div className = "divider"></div>

                            <div className = "info-section">
                                <p className = "info-label">Дата реєстрації</p>
                                <p className = "info-value">{new Date(user.created_at).toLocaleDateString('uk-UA')}</p>
                            </div>

                            {user.bio && (
                                <div className = "bio-section">
                                    <p className = "bio-text">{user.bio}</p>
                                </div>
                            )}

                            {current_user && current_user.id !== parseInt(userId) && (
                                <div className = "rating-panel">
                                    <p className = "rating-title">Оцініть користувача</p>
                                    <div className = "rating-controls">
                                        <button
                                            className = {`rate-btn ${rating?.user_vote === 1 ? 'active' : ''}`}
                                            onClick = {() => handle_rate_user(1)}
                                        >
                                            <BiLike /> {rating?.likes_count || 0}
                                        </button>
                                        <button
                                            className = {`rate-btn ${rating?.user_vote === -1 ? 'active' : ''}`}
                                            onClick = {() => handle_rate_user(-1)}
                                        >
                                            <BiDislike /> {rating?.dislikes_count || 0}
                                        </button>
                                    </div>
                                    <button 
                                        className = "report-user-btn"
                                        onClick = {() => set_show_report_modal(true)}
                                        title = "Поскаржитися на користувача"
                                    >
                                        <FiFlag /> Поскаржитися
                                    </button>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Right Content Area */}
                    <section className = "profile-content-section">
                        <div className = "tab-navigation">
                            <button
                                className = {`nav-tab ${active_tab === 'posts' ? 'active' : ''}`}
                                onClick = {() => set_active_tab('posts')}
                            >
                                Пості ({posts.length})
                            </button>
                            <button
                                className = {`nav-tab ${active_tab === 'achievements' ? 'active' : ''}`}
                                onClick = {() => set_active_tab('achievements')}
                            >
                                Ачівки ({achievements.length})
                            </button>
                        </div>

                        <div className = "tab-content">
                            {active_tab === 'posts' && (
                                <div className = "posts-section">
                                    {posts.length === 0 ? (
                                        <div className = "no-content">
                                            <p>Користувач ще не створював постів</p>
                                        </div>
                                    ) : (
                                        <div className = "posts-grid">
                                            {posts.map(post => (
                                                <article
                                                    key = {post.id}
                                                    className = "post-item"
                                                    onClick = {() => navigate(`/posts/${post.id}`)}
                                                >
                                                    <div className = "post-title-section">
                                                        <h3>{post.title}</h3>
                                                        <span className = "post-time">{format_date(post.created_at)}</span>
                                                    </div>
                                                    <p className = "post-text">{strip_markdown(post.content)}</p>
                                                    {post.categories?.length > 0 && (
                                                        <div className = "tags-section">
                                                            {post.categories.map((cat, idx) => (
                                                                <span key={idx} className = "tag">{cat}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className = "post-meta">
                                                        <button 
                                                            className = "meta-stat-btn"
                                                            onClick = {(e) => {
                                                                e.stopPropagation();
                                                                set_post_stats_modal({
                                                                    post_id: post.id,
                                                                    post_title: post.title,
                                                                    likes: post.likes_count || 0,
                                                                    comments: post.comments_count || 0,
                                                                    views: post.view_count || 0
                                                                });
                                                            }}
                                                            title = "Показати статистику"
                                                        >
                                                            <FaHeart /> {post.likes_count || 0}
                                                        </button>
                                                        <button 
                                                            className = "meta-stat-btn"
                                                            onClick = {(e) => {
                                                                e.stopPropagation();
                                                                set_post_stats_modal({
                                                                    post_id: post.id,
                                                                    post_title: post.title,
                                                                    likes: post.likes_count || 0,
                                                                    comments: post.comments_count || 0,
                                                                    views: post.view_count || 0
                                                                });
                                                            }}
                                                            title = "Показати статистику"
                                                        >
                                                            <FiMessageCircle /> {post.comments_count || 0}
                                                        </button>
                                                        <button 
                                                            className = "meta-stat-btn"
                                                            onClick = {(e) => {
                                                                e.stopPropagation();
                                                                set_post_stats_modal({
                                                                    post_id: post.id,
                                                                    post_title: post.title,
                                                                    likes: post.likes_count || 0,
                                                                    comments: post.comments_count || 0,
                                                                    views: post.view_count || 0
                                                                });
                                                            }}
                                                            title = "Показати статистику"
                                                        >
                                                            <FiEye /> {post.view_count || 0}
                                                        </button>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {active_tab === 'achievements' && (
                                <div className = "achievements-section">
                                    {achievements.length === 0 ? (
                                        <div className = "no-content">
                                            <p>Ачівок ще не отримано</p>
                                        </div>
                                    ) : (
                                        <div className = "achievements-list">
                                            {achievements.map(ach => (
                                                <div key = {ach.id} className="achievement-row">
                                                    <div className = "ach-icon">
                                                        <img src = {ach.icon} alt = {ach.title} />
                                                    </div>
                                                    <div className = "ach-content">
                                                        <h4>{ach.title}</h4>
                                                        <p>{ach.description}</p>
                                                        <div className = "ach-footer">
                                                            <span className = "points">+{ach.points} рейтингу</span>
                                                            <span className = "earned-date">{new Date(ach.earned_at).toLocaleDateString('uk-UA')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
            {show_report_modal && (
                <ReportModal 
                    isOpen = {true}
                    targetType = "user"
                    targetId = {parseInt(userId)}
                    targetTitle = {user?.login}
                    onClose = {() => set_show_report_modal(false)}
                    onSubmit = {() => {
                        alert('✅ Дякуємо! Ваш звіт був успішно поданий.');
                        set_show_report_modal(false);
                    }}
                />
            )}
            
            {post_stats_modal && (
                <div className = "stats-modal-overlay" onClick = {() => set_post_stats_modal(null)}>
                    <div className = "stats-modal" onClick = {(e) => e.stopPropagation()}>
                        <div className = "stats-modal-header">
                            <h3>{post_stats_modal.post_title}</h3>
                            <button 
                                className = "stats-modal-close"
                                onClick = {() => set_post_stats_modal(null)}
                                title = "Закрити"
                            >
                                ✕
                            </button>
                        </div>
                        <div className = "stats-modal-body">
                            <div className = "stat-item">
                                <div className = "stat-icon likes-icon">
                                    <FaHeart />
                                </div>
                                <div className = "stat-info">
                                    <div className = "stat-label">Лайків</div>
                                    <div className = "stat-value">{post_stats_modal.likes}</div>
                                </div>
                            </div>
                            <div className = "stat-item">
                                <div className = "stat-icon comments-icon">
                                    <FiMessageCircle />
                                </div>
                                <div className = "stat-info">
                                    <div className = "stat-label">Коментарів</div>
                                    <div className = "stat-value">{post_stats_modal.comments}</div>
                                </div>
                            </div>
                            <div className = "stat-item">
                                <div className = "stat-icon views-icon">
                                    <FiEye />
                                </div>
                                <div className = "stat-info">
                                    <div className = "stat-label">Переглядів</div>
                                    <div className = "stat-value">{post_stats_modal.views}</div>
                                </div>
                            </div>
                        </div>
                        <div className = "stats-modal-footer">
                            <button 
                                className = "btn-view-post"
                                onClick = {() => {
                                    navigate(`/posts/${post_stats_modal.post_id}`);
                                    set_post_stats_modal(null);
                                }}
                            >
                                Переглянути пост
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
};

export default UserProfilePage;