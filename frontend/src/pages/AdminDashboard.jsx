import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FiSettings, FiHome, FiMoreVertical, FiEdit2, FiTrash2, FiPlus, FiFlag } from 'react-icons/fi';
import { FaUsers, FaComments } from 'react-icons/fa';
import { BsFileEarmarkPost } from 'react-icons/bs';
import { BiCategory } from 'react-icons/bi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../style/admin-dashboard.css';

export default function AdminDashboard() 
{
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const { t, i18n } = useTranslation();
    const [activeSection, set_active_section] = useState('dashboard');
    const [stats, set_stats] = useState({
        totalUsers: 0,
        totalPosts: 0,
        totalComments: 0,
        totalCategories: 0
    });
    const [loading, set_loading] = useState(true);
    const [users, set_users] = useState([]);
    const [posts, set_posts] = useState([]);
    const [comments, set_comments] = useState([]);
    const [categories, set_categories] = useState([]);
    const [reports, set_reports] = useState([]);
    const [search_query, set_search_query] = useState('');
    const [show_menu, set_whow_menu] = useState(null);
    const [selected_report, set_selected_report] = useState(null);
    const [show_report_modal, set_show_report_modal] = useState(false);
    const [show_edit_user_modal, set_show_edit_user_modal] = useState(false);
    const [editing_user, set_editing_user] = useState(null);
    const [edit_user_form, set_edit_user_form] = useState({
        login: '',
        full_name: '',
        email: '',
        role: 'user'
    });
    const [show_create_category_modal, set_show_create_category_modal] = useState(false);
    const [creating_category, set_creating_category] = useState(false);
    const [category_form, set_category_form] = useState({
        title: '',
        description: ''
    });

    const get_report_reason_label = (reason) => t(`admin_dashboard.report_reasons.${reason}`, { defaultValue: reason });

    const get_report_type_label = (type) => {
        switch(type) 
        {
            case 'post': return `📝 ${t('admin_dashboard.report_types.post')}`;
            case 'comment': return `💬 ${t('admin_dashboard.report_types.comment')}`;
            case 'user': return `👤 ${t('admin_dashboard.report_types.user')}`;
            default: return type;
        }
    };

    const get_report_status_label = (status) => {
        switch(status) 
        {
            case 'pending': return `⏳ ${t('admin_dashboard.report_status.pending')}`;
            case 'resolved': return `✅ ${t('admin_dashboard.report_status.resolved')}`;
            case 'rejected': return `❌ ${t('admin_dashboard.report_status.rejected')}`;
            default: return status;
        }
    };

    const format_role_label = (role) => role === 'admin' ? 'Admin' : 'User';

    useEffect(() => {
        if(!isAuthenticated || user?.role !== 'admin') return;

        fetch_dashboard_data();
    }, [isAuthenticated, user]);

    const fetch_dashboard_data = async () => {
        try 
        {
            set_loading(true);
            
            const stats_res = await fetch('/api/admin/stats', { credentials: 'include' });
            const stats_data = await stats_res.json();
            if(stats_data.status === 'success') set_stats(stats_data.data);

            const users_res = await fetch('/api/users?limit=20', { credentials: 'include' });
            const users_data = await users_res.json();
            if(users_data.status === 'success') 
                {
                const normalized_users = (users_data.data || []).map(u => ({
                    ...u,
                    role: u.role === 'guest' ? 'user' : u.role
                }));
                set_users(normalized_users);
            }

            const posts_res = await fetch('/api/posts?limit=20', { credentials: 'include' });
            const posts_data = await posts_res.json();
            if(posts_data.status === 'success') 
                {
                const posts_with_details = (posts_data.data || []).map(post => ({
                    ...post,
                    likes_count: post.likes_count || 0,
                    dislikes_count: post.dislikes_count || 0,
                    comments_count: post.comments_count || 0
                }));

                set_posts(posts_with_details);
            }

            const categories_res = await fetch('/api/categories', { credentials: 'include' });
            const categories_data = await categories_res.json();
            if(categories_data.status === 'success') 
                {
                const cats = categories_data.data?.categories || categories_data.data || [];
                set_categories(Array.isArray(cats) ? cats : []);
            }

            const reports_res = await fetch('/api/reports?limit=20&status=pending', { credentials: 'include' });
            const reports_data = await reports_res.json();
            if(reports_data.status === 'success') set_reports(Array.isArray(reports_data.data) ? reports_data.data : []);
        } catch(error) 
        {
            console.error('Error fetching dashboard data:', error);
        } finally 
        {
            set_loading(false);
        }
    };

    const handle_delete_user = async (userId) => {
        if(!window.confirm(t('admin_dashboard.confirm_delete_user'))) return;
        
        try 
        {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if(res.ok) set_users(users.filter(u => u.id !== userId));
        } catch(error) 
        {
            console.error('Error deleting user:', error);
        }
    };

    const open_edit_user_modal = (user) => {
        set_editing_user(user);
        set_edit_user_form({
            login: user.login || '',
            full_name: user.full_name || '',
            email: user.email || '',
            role: user.role || 'user'
        });
        set_show_edit_user_modal(true);
    };

    const handle_edit_user_change = (field, value) => {
        set_edit_user_form(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handle_update_user = async () => {
        if(!editing_user) return;

        try 
        {
            const response = await fetch(`/api/users/${editing_user.id}`, {
                method: 'PATCH',
                headers: 
                {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',
                body: JSON.stringify({
                    login: edit_user_form.login,
                    full_name: edit_user_form.full_name,
                    email: edit_user_form.email,
                    role: edit_user_form.role
                })
            });

            const data = await response.json();

            if(!response.ok) 
                {
                throw new Error(data?.message || t('admin_dashboard.notifications.user_update_error'));
            }

            if(data?.data) 
                {
                const updated = data.data;
                set_users(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
            }

            set_show_edit_user_modal(false);
            set_editing_user(null);
        } catch(error) 
        {
            alert(error.message || t('admin_dashboard.notifications.user_update_error'));
        }
    };

    const handle_delete_post = async (postId) => {
        if(!window.confirm(t('admin_dashboard.confirm_delete_post'))) return;
        
        try 
        {
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if(res.ok) set_posts(posts.filter(p => p.id !== postId));
        } catch(error) 
        {
            console.error('Error deleting post:', error);
        }
    };

    const handle_delete_comment = async (commentId) => {
        if(!window.confirm(t('admin_dashboard.confirm_delete_comment'))) return;
        
        try 
        {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if(res.ok) set_comments(comments.filter(c => c.id !== commentId));
        } catch(error) 
        {
            console.error('Error deleting comment:', error);
        }
    };

    const handle_view_report = (report) => {
        set_selected_report(report);
        set_show_report_modal(true);
    };

    const handle_report_action = async (reportId, action) => {
        if(!window.confirm(t('admin_dashboard.confirm_report_status', { status: t(`admin_dashboard.report_status.${action}`, { defaultValue: action }) }))) return;
        
        try 
        {
            const res = await fetch(`/api/reports/${reportId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: action })
            });

            if(res.ok) 
                {
                set_reports(reports.map(r => r.id === reportId ? { ...r, status: action } : r));
                set_show_report_modal(false);
                alert(t('admin_dashboard.notifications.report_status_updated'));
            }
        } catch(error) 
        {
            console.error('Error updating report:', error);
            alert(t('admin_dashboard.notifications.report_status_error'));
        }
    };

    const handle_create_category = async (e) => {
        e.preventDefault();

        if(!category_form.title.trim()) 
        {
            alert(t('admin_dashboard.notifications.category_title_required', { defaultValue: 'Назва категорії не може бути порожною' }));
            return;
        }

        set_creating_category(true);

        try 
        {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    title: category_form.title.trim(),
                    description: category_form.description.trim()
                })
            });

            const data = await response.json();

            if(response.ok && data.status === 'success') 
            {
                set_categories([...categories, data.data]);
                set_category_form({ title: '', description: '' });
                set_show_create_category_modal(false);
                alert(t('admin_dashboard.notifications.category_created', { defaultValue: 'Категорія успішно створена' }));
                fetch_dashboard_data();
            } else 
            {
                alert(data.message || t('admin_dashboard.notifications.category_creation_error', { defaultValue: 'Помилка створення категорії' }));
            }
        } catch(error) 
        {
            console.error('Error creating category:', error);
            alert(t('admin_dashboard.notifications.category_creation_error', { defaultValue: 'Помилка створення категорії' }));
        } finally 
        {
            set_creating_category(false);
        }
    };

    const filtered_users = users.filter(u => 
        u.login?.toLowerCase().includes(search_query.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(search_query.toLowerCase())
    );

    const filtered_posts = posts.filter(p => 
        p.title?.toLowerCase().includes(search_query.toLowerCase())
    );

    if(!isAuthenticated || user?.role !== 'admin') 
        {
        return (
            <div className = "app-container">
                <Header />
                <main className = "main-content">
                    <div className = "admin-access-denied">
                        <h1>{t('admin_dashboard.access_denied_title')}</h1>
                        <p>{t('admin_dashboard.access_denied_description')}</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if(loading) 
        {
        return (
            <div className = "app-container">
                <Header />
                <main className = "main-content">
                    <div className = "admin-loading">{t('common.loading')}</div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className = "app-container">
            <Header />
            <main className = "main-content">
                <div className = "admin-dashboard">
                    {/* Sidebar */}
                    <aside className = "admin-sidebar">
                        <div className = "sidebar-header">
                            <h2>🛡️ {t('admin.title')}</h2>
                        </div>
                        <nav className = "sidebar-menu">
                            <button
                                className = {`menu-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                                onClick = {() => set_active_section('dashboard')}
                            >
                                <FiHome /> {t('admin.dashboard')}
                            </button>
                            <button
                                className = {`menu-item ${activeSection === 'users' ? 'active' : ''}`}
                                onClick = {() => set_active_section('users')}
                            >
                                <FaUsers /> {t('admin.users')}
                            </button>
                            <button
                                className = {`menu-item ${activeSection === 'posts' ? 'active' : ''}`}
                                onClick = {() => set_active_section('posts')}
                            >
                                <BsFileEarmarkPost /> {t('admin.posts')}
                            </button>
                            <button
                                className = {`menu-item ${activeSection === 'comments' ? 'active' : ''}`}
                                onClick = {() => set_active_section('comments')}
                            >
                                <FaComments /> {t('admin_dashboard.sidebar.comments')}
                            </button>
                            <button
                                className = {`menu-item ${activeSection === 'categories' ? 'active' : ''}`}
                                onClick = {() => set_active_section('categories')}
                            >
                                <BiCategory /> {t('admin.categories')}
                            </button>
                            <button
                                className={`menu-item ${activeSection === 'reports' ? 'active' : ''}`}
                                onClick={() => set_active_section('reports')}
                            >
                                <FiFlag /> {t('admin.reports')}
                            </button>
                            <button
                                className = {`menu-item ${activeSection === 'settings' ? 'active' : ''}`}
                                onClick = {() => set_active_section('settings')}
                            >
                                <FiSettings /> {t('settings.title')}
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <div className = "admin-content">
                        {/* Dashboard */}
                        {activeSection === 'dashboard' && (
                            <div className = "section-dashboard">
                                <h1>{t('admin.dashboard')}</h1>
                                <div className = "stats-grid">
                                    <div className = "stat-card users">
                                        <div className = "stat-icon">
                                            <FaUsers />
                                        </div>
                                        <div className = "stat-info">
                                            <h3>{stats.totalUsers}</h3>
                                            <p>{t('admin_dashboard.stats.users')}</p>
                                        </div>
                                    </div>
                                    <div className = "stat-card posts">
                                        <div className = "stat-icon">
                                            <BsFileEarmarkPost />
                                        </div>
                                        <div className = "stat-info">
                                            <h3>{stats.totalPosts}</h3>
                                            <p>{t('admin_dashboard.stats.posts')}</p>
                                        </div>
                                    </div>
                                    <div className = "stat-card comments">
                                        <div className = "stat-icon">
                                            <FaComments />
                                        </div>
                                        <div className = "stat-info">
                                            <h3>{stats.totalComments}</h3>
                                            <p>{t('admin_dashboard.stats.comments')}</p>
                                        </div>
                                    </div>
                                    <div className = "stat-card categories">
                                        <div className = "stat-icon">
                                            <BiCategory />
                                        </div>
                                        <div className = "stat-info">
                                            <h3>{stats.totalCategories}</h3>
                                            <p>{t('admin_dashboard.stats.categories')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Users */}
                        {activeSection === 'users' && (
                            <div className = "section-users">
                                <div className = "section-header">
                                    <h1>{t('admin.manage_users')}</h1>
                                    <input
                                        type = "text"
                                        placeholder = {t('admin_dashboard.users.search_placeholder')}
                                        value = {search_query}
                                        onChange = {(e) => set_search_query(e.target.value)}
                                        className = "search-input"
                                    />
                                </div>
                                <div className = "table-container">
                                    <table className = "data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>{t('admin_dashboard.users.table.login')}</th>
                                                <th>{t('admin_dashboard.users.table.name')}</th>
                                                <th>Email</th>
                                                <th>{t('admin_dashboard.users.table.role')}</th>
                                                <th>{t('admin_dashboard.users.table.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered_users.map(user => (
                                                <tr key = {user.id}>
                                                    <td>{user.id}</td>
                                                    <td>{user.login}</td>
                                                    <td>{user.full_name}</td>
                                                    <td>{user.email}</td>
                                                    <td><span className = {`role-badge ${user.role}`}>{format_role_label(user.role)}</span></td>
                                                    <td>
                                                        <div className = "table-actions">
                                                            <button
                                                                className = "admin-btn-edit"
                                                                onClick = {() => open_edit_user_modal(user)}
                                                                title = {t('common.edit')}
                                                            >
                                                                <FiEdit2 />
                                                            </button>
                                                            <button
                                                                className = "btn-delete"
                                                                onClick = {() => handle_delete_user(user.id)}
                                                                title = {t('common.delete')}
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Posts */}
                        {activeSection === 'posts' && (
                            <div className = "section-posts">
                                <div className = "section-header">
                                    <h1>{t('admin.manage_posts')}</h1>
                                    <input
                                        type = "text"
                                        placeholder = {t('admin_dashboard.posts.search_placeholder')}
                                        value = {search_query}
                                        onChange = {(e) => set_search_query(e.target.value)}
                                        className = "search-input"
                                    />
                                </div>
                                <div className = "table-container">
                                    <table className = "data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>{t('admin_dashboard.posts.table.title')}</th>
                                                <th>{t('admin_dashboard.posts.table.author')}</th>
                                                <th>{t('admin_dashboard.posts.table.date')}</th>
                                                <th>{t('admin_dashboard.posts.table.likes')}</th>
                                                <th>{t('admin_dashboard.posts.table.comments')}</th>
                                                <th>{t('admin_dashboard.posts.table.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered_posts.map(post => (
                                                <tr key = {post.id}>
                                                    <td>{post.id}</td>
                                                    <td>{post.title}</td>
                                                    <td>{post.author_login || post.author?.login || post.author_name || '—'}</td>
                                                    <td>{new Date(post.publish_date).toLocaleDateString(i18n.language || undefined)}</td>
                                                    <td>{post.likes_count || 0}</td>
                                                    <td>{post.comments_count || 0}</td>
                                                    <td>
                                                        <button
                                                            className = "btn-delete"
                                                            onClick = {() => handle_delete_post(post.id)}
                                                            title = {t('common.delete')}
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Comments - Disabled for now */}
                        {activeSection === 'comments' && (
                            <div className = "section-comments">
                                <div className = "section-header">
                                    <h1>{t('admin_dashboard.comments.title')}</h1>
                                </div>
                                <div className = "no-data-message">
                                    <p>{t('admin_dashboard.comments.description')}</p>
                                </div>
                            </div>
                        )}

                        {/* Categories */}
                        {activeSection === 'categories' && (
                            <div className = "section-categories">
                                <div className = "section-header">
                                    <h1>{t('admin_dashboard.categories.title')}</h1>
                                    <button 
                                        className = "btn-add-category"
                                        onClick = {() => set_show_create_category_modal(true)}
                                    >
                                        <FiPlus /> Додати категорію
                                    </button>
                                </div>
                                <div className = "categories-grid">
                                    {Array.isArray(categories) && categories.map(cat => (
                                        <div key = {cat.id} className = "category-card">
                                            <h3>{cat.title}</h3>
                                            <p>{cat.description}</p>
                                            <div className = "category-footer">
                                                <span className = "cat-id">ID: {cat.id}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!Array.isArray(categories) || categories.length === 0) && (
                                        <p className = "no-data">{t('admin_dashboard.categories.empty')}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reports */}
                        {activeSection === 'reports' && (
                            <div className = "section-reports">
                                <div className = "section-header">
                                    <h1>{t('admin.manage_reports')}</h1>
                                </div>
                                <div className = "reports-table-container">
                                    {Array.isArray(reports) && reports.length > 0 ? (
                                        <table className = "reports-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>{t('admin_dashboard.reports.table.type')}</th>
                                                    <th>{t('admin_dashboard.reports.table.target')}</th>
                                                    <th>{t('admin_dashboard.reports.table.reason')}</th>
                                                    <th>{t('admin_dashboard.reports.table.status')}</th>
                                                    <th>{t('admin_dashboard.reports.table.action')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reports.map(report => (
                                                    <tr key = {report.id}>
                                                        <td>#{report.id}</td>
                                                        <td>
                                                            <span className = "report-type-badge">
                                                                {get_report_type_label(report.reported_type)}
                                                            </span>
                                                        </td>
                                                        <td>{report.reported_id}</td>
                                                        <td>{get_report_reason_label(report.reason)}</td>
                                                        <td>
                                                            <span className = {`status-badge status-${report.status}`}>
                                                                {get_report_status_label(report.status)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className = "action-btn"
                                                                onClick={() => handle_view_report(report)}
                                                            >
                                                                {t('admin_dashboard.reports.view_button')}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className = "no-data-message">
                                            <p>{t('admin_dashboard.reports.empty')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Settings */}
                        {activeSection === 'settings' && (
                            <div className = "section-settings">
                                <h1>{t('admin_dashboard.settings.title')}</h1>
                                <div className = "settings-container">
                                    <div className = "setting-card">
                                        <h3>{t('admin_dashboard.settings.general.title')}</h3>
                                        <p>{t('admin_dashboard.settings.general.version', { version: '1.0.0' })}</p>
                                        <p>{t('admin_dashboard.settings.general.status')}</p>
                                    </div>
                                    <div className = "setting-card">
                                        <h3>{t('admin_dashboard.settings.database.title')}</h3>
                                        <p>{t('admin_dashboard.settings.database.type', { type: 'MySQL 8.0.22+' })}</p>
                                        <p>{t('admin_dashboard.settings.database.status')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Report Details Modal */}
                        {show_edit_user_modal && (
                            <div className = "admin-modal-overlay" onClick = {() => { set_show_edit_user_modal(false); set_editing_user(null); }}>
                                <div className = "admin-modal-content" onClick = {(e) => e.stopPropagation()}>
                                    <div className = "admin-modal-header">
                                        <h2>{t('admin_dashboard.edit_user.title')}</h2>
                                        <button className = "admin-modal-close" onClick = {() => { set_show_edit_user_modal(false); set_editing_user(null); }}>✕</button>
                                    </div>
                                    <div className = "admin-modal-body">
                                        <div className = "admin-edit-user-form">
                                            <label>
                                                <span>{t('admin_dashboard.edit_user.fields.login')}</span>
                                                <input
                                                    type = "text"
                                                    value = {edit_user_form.login}
                                                    onChange = {(e) => handle_edit_user_change('login', e.target.value)}
                                                />
                                            </label>
                                            <label>
                                                <span>{t('admin_dashboard.edit_user.fields.full_name')}</span>
                                                <input
                                                    type = "text"
                                                    value = {edit_user_form.full_name}
                                                    onChange = {(e) => handle_edit_user_change('full_name', e.target.value)}
                                                />
                                            </label>
                                            <label>
                                                <span>Email</span>
                                                <input
                                                    type = "email"
                                                    value = {edit_user_form.email}
                                                    onChange = {(e) => handle_edit_user_change('email', e.target.value)}
                                                />
                                            </label>
                                            <label>
                                                <span>{t('admin_dashboard.edit_user.fields.role')}</span>
                                                <select
                                                    value = {edit_user_form.role}
                                                    onChange = {(e) => handle_edit_user_change('role', e.target.value)}
                                                >
                                                    <option value = "user">User</option>
                                                    <option value = "admin">Admin</option>
                                                </select>
                                            </label>
                                        </div>
                                    </div>
                                    <div className = "admin-modal-footer">
                                        <button className = "admin-btn-action admin-btn-cancel" onClick = {() => { set_show_edit_user_modal(false); set_editing_user(null); }}>{t('common.cancel')}</button>
                                        <button className = "admin-btn-action admin-btn-approve" onClick = {handle_update_user}>{t('common.save')}</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {show_report_modal && selected_report && (
                <div className = "admin-modal-overlay" onClick = {() => set_show_report_modal(false)}>
                    <div className = "admin-modal-content" onClick = {(e) => e.stopPropagation()}>
                        <div className = "admin-modal-header">
                            <h2>{t('admin_dashboard.report_modal.title', { id: selected_report.id })}</h2>
                            <button 
                                className = "admin-modal-close"
                                onClick={() => set_show_report_modal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className = "admin-modal-body">
                            <div className = "report-detail-group">
                                <label>{t('admin_dashboard.report_modal.object_type')}</label>
                                <span>{get_report_type_label(selected_report.reported_type)}</span>
                            </div>
                            <div className = "report-detail-group">
                                <label>{t('admin_dashboard.report_modal.object_id')}</label>
                                <span>#{selected_report.reported_id}</span>
                            </div>
                            <div className = "report-detail-group">
                                <label>{t('admin_dashboard.report_modal.reason')}</label>
                                <span>{get_report_reason_label(selected_report.reason)}</span>
                            </div>
                            <div className = "report-detail-group">
                                <label>{t('admin_dashboard.report_modal.description')}</label>
                                <p>{selected_report.description || t('admin_dashboard.report_modal.no_description')}</p>
                            </div>
                            <div className = "report-detail-group">
                                <label>{t('admin_dashboard.report_modal.submitted_at')}</label>
                                <span>{new Date(selected_report.created_at).toLocaleString(i18n.language || undefined)}</span>
                            </div>
                            <div className = "report-detail-group">
                                <label>{t('admin_dashboard.report_modal.status')}</label>
                                <span className = {`status-badge status-${selected_report.status}`}>
                                    {get_report_status_label(selected_report.status)}
                                </span>
                            </div>
                        </div>
                        <div className = "admin-modal-footer">
                            <button 
                                className = "admin-btn-action admin-btn-approve"
                                onClick={() => handle_report_action(selected_report.id, 'resolved')}
                                disabled={selected_report.status !== 'pending'}
                            >
                                ✅ {t('admin_dashboard.report_modal.resolve_button')}
                            </button>
                            <button 
                                className = "admin-btn-action admin-btn-reject"
                                onClick={() => handle_report_action(selected_report.id, 'rejected')}
                                disabled={selected_report.status !== 'pending'}
                            >
                                ❌ {t('admin_dashboard.report_modal.reject_button')}
                            </button>
                            <button 
                                className = "admin-btn-action admin-btn-cancel"
                                onClick = {() => set_show_report_modal(false)}
                            >
                                {t('common.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Category Modal */}
            {show_create_category_modal && (
                <div className = "admin-modal-overlay" onClick = {() => set_show_create_category_modal(false)}>
                    <div className = "admin-modal-content" onClick = {(e) => e.stopPropagation()}>
                        <div className = "admin-modal-header">
                            <h2>Створити нову категорію</h2>
                            <button 
                                className = "admin-modal-close"
                                onClick={() => set_show_create_category_modal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <form className = "admin-modal-body" onSubmit={handle_create_category}>
                            <div className = "admin-edit-user-form">
                                <label>
                                    <span>Назва категорії *</span>
                                    <input
                                        type = "text"
                                        value = {category_form.title}
                                        onChange = {(e) => set_category_form({ ...category_form, title: e.target.value })}
                                        placeholder = "Наприклад: GameMaker, Unreal Engine..."
                                        required
                                        style = {{ fontFamily: 'inherit', padding: '12px', borderRadius: '8px', border: '2px solid rgba(108, 99, 255, 0.3)' }}
                                    />
                                </label>
                                <label>
                                    <span>Опис (необов'язково)</span>
                                    <textarea
                                        value = {category_form.description}
                                        onChange = {(e) => set_category_form({ ...category_form, description: e.target.value })}
                                        placeholder = "Опишіть цю категорію..."
                                        rows = {4}
                                        style = {{ fontFamily: 'inherit', padding: '12px', borderRadius: '8px', border: '2px solid rgba(108, 99, 255, 0.3)', backgroundColor: 'rgba(10, 10, 16, 0.5)', color: '#e0e0e0', resize: 'vertical' }}
                                    />
                                </label>
                            </div>
                            <div className = "admin-modal-footer">
                                <button 
                                    type = "button"
                                    className = "admin-btn-action admin-btn-cancel" 
                                    onClick = {() => set_show_create_category_modal(false)}
                                    disabled = {creating_category}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button 
                                    type = "submit"
                                    className = "admin-btn-action admin-btn-approve"
                                    disabled = {creating_category}
                                >
                                    {creating_category ? 'Створення...' : 'Створити'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
