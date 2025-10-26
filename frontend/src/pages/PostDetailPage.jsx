import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiMessageCircle, FiBookmark, FiArrowLeft, FiMoreVertical, FiEdit2, FiTrash2, FiLock, FiUnlock, FiFlag } from 'react-icons/fi';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { IoHeartDislike, IoHeartDislikeOutline } from 'react-icons/io5';
import { GoBlocked } from 'react-icons/go';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EditPostModal from '../components/EditPostModal';
import ReportModal from '../components/ReportModal';
import '../style/post-detail.css';

export default function PostDetailPage() {
    const { post_id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector(state => state.auth);
    
    const [post, set_post] = useState(null);
    const [comments, set_comments] = useState([]);
    const [categories, set_categories] = useState([]);
    const [blueprints, set_blueprints] = useState([]);
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
    const post_menu_ref = React.useRef(null);

    const comment_tree = useMemo(() => {
        if (!Array.isArray(comments) || comments.length === 0) return [];

        const nodes = comments.map(comment => ({
            ...comment,
            parent_comment_id: comment.parent_comment_id ? Number(comment.parent_comment_id) : null,
            replies: []
        }));

        const lookup = new Map(nodes.map(node => [node.id, node]));
        const roots = [];

        nodes.forEach(node => {
            if (node.parent_comment_id) {
                const parent = lookup.get(node.parent_comment_id);
                if (parent) {
                    parent.replies.push(node);
                } else {
                    roots.push(node);
                }
            } else {
                roots.push(node);
            }
        });

        const sort_nodes = (list) => list
            .slice()
            .sort((a, b) => new Date(a.publish_date) - new Date(b.publish_date))
            .map(node => ({
                ...node,
                replies: sort_nodes(node.replies)
            }));

        return sort_nodes(roots);
    }, [comments]);

    useEffect(() => {
        fetch_post_data();
    }, [post_id]);

    useEffect(() => {
        const handle_click_outside = (event) => {
            if(post_menu_ref.current && !post_menu_ref.current.contains(event.target)) set_show_post_menu(false);
        };

        if(show_post_menu) document.addEventListener('mousedown', handle_click_outside);

        return () => {
            document.removeEventListener('mousedown', handle_click_outside);
        };
    }, [show_post_menu]);

    const fetch_post_data = async () => {
        try 
        {
            set_loading(true);
            
            const post_response = await fetch(`/api/posts/${post_id}`, {
                credentials: 'include'
            });

            const post_data = await post_response.json();
            
            if(post_data.status === 'success') 
            {
                set_post(post_data.data);
                
                // Extract blueprints from post data if available
                if(post_data.data.blueprints && Array.isArray(post_data.data.blueprints))
                {
                    set_blueprints(post_data.data.blueprints);
                }
            }

            // Record view if user is authenticated
            if(isAuthenticated) 
                {
                try 
                {
                    await fetch(`/api/posts/${post_id}/view`, {
                        method: 'POST',
                        credentials: 'include'
                    });
                } 
                catch(view_error) 
                {
                    console.warn('Could not record view:', view_error);
                }
            }

            // Fetch comments
            const comments_response = await fetch(`/api/posts/${post_id}/comments`, {
                credentials: 'include'
            });
            const comments_data = await comments_response.json();
            
            if(comments_data.status === 'success') set_comments(comments_data.data || []);

            const categories_response = await fetch(`/api/posts/${post_id}/categories`, {
                credentials: 'include'
            });

            const categories_data = await categories_response.json();
            
            if(categories_data.status === 'success') set_categories(categories_data.data || []);

            const like_response = await fetch(`/api/likes/posts/${post_id}`, {
                credentials: 'include'
            });

            const like_data = await like_response.json();
            
            if(like_data.status === 'success' && like_data.data) 
                {
                set_post_reaction({
                    liked: Boolean(like_data.data.liked),
                    disliked: Boolean(like_data.data.disliked),
                    likes_count: like_data.data.likes_count ?? like_data.data.count ?? 0,
                    dislikes_count: like_data.data.dislikes_count ?? 0
                });
            }

            if(isAuthenticated) 
                {
                const save_response = await fetch(`/api/posts/${post_id}/save-status`, {
                    credentials: 'include'
                });

                const save_data = await save_response.json();
                
                if(save_data.status === 'success') set_save_status(save_data.data.is_saved);
            }

        } catch(error) 
        {
            console.error('Error fetching post data:', error);
        } finally 
        {
            set_loading(false);
        }
    };

    const fetch_comments = async () => {
        try 
        {
            const comments_response = await fetch(`/api/posts/${post_id}/comments`, {
                credentials: 'include'
            });

            const comments_data = await comments_response.json();
            
            if(comments_data.status === 'success') set_comments(comments_data.data || []);
        } catch(error) 
        {
            console.error('Error fetching comments:', error);
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

        try 
        {
            const endpoint = type === 'like' 
                ? `/api/likes/posts/${post_id}/like`
                : `/api/likes/posts/${post_id}/dislike`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                credentials: 'include'
            });
            
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

    const handle_close_post = async () => {
        if (!window.confirm('🔒 Ви впевнені що хочете ЗАЧИНИТИ цей пост?\n\nПісля цього ніхто не зможе написати коментар або відредагувати пост. Видалення залишиться доступним.')) {
            return;
        }

        set_show_post_menu(false);

        try {
            const response = await fetch(`/api/posts/${post_id}/close`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: 'answered' })
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                set_post(prev => ({ ...prev, is_closed: true }));
                alert('✅ Пост успішно зачинено');
            } else {
                alert('❌ ' + (data.message || 'Помилка зачинення поста'));
            }
        } catch (error) {
            console.error('Error closing post:', error);
            alert('❌ Помилка зачинення поста');
        }
    };

    const handle_reopen_post = async () => {
        if (!window.confirm('🔓 Ви впевнені що хочете ВІДКРИТИ цей пост?\n\nПісля цього люди зможуть знову писати коментарі та редагувати пост.')) {
            return;
        }

        set_show_post_menu(false);

        try {
            const response = await fetch(`/api/posts/${post_id}/reopen`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                set_post(prev => ({ ...prev, is_closed: false }));
                alert('✅ Пост успішно відкрено');
            } else {
                alert('❌ ' + (data.message || 'Помилка відкриття поста'));
            }
        } catch (error) {
            console.error('Error reopening post:', error);
            alert('❌ Помилка відкриття поста');
        }
    };

    const toggle_save_post = async () => {
        if(!isAuthenticated) 
            {
            alert('Увійдіть щоб зберегти пост');
            return;
        }

        set_show_post_menu(false);

        try 
        {
            const endpoint = `/api/posts/${post_id}/save`;
            const method = save_status ? 'DELETE' : 'POST';

            const response = await fetch(endpoint, {
                method: method,
                headers: 
                {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: method === 'POST' ? JSON.stringify({}) : undefined
            });

            const data = await response.json();
            
            if(data.status === 'success') 
                {
                set_save_status(!save_status);
                alert(save_status ? '❌ Пост прибрано зі збережених' : '✅ Пост збережено');
            } else 
                {
                alert('❌ ' + (data.message || 'Помилка збереження поста'));
            }
        } catch(error) 
        {
            console.error('Error toggling save post:', error);
            alert('❌ Помилка збереження поста');
        }
    };

    const format_date = (date_string) => {
        const date = new Date(date_string);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if(minutes < 1) return 'щойно';
        if(minutes < 60) return `${minutes} хв тому`;
        if(hours < 24) return `${hours} год тому`;
        if(days < 7) return `${days} дн тому`;
        if(days < 30) return `${Math.floor(days / 7)} тиж тому`;
        if(months < 12) return `${months} міс тому`;
        if(years === 1) return '1 рік тому';
        if(years < 5) return `${years} роки тому`;
        return `${years} років тому`;
    };

    const render_comments = (nodes, depth = 0, parent = null) => {
        if(!nodes || nodes.length === 0) return null;

        return nodes.map(node => (
            <div key = {node.id} className = {`comment-thread depth-${depth}`}>
                <Comment 
                    comment = {node}
                    on_reply = {() => set_reply_to(node.id)}
                    current_user = {user}
                    is_authenticated = {isAuthenticated}
                    on_comment_updated = {fetch_comments}
                    on_comment_deleted = {(comment_id) => {
                        set_comments(prev => prev.filter(c => c.id !== comment_id));
                    }}
                    parent_comment = {parent}
                    depth = {depth}
                />
                {node.replies && node.replies.length > 0 && (
                    <div className = "replies-container">
                        {render_comments(node.replies, depth + 1, node)}
                    </div>
                )}
            </div>
        ));
    };

    if(loading) 
        {
        return (
            <div className = "app-container">
                <Header />
                <main className = "main-content">
                    <div className = "post-detail-loading">Завантаження...</div>
                </main>
                <Footer />
            </div>
        );
    }

    if(!post) 
        {
        return (
            <div className = "app-container">
                <Header />
                <main className = "main-content">
                    <div className = "post-detail-error">Пост не знайдено</div>
                </main>
                <Footer />
            </div>
        );
    }

    const is_author = isAuthenticated && user && user.id === post.author_id;
    const is_admin = isAuthenticated && user && user.role === 'admin';

    return (
        <div className = "app-container">
            <Header />
            <main className = "main-content">
                <div className = "post-detail-container">
                    <button className = "back-button" onClick = {() => navigate('/posts')}>
                        <FiArrowLeft /> Назад до постів
                    </button>

                    <div className = "post-detail-card">
                        <div className = "post-detail-header">
                            <div className = "post-author-info">
                                <img 
                                    src = {post.author?.profile_picture || '/user/avatar.jpg'} 
                                    alt = {post.author?.login || 'User'}
                                    className = "author-avatar"
                                    onClick = {() => navigate(`/users/${post.author_id}`)}
                                    style = {{ cursor: 'pointer' }}
                                />
                                <div className = "author-details">
                                    <h3 
                                        className = "author-name"
                                        onClick = {() => navigate(`/users/${post.author_id}`)}
                                        style = {{ cursor: 'pointer' }}
                                    >
                                        {post.author?.login || 'Anonymous'}
                                    </h3>
                                    <span className = "post-date">{format_date(post.publish_date)}</span>
                                </div>
                            </div>

                            {(is_author || is_admin) && (
                                <div className = "post-menu" ref = {post_menu_ref}>
                                    <button 
                                        className = "menu-trigger"
                                        onClick = {() => set_show_post_menu(!show_post_menu)}
                                    >
                                        <FiMoreVertical />
                                    </button>
                                    {show_post_menu && (
                                        <div className = "menu-dropdown">
                                            <button 
                                                className = "menu-item"
                                                onClick = {() => {
                                                    set_show_edit_modal(true);
                                                    set_show_post_menu(false);
                                                }}
                                            >
                                                <FiEdit2 /> Редагувати
                                            </button>
                                            {!post.is_closed ? (
                                                <button 
                                                    className = "menu-item"
                                                    onClick = {() => handle_close_post()}
                                                >
                                                    <GoBlocked size={18} /> Зачинити пост
                                                </button>
                                            ) : (
                                                <button 
                                                    className = "menu-item"
                                                    onClick = {() => handle_reopen_post()}
                                                >
                                                    <FiUnlock /> Відкрити пост
                                                </button>
                                            )}
                                            <button 
                                                className = "menu-item delete"
                                                onClick = {handle_delete_post}
                                            >
                                                <FiTrash2 /> Видалити назавжди
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <h1 className = "post-title">{post.title}</h1>

                        {post.updated_at && post.updated_at !== post.created_at && (
                            <div className = "post-edited-info">
                                <i>Відредаговано {format_date(post.updated_at)}</i>
                            </div>
                        )}

                        {categories.length > 0 && (
                            <div className = "post-categories">
                                {categories.map(cat => (
                                    <span key = {cat.id} className = "category-badge">
                                        {cat.title}
                                    </span>
                                ))}
                            </div>
                        )}

                        {blueprints && blueprints.length > 0 && (
                            <div className = "post-blueprints">
                                <h3>📐 Blueprints UE</h3>
                                <div className = "blueprints-list">
                                    {blueprints.map(bp => (
                                        <a 
                                            key = {bp.blueprint_id}
                                            href = {bp.blueprint_url}
                                            target = "_blank"
                                            rel = "noopener noreferrer"
                                            className = "blueprint-link"
                                        >
                                            <div className = "blueprint-item">
                                                <span className = "blueprint-title">{bp.blueprint_title}</span>
                                                {bp.blueprint_author && (
                                                    <span className = "blueprint-author">by {bp.blueprint_author}</span>
                                                )}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className = "post-content">
                            <ReactMarkdown 
                                remarkPlugins = {[remarkGfm]}
                                components = {{
                                    code: ({ inline, className, children, ...props }) => {
                                        if(inline) return <code className="inline-code" {...props}>{children}</code>;

                                        return (
                                            <pre className = "code-block">
                                                <code {...props}>{children}</code>
                                            </pre>
                                        );
                                    }
                                }}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </div>

                        <div className = "post-actions">
                            <button 
                                className = {`action-btn like-button ${post_reaction.liked ? 'liked' : ''}`}
                                onClick = {() => handle_post_reaction('like')}
                            >
                                {post_reaction.liked ? (
                                    <FaHeart />
                                ) : (
                                    <FaRegHeart />
                                )}
                                {post_reaction.likes_count}
                            </button>
                            <button 
                                className = {`action-btn dislike-button ${post_reaction.disliked ? 'disliked' : ''}`}
                                onClick = {() => handle_post_reaction('dislike')}
                            >
                                {post_reaction.disliked ? (
                                    <IoHeartDislike />
                                ) : (
                                    <IoHeartDislikeOutline />
                                )}
                                {post_reaction.dislikes_count}
                            </button>
                            <button className = "action-btn">
                                <FiMessageCircle /> {comments.length}
                            </button>
                            <button 
                                className = {`action-btn save-button ${save_status ? 'saved' : ''}`}
                                onClick = {toggle_save_post}
                                title = {save_status ? 'Прибрати зі збережених' : 'Зберегти пост'}
                            >
                                <FiBookmark /> {save_status ? 'Збережено' : ''}
                            </button>
                        </div>
                    </div>

                    <div className = "comments-section">
                        <h2 className = "comments-title">
                            Коментарі ({comments.length})
                        </h2>

                        {isAuthenticated && !post?.is_closed && (
                            <form className = "comment-form" onSubmit = {handle_submit_comment}>
                                {reply_to && (
                                    <div className = "reply-indicator">
                                        Відповідь на коментар
                                        <button 
                                            type = "button" 
                                            onClick = {() => set_reply_to(null)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                                <textarea
                                    className = "comment-input"
                                    placeholder = "Напишіть коментар..."
                                    value = {new_comment}
                                    onChange = {(e) => set_new_comment(e.target.value)}
                                    rows = {4}
                                />
                                <button type = "submit" className = "submit-comment-btn">
                                    Опублікувати
                                </button>
                            </form>
                        )}

                        {post?.is_closed && (
                            <div className = "post-closed-message">
                                <GoBlocked size={20} style={{marginRight: '10px'}} /> 
                                <strong>Цей пост закритий.</strong> Нові коментарі більше не приймаються.
                            </div>
                        )}

                        <div className = "comments-list">
                            {comments.length === 0 ? (
                                <p className = "no-comments">Коментарів поки немає. Будьте першим!</p>
                            ) : (
                                render_comments(comment_tree)
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            <EditPostModal 
                show = {show_edit_modal}
                onClose = {() => set_show_edit_modal(false)}
                post={{
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    categories: categories,
                    status: post.status
                }}
                onPostUpdated = {(updated_post) => {
                    set_post(updated_post);
                    fetch_post_data();
                }}
            />
        </div>
    );
}

function Comment({ comment, on_reply, current_user, is_authenticated, on_comment_updated, on_comment_deleted, parent_comment, depth = 0 }) {
    const [show_menu, set_show_menu] = useState(false);
    const [is_editing, set_is_editing] = useState(false);
    const [edit_content, set_edit_content] = useState(comment.content);
    const [show_report_modal, set_show_report_modal] = useState(false);
    const [reaction, set_reaction] = useState({
        liked: comment.user_reaction === 'like',
        disliked: comment.user_reaction === 'dislike',
        likes_count: comment.likes_count || 0,
        dislikes_count: comment.dislikes_count || 0
    });
    const menu_ref = React.useRef(null);

    useEffect(() => {
        set_reaction({
            liked: comment.user_reaction === 'like',
            disliked: comment.user_reaction === 'dislike',
            likes_count: comment.likes_count || 0,
            dislikes_count: comment.dislikes_count || 0
        });
    }, [comment.user_reaction, comment.likes_count, comment.dislikes_count]);

    useEffect(() => {
        const handle_click_outside = (event) => {
            if (menu_ref.current && !menu_ref.current.contains(event.target)) {
                set_show_menu(false);
            }
        };

        if (show_menu) {
            document.addEventListener('mousedown', handle_click_outside);
        }

        return () => {
            document.removeEventListener('mousedown', handle_click_outside);
        };
    }, [show_menu]);

    const is_author = is_authenticated && current_user && current_user.id === comment.author_id;
    const is_admin = is_authenticated && current_user && current_user.role === 'admin';
    const parent_author = parent_comment?.author_login ?? null;
    const is_reply = depth > 0;

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
        if(!is_authenticated) 
            {
            alert('Увійдіть щоб взаємодіяти з коментарем');
            return;
        }

        try 
        {
            const endpoint = type === 'like' 
                ? `/api/likes/comments/${comment.id}/like`
                : `/api/likes/comments/${comment.id}/dislike`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if(data.status === 'success' && data.data) apply_reaction(data.data);
        } catch(error) 
        {
            console.error('Error toggling comment reaction:', error);
        }
    };

    const handle_edit = async () => {
        if(!edit_content.trim()) 
            {
            alert('Коментар не може бути порожнім');
            return;
        }

        try 
        {
            const response = await fetch(`/api/comments/${comment.id}`, {
                method: 'PUT',
                headers: 
                {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',
                body: JSON.stringify({ content: edit_content })
            });

            const data = await response.json();

            if(data.status === 'success') 
                {
                set_is_editing(false);
                set_show_menu(false);
                if(on_comment_updated) on_comment_updated();
            } else 
                {
                alert('Помилка при редагуванні коментаря');
            }
        } catch(error) 
        {
            console.error('Error editing comment:', error);
            alert('Помилка при редагуванні коментаря');
        }
    };

    const handle_delete = async () => {
        if(!confirm('Ви впевнені, що хочете видалити цей коментар?')) return;

        try 
        {
            const response = await fetch(`/api/comments/${comment.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if(data.status === 'success') 
                {
                set_show_menu(false);
                if(on_comment_deleted) on_comment_deleted(comment.id);
            } else 
                {
                alert('Помилка при видаленні коментаря');
            }
        } catch(error) 
        {
            console.error('Error deleting comment:', error);
            alert('Помилка при видаленні коментаря');
        }
    };

    const cancel_edit = () => {
        set_is_editing(false);
        set_edit_content(comment.content);
        set_show_menu(false);
    };

    const format_date = (date_string) => {
        const date = new Date(date_string);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if(minutes < 1) return 'щойно';
        if(minutes < 60) return `${minutes} хв тому`;
        if(hours < 24) return `${hours} год тому`;
        if(days < 7) return `${days} дн тому`;
        if(days < 30) return `${Math.floor(days / 7)} тиж тому`;
        if(months < 12) return `${months} міс тому`;
        if(years === 1) return '1 рік тому';
        if(years < 5) return `${years} роки тому`;
        return `${years} років тому`;
    };

    return (
        <div className = {`comment-item ${is_reply ? 'comment-reply' : ''}`}>
            <img 
                src = {comment.author_avatar || '/user/avatar.jpg'} 
                alt = {comment.author_login}
                className = "comment-avatar"
            />
            <div className = "comment-content-wrapper">
                <div className = "comment-header">
                    <span className = "comment-author">{comment.author_login}</span>
                    <span className = "comment-date">{format_date(comment.publish_date)}</span>

                    {(is_author || is_admin) && (
                        <div className = "comment-menu" ref = {menu_ref}>
                            <button
                                className = "menu-trigger"
                                onClick = {() => set_show_menu(!show_menu)}
                            >
                                <FiMoreVertical />
                            </button>
                            {show_menu && (
                                <div className = "menu-dropdown">
                                    {is_author && (
                                        <button 
                                            className = "menu-item"
                                            onClick = {() => {
                                                set_is_editing(true);
                                                set_show_menu(false);
                                            }}
                                        >
                                            <FiEdit2 /> Редагувати
                                        </button>
                                    )}
                                    {!is_author && is_authenticated && (
                                        <button 
                                            className = "menu-item report"
                                            onClick = {() => {
                                                set_show_report_modal(true);
                                                set_show_menu(false);
                                            }}
                                        >
                                            <FiFlag /> Поскаржитися
                                        </button>
                                    )}
                                    <button 
                                        className = "menu-item delete"
                                        onClick = {handle_delete}
                                    >
                                        <FiTrash2 /> Видалити
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {is_editing ? (
                    <div className = "comment-edit-form">
                        <textarea
                            value = {edit_content}
                            onChange = {(e) => set_edit_content(e.target.value)}
                            className = "comment-edit-textarea"
                            rows = {4}
                        />
                        <div className = "edit-actions">
                            <button 
                                className = "save-btn"
                                onClick = {handle_edit}
                            >
                                Зберегти
                            </button>
                            <button 
                                className = "cancel-btn"
                                onClick = {cancel_edit}
                            >
                                Скасувати
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className = "comment-text">
                        {is_reply && parent_author && (
                            <div className = "reply-context">
                                <span className = "reply-arrow">↳</span>
                                <span className = "reply-label">Відповідь для</span>
                                <span className = "reply-context-user">@{parent_author}</span>
                            </div>
                        )}
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {comment.content}
                        </ReactMarkdown>
                    </div>
                )}

                <div className = "comment-actions">
                    <button 
                        className = {`comment-action like-action ${reaction.liked ? 'liked' : ''}`}
                        onClick = {() => handle_reaction('like')}
                    >
                        {reaction.liked ? <FaHeart /> : <FaRegHeart />} {reaction.likes_count}
                    </button>
                    <button 
                        className  ={`comment-action dislike-action ${reaction.disliked ? 'disliked' : ''}`}
                        onClick = {() => handle_reaction('dislike')}
                    >
                        {reaction.disliked ? <IoHeartDislike /> : <IoHeartDislikeOutline />} {reaction.dislikes_count}
                    </button>
                    {is_authenticated && (
                        <button className = "comment-action reply-action" onClick={on_reply}>
                            Відповісти
                        </button>
                    )}
                </div>
            </div>
            {show_report_modal && (
                <ReportModal 
                    isOpen={true}
                    targetType="comment"
                    targetId={comment.id}
                    targetTitle={comment.content?.substring(0, 50)}
                    onClose={() => set_show_report_modal(false)}
                    onSubmit={() => {
                        alert('✅ Спасибо! Ваш звіт была успішно подана.');
                        set_show_report_modal(false);
                    }}
                />
            )}
        </div>
    );
}
