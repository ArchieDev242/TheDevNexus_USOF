document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 TheDevNexus USOF loaded successfully!');
    check_user_status();
    setup_event_listeners();
});

function open_login_form() 
{
    console.log('Opening login form...');
    const modal = document.getElementById('loginModal');
    
    if(modal) 
        {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function open_register_form() 
{
    console.log('Opening register form...');
    const modal = document.getElementById('registerModal');
    
    if(modal) 
        {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function close_modal(modalId) 
{
    const modal = document.getElementById(modalId);
    
    if(modal) 
        {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function view_posts() 
{
    console.log('Viewing posts...');
    show_notification('Перегляд постів буде доступний незабаром!', 'info');
}

function view_categories() 
{
    console.log('Viewing categories...');
    show_notification('Перегляд категорій буде доступний незабаром!', 'info');
}

function view_users() 
{
    console.log('Viewing users...');
    show_notification('Перегляд користувачів буде доступний незабаром!', 'info');
}

async function check_user_status() 
{
    try 
    {
        const token = localStorage.getItem('authToken') || get_cookie('auth');
        
        if(token) 
            {
            const response = await fetch('/api/auth/verify', {
                method: 'GET',
                headers: 
                {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if(response.ok) 
                {
                const userData = await response.json();
                show_user_info(userData);
            } else 
                {
                localStorage.removeItem('authToken');
                delete_cookie('auth');
            }
        } else 
            {
            show_guest_info();
        }
    } catch(error) 
    {
        console.error('Error checking user status:', error);
        show_guest_info();
    }
}

function show_user_info(userData) 
{
    const auth_btns = document.querySelector('.auth-buttons');
    
    if(auth_btns && userData.user) 
        {
        auth_btns.innerHTML = `
            <div class="user-info">
                <span class="welcome-text">Вітаємо, ${userData.user.login}!</span>
                <button class="btn btn-outline" onclick="logout()">
                    🚪 Вийти
                </button>
            </div>
        `;
    }
    
    // Показати admin панель якщо користувач - адміністратор
    if(userData.user && userData.user.role === 'admin') {
        show_admin_panel();
    }
    
    const guest_info = document.querySelector('.guest-info');

    if(guest_info) 
        {
        guest_info.innerHTML = `
            <h4>Як зареєстрований користувач ви можете:</h4>
            <ul>
                <li>✅ Створювати пости</li>
                <li>✅ Коментувати пости</li>
                <li>✅ Ставити лайки</li>
                <li>✅ Редагувати свої пости</li>
                <li>✅ Управляти своїм профілем</li>
            </ul>
        `;
    }
}

function show_guest_info() 
{
    console.log('Showing guest interface');
}

async function logout() 
{
    try 
    {
        const token = localStorage.getItem('authToken') || get_cookie('auth');
        
        if(token) 
            {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: 
                {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        }
        
        localStorage.removeItem('authToken');
        delete_cookie('auth');
        location.reload();
        
    } catch(error) 
    {
        console.error('Logout error:', error);
        localStorage.removeItem('authToken');
        delete_cookie('auth');
        location.reload();
    }
}

function setup_event_listeners() 
{
    window.addEventListener('click', function(event) 
    {
        const login_modal = document.getElementById('loginModal');
        const register_modal = document.getElementById('registerModal');
        
        if(event.target === login_modal) close_modal('loginModal');
        
        if(event.target === register_modal) close_modal('registerModal');
    });
    
    document.addEventListener('keydown', function(event) 
    {
        if(event.key === 'Escape') 
            {
            close_modal('loginModal');
            close_modal('registerModal');
        }
    });
}

function show_notification(message, type = 'info') 
{
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="notification-close">&times;</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#e53e3e' : type === 'success' ? '#38a169' : '#3182ce'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    const close_btn = notification.querySelector('.notification-close');
    close_btn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if(notification.parentElement) notification.remove();
    }, 5000);
}

function get_cookie(name) 
{
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if(parts.length === 2) return parts.pop().split(';').shift();
    
    return null;
}

function delete_cookie(name) 
{
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
// ===============================
// COMPATIBILITY ALIASES (for HTML onclick events)
// ===============================
window.openLoginForm = open_login_form;
window.openRegisterForm = open_register_form;
window.closeModal = close_modal;
window.viewPosts = view_posts;
window.viewCategories = view_categories;
window.viewUsers = view_users;
window.logout = logout;

// ===============================
// ADMIN PANEL FUNCTIONS
// ===============================

function show_admin_panel() {
    // Створюємо admin панель після quick-actions
    const quick_actions = document.querySelector('.quick-actions');
    
    if(quick_actions && !document.querySelector('.admin-panel')) {
        const admin_panel = document.createElement('div');
        admin_panel.className = 'admin-panel';
        admin_panel.innerHTML = `
            <div class="admin-header">
                <h3>🔧 Панель адміністратора</h3>
                <p>Управління системою USOF</p>
            </div>
            <div class="admin-actions">
                <button class="btn btn-admin" onclick="open_admin_dashboard()">
                    📊 Кастомна Admin Panel
                </button>
                <button class="btn btn-admin" onclick="open_adminjs()">
                    ⚙️ AdminJS Panel
                </button>
                <button class="btn btn-admin" onclick="view_system_stats()">
                    📈 Статистика системи
                </button>
                <button class="btn btn-admin" onclick="manage_users()">
                    👥 Управління користувачами
                </button>
                <button class="btn btn-admin" onclick="moderate_content()">
                    Модерація контенту
                </button>
                <button class="btn btn-admin" onclick="system_settings()">
                    ⚙️ Налаштування системи
                </button>
            </div>
        `;
        
        quick_actions.insertAdjacentElement('afterend', admin_panel);
        add_admin_styles();
    }
}

function open_admin_dashboard() {
    window.open('/admin-panel', '_blank');
}

function open_adminjs() {
    window.open('/admin', '_blank');
}

async function view_system_stats() {
    try {
        show_loading('Завантаження статистики...');
        
        const token = localStorage.getItem('authToken') || get_cookie('auth');
        const [users, posts, comments, categories] = await Promise.all([
            fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/posts', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/posts/all/comments', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/categories', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const [usersData, postsData, commentsData, categoriesData] = await Promise.all([
            users.json(),
            posts.json(),
            comments.json(),
            categories.json()
        ]);
        
        show_stats_modal({
            users: usersData?.length || 0,
            posts: postsData?.length || 0,
            comments: commentsData?.length || 0,
            categories: categoriesData?.length || 0
        });
        
    } catch (error) {
        console.error('Error loading system stats:', error);
        show_notification('Помилка завантаження статистики', 'error');
    } finally {
        hide_loading();
    }
}

function show_stats_modal(stats) {
    const modal = document.createElement('div');
    modal.className = 'modal stats-modal';
    modal.innerHTML = `
        <div class="modal-content stats-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2>📈 Статистика системи USOF</h2>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${stats.users}</div>
                    <div class="stat-label">👥 Користувачі</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.posts}</div>
                    <div class="stat-label">📝 Пости</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.comments}</div>
                    <div class="stat-label">💬 Коментарі</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.categories}</div>
                    <div class="stat-label">📁 Категорії</div>
                </div>
            </div>
            <div class="stats-info">
                <p>📅 Останнє оновлення: ${new Date().toLocaleString('uk-UA')}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Закриття при кліку поза модальним вікном
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function manage_users() {
    show_notification('Перенаправлення до управління користувачами...', 'info');
    setTimeout(() => {
        window.open('/admin-panel#users', '_blank');
    }, 1000);
}

function moderate_content() {
    show_notification('Перенаправлення до модерації контенту...', 'info');
    setTimeout(() => {
        window.open('/admin-panel#posts', '_blank');
    }, 1000);
}

function system_settings() {
    show_notification('Перенаправлення до налаштувань системи...', 'info');
    setTimeout(() => {
        window.open('/admin-panel#settings', '_blank');
    }, 1000);
}

function show_loading(message = 'Завантаження...') {
    const loading = document.createElement('div');
    loading.id = 'loading-overlay';
    loading.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(loading);
}

function hide_loading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.remove();
    }
}

function add_admin_styles() {
    if (document.querySelector('#admin-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'admin-styles';
    style.textContent = `
        .admin-panel {
            margin: 30px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 25px;
            border-radius: 15px;
            color: white;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .admin-header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .admin-header h3 {
            margin: 0 0 10px 0;
            font-size: 1.5rem;
        }
        
        .admin-header p {
            margin: 0;
            opacity: 0.9;
        }
        
        .admin-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .btn-admin {
            background: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            padding: 12px 20px !important;
            border-radius: 8px !important;
            font-weight: 500 !important;
            transition: all 0.3s ease !important;
            backdrop-filter: blur(10px) !important;
        }
        
        .btn-admin:hover {
            background: rgba(255, 255, 255, 0.3) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
        }
        
        .stats-modal {
            position: fixed !important;
            z-index: 10000 !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0,0,0,0.5) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        
        .stats-content {
            background: white !important;
            padding: 30px !important;
            border-radius: 15px !important;
            max-width: 600px !important;
            width: 90% !important;
            position: relative !important;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .stat-item {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        .stats-info {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
        }
        
        #loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20000;
        }
        
        .loading-content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
        }
        
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
            .admin-actions {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `;
    document.head.appendChild(style);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .user-info {
        display: flex;
        align-items: center;
        gap: 20px;
        background: rgba(255, 255, 255, 0.95);
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    .welcome-text {
        font-size: 1.1rem;
        font-weight: 500;
        color: #2d3748;
    }
`;
document.head.appendChild(style);
