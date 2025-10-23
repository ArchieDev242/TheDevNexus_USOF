import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiMessageCircle, FiBookmark, FiArrowLeft, FiMoreVertical, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FaHeart, FaRegHeart, FaThumbsDown, FaRegThumbsDown } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EditPostModal from '../components/EditPostModal';
import '../style/post-detail.css';

export default function PostDetailPage() {
    const { post_id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector(state => state.auth);
    
    const [post, set_post] = useState(null);
    const [comments, set_comments] = useState([]);
    const [categories, set_categories] = useState([]);
    const [loading, set_loading] = useState(true);
    const [new_comment, set_new_comment] = useState('');
    const [reply_to, set_reply_to] = useState(null);
    const [show_post_menu, set_show_post_menu] = useState(false);
    const [show_edit_modal, set_show_edit_modal] = useState(false);
    const [post_reaction, set_post_reaction] = useState({
        liked: false,
        disliked: false,
        likes_count: 0,
        dislikes_count: 0
    });
    const [save_status, set_save_status] = useState(false);

    useEffect(() => {
        fetch_post_data();
    }, [post_id]);

    const fetch_post_data = async () => {
        try {
            set_loading(true);
            
            // Fetch post details
            const post_response = await fetch(`/api/posts/${post_id}`, {
                credentials: 'include'
            });
            const post_data = await post_response.json();
            
            if (post_data.status === 'success') {
                set_post(post_data.data);
            }

            // Fetch comments
            const comments_response = await fetch(`/api/posts/${post_id}/comments`, {
                credentials: 'include'
            });
            const comments_data = await comments_response.json();
            
            if (comments_data.status === 'success') {
                set_comments(comments_data.data || []);
            }

            // Fetch categories
            const categories_response = await fetch(`/api/posts/${post_id}/categories`, {
                credentials: 'include'
            });
            const categories_data = await categories_response.json();
            
            if (categories_data.status === 'success') {
                set_categories(categories_data.data || []);
            }

            const like_response = await fetch(`/api/posts/${post_id}/like`, {
                credentials: 'include'
            });
            const like_data = await like_response.json();
            
            if (like_data.status === 'success' && like_data.data) {
                set_post_reaction({
                    liked: Boolean(like_data.data.liked),
                    disliked: Boolean(like_data.data.disliked),
                    likes_count: like_data.data.likes_count ?? like_data.data.count ?? 0,
                    dislikes_count: like_data.data.dislikes_count ?? 0
                });
            }

            if (isAuthenticated) {
                const save_response = await fetch(`/api/posts/${post_id}/save-status`, {
                    credentials: 'include'
                });
                const save_data = await save_response.json();
                
                if (save_data.status === 'success') {
                    set_save_status(save_data.data.is_saved);
                }
            }

        } catch(error) 
        {
            console.error('Error fetching post data:', error);
        } finally 
        {
            set_loading(false);
        }
    };

    const apply_post_reaction = (payload) => {
        if(!payload) return;
        set_post_reaction({
            liked: Boolean(payload.liked),
            disliked: Boolean(payload.disliked),
            likes_count: payload.likes_count ?? payload.count ?? 0,
            dislikes_count: payload.dislikes_count ?? 0
        });
    };

    const handle_post_reaction = async (type) => {
        if(!isAuthenticated) 
            {
            alert('Увійдіть щоб взаємодіяти з постом');
            return;
        }

        const is_active = type === 'like' ? post_reaction.liked : post_reaction.disliked;
        const method = is_active ? 'DELETE' : 'POST';

        const options = {
            method,
            credentials: 'include'
        };

        if(method === 'POST') 
            {
            options.headers = {
                'Content-Type': 'application/json'
            };
            options.body = JSON.stringify({ type });
        }

        try 
        {
            const response = await fetch(`/api/posts/${post_id}/like`, options);
            const data = await response.json();

            if(data.status === 'success' && data.data) 
                {
                apply_post_reaction(data.data);
            }
        } catch(error) 
        {
            console.error('Error toggling post reaction:', error);
        }
    };

    const handle_save = async () => {
        if(!isAuthenticated) 
            {
            alert('Увійдіть щоб зберегти пост');
            return;
        }

        try 
        {
            const method = save_status ? 'DELETE' : 'POST';
            const response = await fetch(`/api/posts/${post_id}/save`, {
                method,
                credentials: 'include'
            });

            const data = await response.json();
            
            if(data.status === 'success') 
                {
                set_save_status(!save_status);
            }
        } catch(error) 
        {
            console.error('Error toggling save:', error);
        }
    };

    const handle_submit_comment = async (e) => {
        e.preventDefault();
        
        if(!isAuthenticated) 
            {
            alert('Увійдіть щоб залишити коментар');
            return;
        }

        if(!new_comment.trim()) 
            {
            alert('Коментар не може бути порожнім');
            return;
        }

        try 
        {
            const response = await fetch(`/api/posts/${post_id}/comments`, {
                method: 'POST',
                headers: 
                {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',
                body: JSON.stringify({
                    content: new_comment,
                    parent_id: reply_to
                })
            });

            const data = await response.json();
            
            if(data.status === 'success') 
                {
                set_new_comment('');
                set_reply_to(null);
                fetch_post_data();
            } else 
                {
                alert(data.message || 'Помилка створення коментаря');
            }
        } catch(error) 
        {
            console.error('Error submitting comment:', error);
            alert('Помилка створення коментаря');
        }
    };

    const handle_delete_post = async () => {
        if (!window.confirm('⚠️ УВАГА! Ви впевнені що хочете НАЗАВЖДИ видалити цей пост?\n\nЦю дію неможливо відмінити. Пост, всі коментарі та лайки будуть видалені безповоротно.')) {
            return;
        }

        set_show_post_menu(false);

        try {
            const response = await fetch(`/api/posts/${post_id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                alert('✅ Пост успішно видалено');
                navigate('/posts');
            } else {
                alert('❌ ' + (data.message || 'Помилка видалення поста'));
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('❌ Помилка видалення поста');
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

    if (loading) {
        return (
            <div className="app-container">
                <Header />
                <main className="main-content">
                    <div className="post-detail-loading">Завантаження...</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="app-container">
                <Header />
                <main className="main-content">
                    <div className="post-detail-error">Пост не знайдено</div>
                </main>
                <Footer />
            </div>
        );
    }

    const is_author = isAuthenticated && user && user.id === post.author_id;
    const is_admin = isAuthenticated && user && user.role === 'admin';

    return (
        <div className="app-container">
            <Header />
            <main className="main-content">
                <div className="post-detail-container">
                    <button className="back-button" onClick={() => navigate('/posts')}>
                        <FiArrowLeft /> Назад до постів
                    </button>

                    <div className="post-detail-card">
                        <div className="post-detail-header">
                            <div className="post-author-info">
                                <img 
                                    src={post.author?.profile_picture || '/user/avatar.jpg'} 
                                    alt={post.author?.login || 'User'}
                                    className="author-avatar"
                                    onClick={() => navigate(`/users/${post.author_id}`)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <div className="author-details">
                                    <h3 
                                        className="author-name"
                                        onClick={() => navigate(`/users/${post.author_id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {post.author?.login || 'Anonymous'}
                                    </h3>
                                    <span className="post-date">{format_date(post.publish_date)}</span>
                                </div>
                            </div>

                            {(is_author || is_admin) && (
                                <div className="post-menu">
                                    <button 
                                        className="menu-trigger"
                                        onClick={() => set_show_post_menu(!show_post_menu)}
                                    >
                                        <FiMoreVertical />
                                    </button>
                                    {show_post_menu && (
                                        <div className="menu-dropdown">
                                            <button 
                                                className = "menu-item"
                                                onClick = {() => {
                                                    set_show_edit_modal(true);
                                                    set_show_post_menu(false);
                                                }}
                                            >
                                                <FiEdit2 /> Редагувати
                                            </button>
                                            <button 
                                                className="menu-item delete"
                                                onClick={handle_delete_post}
                                            >
                                                <FiTrash2 /> Видалити назавжди
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <h1 className="post-title">{post.title}</h1>

                        {post.updated_at && post.updated_at !== post.created_at && (
                            <div className = "post-edited-info">
                                <i>Відредаговано {format_date(post.updated_at)}</i>
                            </div>
                        )}

                        {categories.length > 0 && (
                            <div className="post-categories">
                                {categories.map(cat => (
                                    <span key={cat.id} className="category-badge">
                                        {cat.title}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="post-content">
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code: ({ inline, className, children, ...props }) => {
                                        if (inline) {
                                            return <code className="inline-code" {...props}>{children}</code>;
                                        }
                                        return (
                                            <pre className="code-block">
                                                <code {...props}>{children}</code>
                                            </pre>
                                        );
                                    }
                                }}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </div>

                        <div className="post-actions">
                            <button 
                                className={`action-btn like-button ${post_reaction.liked ? 'liked' : ''}`}
                                onClick={() => handle_post_reaction('like')}
                            >
                                {post_reaction.liked ? (
                                    <FaHeart />
                                ) : (
                                    <FaRegHeart />
                                )}
                                {post_reaction.likes_count}
                            </button>
                            <button 
                                className={`action-btn dislike-button ${post_reaction.disliked ? 'disliked' : ''}`}
                                onClick={() => handle_post_reaction('dislike')}
                            >
                                {post_reaction.disliked ? (
                                    <FaThumbsDown />
                                ) : (
                                    <FaRegThumbsDown />
                                )}
                                {post_reaction.dislikes_count}
                            </button>
                            <button className="action-btn">
                                <FiMessageCircle /> {comments.length}
                            </button>
                            <button 
                                className={`action-btn ${save_status ? 'active' : ''}`}
                                onClick={handle_save}
                            >
                                <FiBookmark />
                            </button>
                        </div>
                    </div>

                    <div className="comments-section">
                        <h2 className="comments-title">
                            Коментарі ({comments.length})
                        </h2>

                        {isAuthenticated && (
                            <form className="comment-form" onSubmit={handle_submit_comment}>
                                {reply_to && (
                                    <div className="reply-indicator">
                                        Відповідь на коментар
                                        <button 
                                            type="button" 
                                            onClick={() => set_reply_to(null)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                                <textarea
                                    className="comment-input"
                                    placeholder="Напишіть коментар..."
                                    value={new_comment}
                                    onChange={(e) => set_new_comment(e.target.value)}
                                    rows={4}
                                />
                                <button type="submit" className="submit-comment-btn">
                                    Опублікувати
                                </button>
                            </form>
                        )}

                        <div className="comments-list">
                            {comments.length === 0 ? (
                                <p className="no-comments">Коментарів поки немає. Будьте першим!</p>
                            ) : (
                                comments.map(comment => (
                                    <Comment 
                                        key={comment.id} 
                                        comment={comment}
                                        on_reply={() => set_reply_to(comment.id)}
                                        current_user={user}
                                        is_authenticated={isAuthenticated}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            <EditPostModal 
                show={show_edit_modal}
                onClose={() => set_show_edit_modal(false)}
                post={{
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    categories: categories,
                    status: post.status
                }}
                onPostUpdated={(updated_post) => {
                    set_post(updated_post);
                    fetch_post_data();
                }}
            />
        </div>
    );
}

function Comment({ comment, on_reply, current_user, is_authenticated }) {
    const [show_menu, set_show_menu] = useState(false);
    const [reaction, set_reaction] = useState({
        liked: comment.user_reaction === 'like',
        disliked: comment.user_reaction === 'dislike',
        likes_count: comment.likes_count || 0,
        dislikes_count: comment.dislikes_count || 0
    });

    useEffect(() => {
        set_reaction({
            liked: comment.user_reaction === 'like',
            disliked: comment.user_reaction === 'dislike',
            likes_count: comment.likes_count || 0,
            dislikes_count: comment.dislikes_count || 0
        });
    }, [comment.user_reaction, comment.likes_count, comment.dislikes_count]);

    const is_author = is_authenticated && current_user && current_user.id === comment.author_id;
    const is_admin = is_authenticated && current_user && current_user.role === 'admin';

    const apply_reaction = (payload) => {
        if(!payload) return;
        set_reaction({
            liked: Boolean(payload.liked),
            disliked: Boolean(payload.disliked),
            likes_count: payload.likes_count ?? payload.count ?? 0,
            dislikes_count: payload.dislikes_count ?? 0
        });
    };

    const handle_reaction = async (type) => {
        if (!is_authenticated) {
            alert('Увійдіть щоб взаємодіяти з коментарем');
            return;
        }

        const is_active = type === 'like' ? reaction.liked : reaction.disliked;
        const method = is_active ? 'DELETE' : 'POST';

        const options = {
            method,
            credentials: 'include'
        };

        if(method === 'POST') {
            options.headers = {
                'Content-Type': 'application/json'
            };
            options.body = JSON.stringify({ type });
        }

        try {
            const response = await fetch(`/api/comments/${comment.id}/like`, options);
            const data = await response.json();
            
            if (data.status === 'success' && data.data) {
                apply_reaction(data.data);
            }
        } catch (error) {
            console.error('Error toggling comment reaction:', error);
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

    return (
        <div className="comment-item">
            <img 
                src={comment.author_avatar || '/user/avatar.jpg'} 
                alt={comment.author_login}
                className="comment-avatar"
            />
            <div className="comment-content-wrapper">
                <div className="comment-header">
                    <span className="comment-author">{comment.author_login}</span>
                    <span className="comment-date">{format_date(comment.publish_date)}</span>
                    
                    {(is_author || is_admin) && (
                        <div className="comment-menu">
                            <button 
                                className="menu-trigger"
                                onClick={() => set_show_menu(!show_menu)}
                            >
                                <FiMoreVertical />
                            </button>
                            {show_menu && (
                                <div className="menu-dropdown">
                                    {is_author && (
                                        <button className="menu-item">
                                            <FiEdit2 /> Редагувати
                                        </button>
                                    )}
                                    <button className="menu-item delete">
                                        <FiTrash2 /> Видалити
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="comment-text">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {comment.content}
                    </ReactMarkdown>
                </div>

                <div className="comment-actions">
                    <button 
                        className={`comment-action like-action ${reaction.liked ? 'liked' : ''}`}
                        onClick={() => handle_reaction('like')}
                    >
                        {reaction.liked ? <FaHeart /> : <FaRegHeart />} {reaction.likes_count}
                    </button>
                    <button 
                        className={`comment-action dislike-action ${reaction.disliked ? 'disliked' : ''}`}
                        onClick={() => handle_reaction('dislike')}
                    >
                        {reaction.disliked ? <FaThumbsDown /> : <FaRegThumbsDown />} {reaction.dislikes_count}
                    </button>
                    {is_authenticated && (
                        <button className="comment-action reply-action" onClick={on_reply}>
                            Відповісти
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
