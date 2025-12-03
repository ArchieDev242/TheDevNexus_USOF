import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import 
{ 
    FiMessageSquare, 
    FiThumbsUp, 
    FiClock,
    FiUser,
    FiFilter,
    FiSearch,
    FiTrendingUp,
    FiGrid,
    FiFolder,
    FiPlus,
    FiLock,
    FiFlag,
    FiChevronLeft,
    FiChevronRight,
    FiMoreVertical,
    FiBook
} from 'react-icons/fi';
import { GoBlocked } from 'react-icons/go';
import 
{
    SiUnrealengine,
    SiUnity,
    SiGodotengine,
    SiPython,
    SiCryengine,
    SiGamemaker
} from 'react-icons/si';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import CreatePostModal from '../../components/CreatePostModal/CreatePostModal';
import ReportModal from '../../components/ReportModal/ReportModal';
import './posts.css';
import { useTranslation } from 'react-i18next';

export default function PostsPage() {
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [posts, set_posts] = useState([]);
    const [categories, set_categories] = useState([]);
    const [total_active_posts, set_total_active_posts] = useState(0);
    const [total_posts, set_total_posts] = useState(0);
    const [selected_category, set_selected_category] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get('category') || 'all';
    });
    const [sort_by, set_sort_by] = useState('latest');
    const [search_query, set_search_query] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get('search') || '';
    });
    const [loading, set_loading] = useState(true);
    const [show_create_modal, set_show_create_modal] = useState(false);
    const [show_report_modal, set_show_report_modal] = useState(false);
    const [report_target, set_report_target] = useState(null);
    const [current_page, set_current_page] = useState(1);
    const [open_menu_id, set_open_menu_id] = useState(null);
    const menu_ref = useRef(null);

    const PAGE_SIZE = 10;

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const category_from_url = params.get('category') || 'all';
        
        if(category_from_url !== selected_category) set_selected_category(category_from_url);

    }, [location.search]);

    // Close menu when clicking outside
    useEffect(() => {
        const handle_click_outside = (event) => {
            if (menu_ref.current && !menu_ref.current.contains(event.target)) {
                set_open_menu_id(null);
            }
        };

        if (open_menu_id !== null) {
            document.addEventListener('mousedown', handle_click_outside);
            return () => document.removeEventListener('mousedown', handle_click_outside);
        }
    }, [open_menu_id]);

    useEffect(() => {
        fetch_categories();
        fetch_posts();
    }, [selected_category, sort_by, current_page]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query_from_url = params.get('search') || '';
        set_search_query(prev_query => prev_query === query_from_url ? prev_query : query_from_url);
    }, [location.search]);

    useEffect(() => {
        set_current_page(1);
    }, [selected_category, sort_by, search_query]);

    const fetch_categories = async () => {
        try 
        {
            const response = await fetch('/api/categories', {
                credentials: 'include'
            });

            const data = await response.json();

            if(data.status === 'success') {
                // Support both legacy and new response shapes
                if (Array.isArray(data.data)) {
                    set_categories(data.data);
                    // total unknown from legacy response; keep previous value
                } else if (data.data && typeof data.data === 'object') {
                    set_categories(data.data.categories || []);
                    set_total_active_posts(Number(data.data.total_active_posts) || 0);
                }
            }
        } catch(error) 
        {
            console.error('Error fetching categories:', error);
        }
    };

    const strip_markdown = (text) => {
        if(!text) return '';
        
        let cleaned = text
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
        
        return cleaned;
    };

    const fetch_posts = async () => {
        set_loading(true);
        try 
        {
            const params = new URLSearchParams();
            params.append('page', String(current_page));
            params.append('limit', '10');

            if(selected_category !== 'all') {
                // Backend expects plural 'categories' query param
                params.append('categories', String(selected_category));
            }
            
            if(sort_by === 'popular') 
                {
                params.append('sort', 'likes');
            } else 
                {
                params.append('sort', 'date');
            }

            const response = await fetch(`/api/posts?${params.toString()}`, {
                credentials: 'include'
            });
            const data = await response.json();

            if(data.status === 'success') 
                {
                set_posts(data.data || []);
                if(data.pagination) {
                    set_total_posts(data.pagination.total || 0);
                }
            }
        } catch(error) 
        {
            console.error('Error fetching posts:', error);
        } finally 
        {
            set_loading(false);
        }
    };

    const handle_search = (e) => {
        e.preventDefault();
        const trimmed_query = search_query.trim();

        if(trimmed_query)
            {
            navigate({ pathname: '/posts', search: `?search=${encodeURIComponent(trimmed_query)}` });
        }
        else
            {
            navigate('/posts');
        }
    };

    const handle_category_change = (category_id) => {
        const value = String(category_id);
        set_selected_category(value);
        if(value === 'all') {
            navigate('/posts');
        } else {
            navigate(`/posts?category=${encodeURIComponent(value)}`);
        }
    };

    const filtered_posts = useMemo(() => {
        const query = search_query.toLowerCase();
        return posts.filter(post => 
            post.title?.toLowerCase().includes(query) ||
            post.content?.toLowerCase().includes(query)
        );
    }, [posts, search_query]);

    const total_pages = Math.max(1, Math.ceil(total_posts / PAGE_SIZE));

    useEffect(() => {
        if (current_page > total_pages) {
            set_current_page(total_pages || 1);
        }
    }, [current_page, total_pages]);

    const handle_page_change = (page) => {
        if (page < 1 || page > total_pages) return;
        set_current_page(page);
    };

    const get_category_icon = (category_title) => {
        const icon_map = {
            'Unreal Engine': <SiUnrealengine />,
            'Unity': <SiUnity />,
            'Godot': <SiGodotengine />,
            'Godot Engine': <SiGodotengine />,
            "Ren'Py": <SiPython />,
            'GameMaker': <SiGamemaker />,
            'CryEngine': <SiCryengine />,
        };
        return icon_map[category_title] || <FiFolder />;
    };

    const handle_report_click = (e, post) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            alert(t('posts_page.login_to_report'));
            return;
        }
        set_report_target({
            type: 'post',
            id: post.id,
            title: post.title
        });
        set_show_report_modal(true);
    };

    return (
        <>
            <Header />
            <div className = "posts-page">
                <div className = "animated-background"></div>
                <div className = "container">
                    <div className = "posts-header">
                        <div>
                            <h1 className = "gradient-text">{t('posts_page.title')}</h1>
                            <p className = "posts-subtitle">
                                {t('posts_page.subtitle')}
                            </p>
                        </div>
                        {isAuthenticated && (
                            <button 
                                className = "btn btn-gradient create-post-btn"
                                onClick = {() => set_show_create_modal(true)}
                            >
                                <FiPlus />
                                <span>{t('posts.create_post')}</span>
                            </button>
                        )}
                    </div>

                    <div className = "posts-controls">
                        <form className = "posts-search" onSubmit = {handle_search}>
                            <FiSearch />
                            <input 
                                type = "text" 
                                placeholder = {t('posts_page.search_placeholder')}
                                value = {search_query}
                                onChange = {(e) => set_search_query(e.target.value)}
                            />
                        </form>

                        <div className = "posts-filters">
                            <div className = "filter-group">
                                <FiFilter />
                                <select 
                                    value = {selected_category} 
                                    onChange = {(e) => handle_category_change(e.target.value)}
                                    className = "filter-select"
                                >
                                    <option value = "all">{t('categories.all_categories')}</option>
                                    {categories.map(cat => (
                                        <option key = {cat.id} value = {cat.id}>
                                            {cat.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className = "filter-group">
                                <FiTrendingUp />
                                <select 
                                    value = {sort_by} 
                                    onChange = {(e) => set_sort_by(e.target.value)}
                                    className = "filter-select"
                                >
                                    <option value = "latest">{t('posts_page.filter_latest')}</option>
                                    <option value = "popular">{t('posts_page.filter_popular')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className = "posts-layout">
                        <aside className = "categories-sidebar">
                            <div className = "sidebar-card">
                                <h3 className = "sidebar-title">
                                    <span className = "gradient-text">{t('posts_page.sidebar_title')}</span>
                                </h3>
                                <ul className = "categories-list">
                                    <li 
                                        className = {selected_category === 'all' ? 'active' : ''}
                                        onClick = {() => handle_category_change('all')}
                                    >
                                        <span className = "category-icon"><FiGrid /></span>
                                        <span>{t('posts_page.sidebar_all_posts')}</span>
                                        <span className = "category-count">{total_active_posts}</span>
                                    </li>
                                    {categories.map(category => (
                                        <li 
                                            key = {category.id}
                                            className = {selected_category === String(category.id) ? 'active' : ''}
                                            onClick = {() => handle_category_change(String(category.id))}
                                        >
                                            <span className = "category-icon">{get_category_icon(category.title)}</span>
                                            <span>{category.title}</span>
                                            <span className = "category-count">
                                                {category.posts_count ?? 0}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>

                        <main className = "posts-main">
                            {loading ? (
                                <div className = "posts-loading">
                                    <div className = "spinner"></div>
                                    <p>{t('posts.loading')}</p>
                                </div>
                            ) : filtered_posts.length === 0 ? (
                                <div className = "no-posts">
                                    <FiMessageSquare size={64} />
                                    <h3>{t('posts_page.no_posts_title')}</h3>
                                    <p>{t('posts_page.no_posts_description')}</p>
                                </div>
                            ) : (
                                <div className = "posts-grid">
                                    {posts.map(post => (
                                        <div 
                                            key = {post.id} 
                                            className = "forum-post-card"
                                            onClick = {() => navigate(`/posts/${post.id}`)}
                                            style = {{ cursor: 'pointer' }}
                                        >
                                            <div className = "post-header">
                                                <div className = "post-author">
                                                    <div className = "author-avatar">
                                                        {post.author_avatar ? (
                                                            <img 
                                                                src = {post.author_avatar} 
                                                                alt = {post.author_login}
                                                            />
                                                        ) : (
                                                            <img 
                                                                src = "/user/avatar.jpg" 
                                                                alt = {post.author_login}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className = "author-info">
                                                        <span className = "author-name">{post.author_login || t('common.anonymous')}</span>
                                                        <span className = "post-time">
                                                            <FiClock size = {12} />
                                                            {new Date(post.publish_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className = "post-badges">
                                                    {post.is_closed && (
                                                        <span className = "closed-badge" title={t('posts_page.closed_tooltip')}>
                                                            <GoBlocked size={18} />
                                                        </span>
                                                    )}
                                                    {post.category_title && (
                                                        <span className = "post-category-badge">
                                                            {post.category_title}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Mobile menu with three dots */}
                                                <div 
                                                    className = "post-actions-mobile"
                                                    ref = {open_menu_id === post.id ? menu_ref : null}
                                                >
                                                    <button 
                                                        className = "btn-more-actions"
                                                        onClick = {(e) => {
                                                            e.stopPropagation();
                                                            set_open_menu_id(open_menu_id === post.id ? null : post.id);
                                                        }}
                                                        aria-label = "Більше дій"
                                                    >
                                                        <FiMoreVertical size={20} />
                                                    </button>

                                                    {open_menu_id === post.id && (
                                                        <div className = "actions-dropdown">
                                                            <button 
                                                                className = "dropdown-action"
                                                                onClick = {(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/posts/${post.id}`);
                                                                    set_open_menu_id(null);
                                                                }}
                                                            >
                                                                <FiBook size={16} />
                                                                <span>{t('posts_page.read_more')}</span>
                                                            </button>
                                                            <button 
                                                                className = "dropdown-action danger"
                                                                onClick = {(e) => {
                                                                    e.stopPropagation();
                                                                    handle_report_click(e, post);
                                                                    set_open_menu_id(null);
                                                                }}
                                                            >
                                                                <FiFlag size={16} />
                                                                <span>{t('posts_page.report_tooltip')}</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className = "post-title">{post.title}</h3>
                                            <p className = "post-excerpt">
                                                {strip_markdown(post.content || '').substring(0, 150)}
                                                {post.content && strip_markdown(post.content).length > 150 ? '...' : ''}
                                            </p>

                                            <div className = "post-footer">
                                                <div className = "post-stats">
                                                    <span className = "stat">
                                                        <FiThumbsUp />
                                                        {post.likes_count || 0}
                                                    </span>
                                                    <span className = "stat">
                                                        <FiMessageSquare />
                                                        {post.comments_count || 0}
                                                    </span>
                                                    <span className = "stat">
                                                        <FiUser />
                                                        {t('posts.views', { count: post.view_count || 0 })}
                                                    </span>
                                                </div>

                                                {/* Desktop actions */}
                                                <div className = "post-actions post-actions-desktop">
                                                    <button 
                                                        className = "btn-read-more"
                                                        onClick = {(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/posts/${post.id}`);
                                                        }}
                                                    >
                                                        {t('posts_page.read_more')}
                                                    </button>
                                                    <button 
                                                        className = "btn-report"
                                                        onClick = {(e) => handle_report_click(e, post)}
                                                        title = {t('posts_page.report_tooltip')}
                                                    >
                                                        <FiFlag size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!loading && posts.length > 0 && total_pages > 1 && (
                                <nav className = "posts-pagination" aria-label = "Pagination">
                                    <button
                                        type = "button"
                                        className = "pagination-button"
                                        onClick = {() => handle_page_change(current_page - 1)}
                                        disabled = {current_page === 1}
                                        aria-label = {t('common.back')}
                                    >
                                        <FiChevronLeft />
                                    </button>
                                    {Array.from({ length: total_pages }, (_, index) => {
                                        const page_number = index + 1;
                                        return (
                                            <button
                                                key = {page_number}
                                                type = "button"
                                                className = {`pagination-button${page_number === current_page ? ' active' : ''}`}
                                                onClick = {() => handle_page_change(page_number)}
                                                aria-current = {page_number === current_page ? 'page' : undefined}
                                            >
                                                {page_number}
                                            </button>
                                        );
                                    })}
                                    <button
                                        type = "button"
                                        className = "pagination-button"
                                        onClick = {() => handle_page_change(current_page + 1)}
                                        disabled = {current_page === total_pages}
                                        aria-label = {t('common.next')}
                                    >
                                        <FiChevronRight />
                                    </button>
                                </nav>
                            )}
                        </main>
                    </div>
                </div>
            </div>

            {/* Floating Create Post Button */}
            {isAuthenticated && (
                <button 
                    className = "floating-create-btn"
                    onClick = {() => set_show_create_modal(true)}
                    title = {t('posts.create_post')}
                >
                    <FiPlus size={28} />
                </button>
            )}

            <CreatePostModal 
                show = {show_create_modal}
                onClose = {() => set_show_create_modal(false)}
                onPostCreated = {(new_post) => {
                    fetch_posts();
                }}
            />

            <ReportModal 
                isOpen = {show_report_modal}
                onClose = {() => set_show_report_modal(false)}
                targetType = {report_target?.type}
                targetId = {report_target?.id}
                targetTitle = {report_target?.title}
                onSubmit = {() => {
                    alert(t('posts_page.report_success'));
                    fetch_posts();
                }}
            />

            <Footer />
        </>
    );
}
