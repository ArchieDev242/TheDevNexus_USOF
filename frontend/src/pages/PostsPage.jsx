import React, { useState, useEffect } from 'react';
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
    FiPlus
} from 'react-icons/fi';

import Header from '../components/Header';
import CreatePostModal from '../components/CreatePostModal';
import '../style/posts.css';

export default function PostsPage() {
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const location = useLocation();
    const navigate = useNavigate();
    const [posts, set_posts] = useState([]);
    const [categories, set_categories] = useState([]);
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

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const category_from_url = params.get('category') || 'all';
        
        if(category_from_url !== selected_category) set_selected_category(category_from_url);

    }, [location.search]);

    useEffect(() => {
        fetch_categories();
        fetch_posts();
    }, [selected_category, sort_by]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query_from_url = params.get('search') || '';
        set_search_query(prev_query => prev_query === query_from_url ? prev_query : query_from_url);
    }, [location.search]);

    const fetch_categories = async () => {
        try 
        {
            const response = await fetch('/api/categories', {
                credentials: 'include'
            });

            const data = await response.json();

            if(data.status === 'success') 
                {
                set_categories(data.data || []);
            }
        } catch(error) 
        {
            console.error('Error fetching categories:', error);
        }
    };

    const fetch_posts = async () => {
        set_loading(true);
        try 
        {
            let url = '/api/posts?';

            if(selected_category !== 'all') 
                {
                url += `category=${selected_category}&`;
            }
            if(sort_by === 'popular') 
                {
                url += 'sort=likes';
            } else 
                {
                url += 'sort=date';
            }

            const response = await fetch(url, {
                credentials: 'include'
            });
            const data = await response.json();

            if(data.status === 'success') 
                {
                set_posts(data.data || []);
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
        set_selected_category(category_id);
        if(category_id === 'all') 
            {
            navigate('/posts');
        } else 
            {
            navigate(`/posts?category=${category_id}`);
        }
    };

    const filtered_posts = posts.filter(post => 
        post.title?.toLowerCase().includes(search_query.toLowerCase()) ||
        post.content?.toLowerCase().includes(search_query.toLowerCase())
    );

    return (
        <>
            <Header />
            <div className = "posts-page">
                <div className = "container">
                    <div className = "posts-header">
                        <div>
                            <h1 className = "gradient-text">Forum Posts</h1>
                            <p className = "posts-subtitle">
                                Explore discussions and share your knowledge
                            </p>
                        </div>
                        {isAuthenticated && (
                            <button 
                                className = "btn btn-gradient create-post-btn"
                                onClick = {() => set_show_create_modal(true)}
                            >
                                <FiPlus />
                                <span>Create Post</span>
                            </button>
                        )}
                    </div>

                    <div className = "posts-controls">
                        <form className = "posts-search" onSubmit = {handle_search}>
                            <FiSearch />
                            <input 
                                type = "text" 
                                placeholder = "Search posts..."
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
                                    <option value = "all">All Categories</option>
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
                                    <option value = "latest">Latest</option>
                                    <option value = "popular">Most Popular</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className = "posts-layout">
                        <aside className = "categories-sidebar">
                            <div className = "sidebar-card">
                                <h3 className = "sidebar-title">
                                    <span className = "gradient-text">Categories</span>
                                </h3>
                                <ul className = "categories-list">
                                    <li 
                                        className = {selected_category === 'all' ? 'active' : ''}
                                        onClick = {() => handle_category_change('all')}
                                    >
                                        <span className = "category-icon"><FiGrid /></span>
                                        <span>All Posts</span>
                                        <span className = "category-count">{posts.length}</span>
                                    </li>
                                    {categories.map(category => (
                                        <li 
                                            key = {category.id}
                                            className = {selected_category === category.id ? 'active' : ''}
                                            onClick = {() => handle_category_change(category.id)}
                                        >
                                            <span className = "category-icon"><FiFolder /></span>
                                            <span>{category.title}</span>
                                            <span className = "category-count">
                                                {posts.filter(p => p.category_id === category.id).length}
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
                                    <p>Loading posts...</p>
                                </div>
                            ) : filtered_posts.length === 0 ? (
                                <div className = "no-posts">
                                    <FiMessageSquare size={64} />
                                    <h3>No posts found</h3>
                                    <p>Be the first to start a discussion!</p>
                                </div>
                            ) : (
                                <div className = "posts-grid">
                                    {filtered_posts.map(post => (
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
                                                                alt = {post.author_name}
                                                                style = {{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                                            />
                                                        ) : (
                                                            <img 
                                                                src = "/user/avatar.jpg" 
                                                                alt = {post.author_name}
                                                                style = {{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className = "author-info">
                                                        <span className = "author-name">{post.author_name || 'Anonymous'}</span>
                                                        <span className = "post-time">
                                                            <FiClock size = {12} />
                                                            {new Date(post.publish_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                {post.category_title && (
                                                    <span className = "post-category-badge">
                                                        {post.category_title}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className = "post-title">{post.title}</h3>
                                            <p className = "post-excerpt">
                                                {post.content?.substring(0, 150)}...
                                            </p>

                                            <div className = "post-footer">
                                                <div className = "post-stats">
                                                    <span className = "stat">
                                                        <FiThumbsUp />
                                                        {post.likes || 0}
                                                    </span>
                                                    <span className = "stat">
                                                        <FiMessageSquare />
                                                        {post.comments_count || 0}
                                                    </span>
                                                    <span className = "stat">
                                                        <FiUser />
                                                        {post.views || 0} views
                                                    </span>
                                                </div>
                                                <button 
                                                    className = "btn-read-more"
                                                    onClick = {(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/posts/${post.id}`);
                                                    }}
                                                >
                                                    Read More →
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                    title = "Створити пост"
                >
                    <FiPlus size={28} />
                </button>
            )}

            <CreatePostModal 
                show = {show_create_modal}
                onClose = {() => set_show_create_modal(false)}
                onPostCreated = {(new_post) => {
                    fetch_posts(); // Refresh posts list
                }}
            />
        </>
    );
}
