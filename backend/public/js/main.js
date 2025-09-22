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
                    🚪 Війти
                </button>
            </div>
        `;
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
