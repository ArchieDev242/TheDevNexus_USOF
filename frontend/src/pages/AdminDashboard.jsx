import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiUsers, FiFileText, FiMessageSquare, FiTag, FiSettings, FiHome, FiMoreVertical, FiEdit2, FiTrash2, FiPlus, FiFlag } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../style/admin-dashboard.css';

const REPORT_REASONS_MAP = {
    spam: 'Спам',
    harassment: 'Агресія/Переслідування',
    inappropriate: 'Неналежний контент',
    misinformation: 'Дезінформація',
    copyright: 'Порушення авторських прав'
};

export default function AdminDashboard() 
{
    const { user, isAuthenticated } = useSelector(state => state.auth);
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

    useEffect(() => {
        if(!isAuthenticated || user?.role !== 'admin') return;

        fetchDashboardData();
    }, [isAuthenticated, user]);

    const fetchDashboardData = async () => {
        try 
        {
            set_loading(true);
            
            const stats_res = await fetch('/api/admin/stats', { credentials: 'include' });
            const stats_data = await stats_res.json();
            if(stats_data.status === 'success') set_stats(stats_data.data);

            const users_res = await fetch('/api/users?limit=20', { credentials: 'include' });
            const users_data = await users_res.json();
            if(users_data.status === 'success') set_users(users_data.data || []);

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

    const handleDeleteUser = async (userId) => {
        if(!window.confirm('Видалити користувача?')) return;
        
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

    const handleDeletePost = async (postId) => {
        if(!window.confirm('Видалити пост?')) return;
        
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

    const handleDeleteComment = async (commentId) => {
        if(!window.confirm('Видалити коментар?')) return;
        
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

    const handleViewReport = (report) => {
        set_selected_report(report);
        set_show_report_modal(true);
    };

    const handleReportAction = async (reportId, action) => {
        if(!window.confirm(`Ви впевнені? Статус буде змінений на "${action}".`)) return;
        
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
                alert('Статус отчета оновлений успішно!');
            }
        } catch(error) 
        {
            console.error('Error updating report:', error);
            alert('Помилка при оновленні статусу отчета');
        }
    };

    const format_report_reason = (reason) => {
        return REPORT_REASONS_MAP[reason] || reason;
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
                        <h1>Доступ заборонений</h1>
                        <p>Тільки адміністратори можуть заходити на цю сторінку</p>
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
                    <div className = "admin-loading">Завантаження...</div>
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
                            <h2>🛡️ Admin Panel</h2>
                        </div>
                        <nav className = "sidebar-menu">
                            <button
                                className = {`menu-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                                onClick = {() => set_active_section('dashboard')}
                            >
                                <FiHome /> Дашборд
                            </button>
                            <button
                                className = {`menu-item ${activeSection === 'users' ? 'active' : ''}`}
                                onClick = {() => set_active_section('users')}
                            >
                                <FiUsers /> Користувачі
                            </button>
                            <button
                                className = {`menu-item ${activeSection === 'posts' ? 'active' : ''}`}
                                onClick = {() => set_active_section('posts')}
                            >
                                <FiFileText /> Пости
                            </button>
                            <button
                                className = {`menu-item ${activeSection === 'comments' ? 'active' : ''}`}
                                onClick = {() => set_active_section('comments')}
                            >
                                <FiMessageSquare /> Коментарі
                            </button>
                            <button
                                className = {`menu-item ${activeSection === 'categories' ? 'active' : ''}`}
                                onClick = {() => set_active_section('categories')}
                            >
                                <FiTag /> Категорії
                            </button>
                            <button
                                className={`menu-item ${activeSection === 'reports' ? 'active' : ''}`}
                                onClick={() => set_active_section('reports')}
                            >
                                <FiFlag /> Репорти
                            </button>
                            <button
                                className = {`menu-item ${activeSection === 'settings' ? 'active' : ''}`}
                                onClick = {() => set_active_section('settings')}
                            >
                                <FiSettings /> Налаштування
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <div className = "admin-content">
                        {/* Dashboard */}
                        {activeSection === 'dashboard' && (
                            <div className = "section-dashboard">
                                <h1>Дашборд</h1>
                                <div className = "stats-grid">
                                    <div className = "stat-card users">
                                        <div className = "stat-icon">
                                            <FiUsers />
                                        </div>
                                        <div className = "stat-info">
                                            <h3>{stats.totalUsers}</h3>
                                            <p>Користувачів</p>
                                        </div>
                                    </div>
                                    <div className = "stat-card posts">
                                        <div className = "stat-icon">
                                            <FiFileText />
                                        </div>
                                        <div className = "stat-info">
                                            <h3>{stats.totalPosts}</h3>
                                            <p>Постів</p>
                                        </div>
                                    </div>
                                    <div className = "stat-card comments">
                                        <div className = "stat-icon">
                                            <FiMessageSquare />
                                        </div>
                                        <div className = "stat-info">
                                            <h3>{stats.totalComments}</h3>
                                            <p>Коментарів</p>
                                        </div>
                                    </div>
                                    <div className = "stat-card categories">
                                        <div className = "stat-icon">
                                            <FiTag />
                                        </div>
                                        <div className = "stat-info">
                                            <h3>{stats.totalCategories}</h3>
                                            <p>Категорій</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Users */}
                        {activeSection === 'users' && (
                            <div className = "section-users">
                                <div className = "section-header">
                                    <h1>Управління користувачами</h1>
                                    <input
                                        type = "text"
                                        placeholder = "Пошук користувачів..."
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
                                                <th>Логін</th>
                                                <th>Ім'я</th>
                                                <th>Email</th>
                                                <th>Роль</th>
                                                <th>Дії</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered_users.map(user => (
                                                <tr key = {user.id}>
                                                    <td>{user.id}</td>
                                                    <td>{user.login}</td>
                                                    <td>{user.full_name}</td>
                                                    <td>{user.email}</td>
                                                    <td><span className = {`role-badge ${user.role}`}>{user.role}</span></td>
                                                    <td>
                                                        <button
                                                            className = "btn-delete"
                                                            onClick = {() => handleDeleteUser(user.id)}
                                                            title = "Видалити"
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

                        {/* Posts */}
                        {activeSection === 'posts' && (
                            <div className = "section-posts">
                                <div className = "section-header">
                                    <h1>Управління постами</h1>
                                    <input
                                        type = "text"
                                        placeholder = "Пошук постів..."
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
                                                <th>Заголовок</th>
                                                <th>Автор</th>
                                                <th>Дата</th>
                                                <th>Лайки</th>
                                                <th>Коментарі</th>
                                                <th>Дії</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered_posts.map(post => (
                                                <tr key = {post.id}>
                                                    <td>{post.id}</td>
                                                    <td>{post.title}</td>
                                                    <td>{post.author?.login || 'Anonymous'}</td>
                                                    <td>{new Date(post.publish_date).toLocaleDateString('uk-UA')}</td>
                                                    <td>{post.likes_count || 0}</td>
                                                    <td>{post.comments_count || 0}</td>
                                                    <td>
                                                        <button
                                                            className = "btn-delete"
                                                            onClick = {() => handleDeletePost(post.id)}
                                                            title = "Видалити"
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
                                    <h1>Управління коментарями</h1>
                                </div>
                                <div className = "no-data-message">
                                    <p>Коментарії вставляються з постів. Управління можливе через адмін-сторінку постів.</p>
                                </div>
                            </div>
                        )}

                        {/* Categories */}
                        {activeSection === 'categories' && (
                            <div className = "section-categories">
                                <div className = "section-header">
                                    <h1>Управління категоріями</h1>
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
                                        <p className = "no-data">Категорії не знайдені</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reports */}
                        {activeSection === 'reports' && (
                            <div className = "section-reports">
                                <div className = "section-header">
                                    <h1>Управління репортами</h1>
                                </div>
                                <div className = "reports-table-container">
                                    {Array.isArray(reports) && reports.length > 0 ? (
                                        <table className = "reports-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Тип</th>
                                                    <th>Об'єкт</th>
                                                    <th>Причина</th>
                                                    <th>Статус</th>
                                                    <th>Дія</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reports.map(report => (
                                                    <tr key = {report.id}>
                                                        <td>#{report.id}</td>
                                                        <td>
                                                            <span className = "report-type-badge">
                                                                {report.reported_type === 'post' ? '📝 Пост' :
                                                                 report.reported_type === 'comment' ? '💬 Коментар' :
                                                                 report.reported_type === 'user' ? '👤 Користувач' : report.reported_type}
                                                            </span>
                                                        </td>
                                                        <td>{report.reported_id}</td>
                                                        <td>{format_report_reason(report.reason)}</td>
                                                        <td>
                                                            <span className = {`status-badge status-${report.status}`}>
                                                                {report.status === 'pending' ? '⏳ Очікує' :
                                                                 report.status === 'resolved' ? '✅ Розв\'язано' :
                                                                 report.status === 'rejected' ? '❌ Відхилено' : report.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className = "action-btn"
                                                                onClick={() => handleViewReport(report)}
                                                            >
                                                                Переглянути
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className = "no-data-message">
                                            <p>Репортів не знайдено</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Settings */}
                        {activeSection === 'settings' && (
                            <div className = "section-settings">
                                <h1>Налаштування системи</h1>
                                <div className = "settings-container">
                                    <div className = "setting-card">
                                        <h3>Загальні налаштування</h3>
                                        <p>Версія: 1.0.0</p>
                                        <p>Статус: 🟢 Активний</p>
                                    </div>
                                    <div className = "setting-card">
                                        <h3>База даних</h3>
                                        <p>Тип: MySQL 8.0.22+</p>
                                        <p>Статус: 🟢 Підключено</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Report Details Modal */}
            {show_report_modal && selected_report && (
                <div className = "modal-overlay" onClick = {() => set_show_report_modal(false)}>
                    <div className = "modal-content" onClick = {(e) => e.stopPropagation()}>
                        <div className = "modal-header">
                            <h2>Деталі репорту #{selected_report.id}</h2>
                            <button 
                                className = "modal-close"
                                onClick={() => set_show_report_modal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className = "modal-body">
                            <div className = "report-detail-group">
                                <label>Тип об'єкта:</label>
                                <span>{selected_report.reported_type === 'post' ? '📝 Пост' :
                                         selected_report.reported_type === 'comment' ? '💬 Коментар' :
                                         selected_report.reported_type === 'user' ? '👤 Користувач' : selected_report.reported_type}</span>
                            </div>
                            <div className = "report-detail-group">
                                <label>ID об'єкта:</label>
                                <span>#{selected_report.reported_id}</span>
                            </div>
                            <div className = "report-detail-group">
                                <label>Причина:</label>
                                <span>{format_report_reason(selected_report.reason)}</span>
                            </div>
                            <div className = "report-detail-group">
                                <label>Опис:</label>
                                <p>{selected_report.description || 'Без опису'}</p>
                            </div>
                            <div className = "report-detail-group">
                                <label>Поданий:</label>
                                <span>{new Date(selected_report.created_at).toLocaleString('uk-UA')}</span>
                            </div>
                            <div className = "report-detail-group">
                                <label>Статус:</label>
                                <span className = {`status-badge status-${selected_report.status}`}>
                                    {selected_report.status === 'pending' ? '⏳ Очікує' :
                                     selected_report.status === 'resolved' ? '✅ Розв\'язано' :
                                     selected_report.status === 'rejected' ? '❌ Відхилено' : selected_report.status}
                                </span>
                            </div>
                        </div>
                        <div className = "modal-footer">
                            <button 
                                className = "btn-action btn-approve"
                                onClick={() => handleReportAction(selected_report.id, 'resolved')}
                                disabled={selected_report.status !== 'pending'}
                            >
                                ✅ Розв'язати
                            </button>
                            <button 
                                className = "btn-action btn-reject"
                                onClick={() => handleReportAction(selected_report.id, 'rejected')}
                                disabled={selected_report.status !== 'pending'}
                            >
                                ❌ Відхилити
                            </button>
                            <button 
                                className = "btn-action btn-cancel"
                                onClick = {() => set_show_report_modal(false)}
                            >
                                Закрити
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
