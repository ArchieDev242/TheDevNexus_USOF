// Dashboard JavaScript
class AdminDashboard 
{
    constructor() 
    {
        this.currentSection = 'dashboard';
        this.apiBase = '/api';
        this.init();
    }

    init() 
    {
        this.bindEvents();
        this.load_dashboard_data();
        this.checkMobileView();
    }

    bindEvents() 
    {
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('a').dataset.section;
                this.showSection(section);
            });
        });

        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modal').addEventListener('click', (e) => {
            if(e.target.id === 'modal') this.closeModal();
        });

        document.getElementById('userSearch')?.addEventListener('input', (e) => {
            this.searchUsers(e.target.value);
        });

        document.getElementById('postSearch')?.addEventListener('input', (e) => {
            this.searchPosts(e.target.value);
        });

        document.getElementById('commentSearch')?.addEventListener('input', (e) => {
            this.searchComments(e.target.value);
        });

        document.getElementById('userRoleFilter')?.addEventListener('change', (e) => {
            this.filterUsers('role', e.target.value);
        });

        document.getElementById('postStatusFilter')?.addEventListener('change', (e) => {
            this.filterPosts('status', e.target.value);
        });

        document.getElementById('commentStatusFilter')?.addEventListener('change', (e) => {
            this.filterComments('status', e.target.value);
        });

        document.getElementById('addUserBtn')?.addEventListener('click', () => {
            this.showAddUserModal();
        });

        document.getElementById('addPostBtn')?.addEventListener('click', async () => {
            await this.showAddPostModal();
        });

        document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
            this.showAddCategoryModal();
        });

        window.addEventListener('resize', () => {
            this.checkMobileView();
        });
    }

    showSection(sectionName) 
    {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        document.getElementById(sectionName).classList.add('active');

        document.querySelectorAll('.sidebar-menu li').forEach(li => {
            li.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).parentElement.classList.add('active');

        const titles = {
            dashboard: 'Дашборд',
            users: 'Користувачі',
            posts: 'Пости',
            comments: 'Коментарі',
            categories: 'Категорії',
            settings: 'Налаштування'
        };
        document.getElementById('pageTitle').textContent = titles[sectionName];

        this.currentSection = sectionName;

        this.load_section_data(sectionName);
    }

    toggleSidebar() 
    {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
    }

    checkMobileView() 
    {
        const is_mobile = window.innerWidth <= 768;
        const sidebar = document.querySelector('.sidebar');
        
        if(is_mobile) sidebar.classList.remove('active');
    }

    showLoading() 
    {
        document.getElementById('loadingSpinner').style.display = 'block';
    }

    hideLoading() 
    {
        document.getElementById('loadingSpinner').style.display = 'none';
    }

    showModal(content) 
    {
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').style.display = 'block';
    }

    closeModal() 
    {
        document.getElementById('modal').style.display = 'none';
    }

    async api_call(endpoint, method = 'GET', data = null) 
    {
        try 
        {
            const options = 
            {
                method,
                headers: 
                {
                    'Content-Type': 'application/json',
                }
            };

            if(data) options.body = JSON.stringify(data);

            const response = await fetch(`${this.apiBase}${endpoint}`, options);
            
            if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            
            if(result && result.status === 'success' && result.data) return result.data;
            
            return result;
        } catch(error) 
        {
            console.error('API call failed:', error);
            this.showNotification('Помилка при завантаженні даних', 'error');
            return null;
        }
    }

    async load_dashboard_data() 
    {
        this.showLoading();
        
        try 
        {
            console.log('Loading dashboard data...');
            
            const [users, posts, comments, categories] = await Promise.all([
                this.api_call('/users').catch(e => { console.error('Users API failed:', e); return []; }),
                this.api_call('/posts?status=all&limit=100').catch(e => { console.error('Posts API failed:', e); return []; }),
                this.api_call('/posts/all/comments').catch(e => { console.error('Comments API failed:', e); return []; }),
                this.api_call('/categories').catch(e => { console.error('Categories API failed:', e); return []; })
            ]);

            console.log('Dashboard data loaded:', { 
                users: users?.length, 
                posts: posts?.length, 
                comments: comments?.length, 
                categories: categories?.length 
            });

            document.getElementById('totalUsers').textContent = users?.length || 0;
            document.getElementById('totalPosts').textContent = posts?.length || 0;
            document.getElementById('totalComments').textContent = comments?.length || 0;
            document.getElementById('totalCategories').textContent = categories?.length || 0;

        } catch(error) 
        {
            console.error('Failed to load dashboard data:', error);
            this.showNotification('Помилка завантаження статистики', 'error');
        } finally 
        {
            this.hideLoading();
        }
    }

    async load_section_data(section) 
    {
        switch(section) 
        {
            case 'users': await this.load_users(); break;
            case 'posts': await this.load_posts(); break;
            case 'comments': await this.load_comments(); break;
            case 'categories': await this.load_categories(); break;
        }
    }

    async load_users() 
    {
        this.showLoading();
        
        try 
        {
            console.log('Loading users...');
            const users = await this.api_call('/users');
            console.log('Users loaded:', users?.length, users);
            this.renderUsersTable(users || []);
        } catch(error) 
        {
            console.error('Failed to load users:', error);
            this.showNotification('Помилка завантаження користувачів', 'error');
        } finally 
        {
            this.hideLoading();
        }
    }

    translateRole(role) {
        const roleTranslations = {
            'guest': 'Гість',
            'user': 'Користувач', 
            'admin': 'Адміністратор'
        };
        return roleTranslations[role] || role;
    }

    renderUsersTable(users) 
    {
        const tbody = document.getElementById('usersTableBody');
        if(!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.login}</td>
                <td>${user.full_name || 'N/A'}</td>
                <td>${user.email}</td>
                <td><span class="status-badge ${user.role}">${this.translateRole(user.role)}</span></td>
                <td><span class="status-badge ${user.email_verified ? 'verified' : 'inactive'}">
                    ${user.email_verified ? 'Підтверджено' : 'Не підтверджено'}
                </span></td>
                <td>${new Date(user.created_at).toLocaleDateString('uk-UA')}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="dashboard.editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="dashboard.deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async load_posts() 
    {
        this.showLoading();
        
        try 
        {
            // Для адміна завантажуємо всі пости (активні та неактивні)
            const posts = await this.api_call('/posts?status=all&limit=100');
            this.renderPostsTable(posts || []);
        } catch(error) 
        {
            console.error('Failed to load posts:', error);
        } finally 
        {
            this.hideLoading();
        }
    }

    renderPostsTable(posts) 
    {
        const tbody = document.getElementById('postsTableBody');
        if(!tbody) return;

        tbody.innerHTML = posts.map(post => `
            <tr>
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.author_id}</td>
                <td><span class="status-badge ${post.status}">${post.status}</span></td>
                <td>${new Date(post.publish_date).toLocaleDateString('uk-UA')}</td>
                <td>${post.likes_count || 0}</td>
                <td>${post.comments_count || 0}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="dashboard.editPost(${post.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="dashboard.deletePost(${post.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async load_comments() 
    {
        this.showLoading();
        
        try 
        {
            const comments = await this.api_call('/posts/all/comments');
            this.renderCommentsTable(comments || []);
        } catch(error) 
        {
            console.error('Failed to load comments:', error);
        } finally 
        {
            this.hideLoading();
        }
    }

    renderCommentsTable(comments) 
    {
        const tbody = document.getElementById('commentsTableBody');
        if(!tbody) return;

        tbody.innerHTML = comments.map(comment => `
            <tr>
                <td>${comment.id}</td>
                <td>${comment.content.substring(0, 50)}...</td>
                <td>${comment.author_id}</td>
                <td>${comment.post_id}</td>
                <td><span class="status-badge ${comment.status}">${comment.status}</span></td>
                <td>${new Date(comment.publish_date).toLocaleDateString('uk-UA')}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="dashboard.editComment(${comment.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="dashboard.deleteComment(${comment.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async load_categories() 
    {
        this.showLoading();
        
        try 
        {
            const categories = await this.api_call('/categories');
            this.renderCategoriesTable(categories || []);
        } catch(error) 
        {
            console.error('Failed to load categories:', error);
        } finally 
        {
            this.hideLoading();
        }
    }

    renderCategoriesTable(categories) 
    {
        const tbody = document.getElementById('categoriesTableBody');
        if(!tbody) return;

        tbody.innerHTML = categories.map(category => `
            <tr>
                <td>${category.id}</td>
                <td>${category.title}</td>
                <td>${category.description}</td>
                <td>${new Date(category.created_at).toLocaleDateString('uk-UA')}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="dashboard.editCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="dashboard.deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    searchUsers(query) 
    {
        const rows = document.querySelectorAll('#usersTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    searchPosts(query) 
    {
        const rows = document.querySelectorAll('#postsTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    searchComments(query) 
    {
        const rows = document.querySelectorAll('#commentsTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    filterUsers(type, value) 
    {
        const rows = document.querySelectorAll('#usersTableBody tr');
        rows.forEach(row => {
            if(!value) 
                {
                row.style.display = '';
                return;
            }
            
            const role_cell = row.cells[4];
            const role_text = role_cell.textContent.toLowerCase();
            row.style.display = role_text.includes(value.toLowerCase()) ? '' : 'none';
        });
    }

    filterPosts(type, value) 
    {
        const rows = document.querySelectorAll('#postsTableBody tr');
        rows.forEach(row => {
            if(!value) 
                {
                row.style.display = '';
                return;
            }
            
            const status_cell = row.cells[3];
            const status_text = status_cell.textContent.toLowerCase();
            row.style.display = status_text.includes(value.toLowerCase()) ? '' : 'none';
        });
    }

    filterComments(type, value) 
    {
        const rows = document.querySelectorAll('#commentsTableBody tr');
        rows.forEach(row => {
            if(!value) 
                {
                row.style.display = '';
                return;
            }
            
            const status_cell = row.cells[4];
            const status_text = status_cell.textContent.toLowerCase();
            row.style.display = status_text.includes(value.toLowerCase()) ? '' : 'none';
        });
    }

    showAddUserModal() 
    {
        const modal_content = `
            <h2>Додати нового користувача</h2>
            <form id="addUserForm">
                <div style="margin-bottom: 15px;">
                    <label>Логін:</label>
                    <input type="text" name="login" required class="setting-input">
                </div>
                <div style="margin-bottom: 15px;">
                    <label>Повне ім'я:</label>
                    <input type="text" name="full_name" required class="setting-input">
                </div>
                <div style="margin-bottom: 15px;">
                    <label>Email:</label>
                    <input type="email" name="email" required class="setting-input">
                </div>
                <div style="margin-bottom: 15px;">
                    <label>Пароль:</label>
                    <input type="password" name="password" required class="setting-input">
                </div>
                <div style="margin-bottom: 20px;">
                    <label>Роль:</label>
                    <select name="role" class="setting-input">
                        <option value="guest">Гість</option>
                        <option value="user">Користувач</option>
                        <option value="admin">Адміністратор</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Створити користувача</button>
            </form>
        `;
        
        this.showModal(modal_content);
        
        document.getElementById('addUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.create_user(new FormData(e.target));
        });
    }

    async showAddPostModal() 
    {
        // Завантажуємо користувачів та категорії
        const [users, categories] = await Promise.all([
            this.api_call('/users'),
            this.api_call('/categories')
        ]);
        
        const userOptions = users?.map(user => 
            `<option value="${user.id}">${user.login} (${user.full_name})</option>`
        ).join('') || '';
        
        const categoryOptions = categories?.map(category => 
            `<option value="${category.id}">${category.title}</option>`
        ).join('') || '';
        
        const modal_content = `
            <h2>Додати новий пост</h2>
            <form id="addPostForm">
                <div style="margin-bottom: 15px;">
                    <label>Автор:</label>
                    <select name="author_id" required class="setting-input">
                        <option value="">Оберіть автора</option>
                        ${userOptions}
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label>Заголовок:</label>
                    <input type="text" name="title" required class="setting-input" minlength="5">
                </div>
                <div style="margin-bottom: 15px;">
                    <label>Контент:</label>
                    <textarea name="content" required class="setting-input" rows="5" minlength="10"></textarea>
                </div>
                <div style="margin-bottom: 15px;">
                    <label>Категорії:</label>
                    <select name="categories" multiple required class="setting-input" style="height: 100px;">
                        ${categoryOptions}
                    </select>
                    <small style="color: #666;">Утримуйте Ctrl для вибору кількох категорій</small>
                </div>
                <div style="margin-bottom: 20px;">
                    <label>Статус:</label>
                    <select name="status" class="setting-input">
                        <option value="active">Активний</option>
                        <option value="inactive">Неактивний</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Створити пост</button>
            </form>
        `;
        
        this.showModal(modal_content);
        
        document.getElementById('addPostForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.create_post(new FormData(e.target));
        });
    }

    showAddCategoryModal() 
    {
        const modal_content = `
            <h2>Додати нову категорію</h2>
            <form id="addCategoryForm">
                <div style="margin-bottom: 15px;">
                    <label>Назва:</label>
                    <input type="text" name="title" required class="setting-input">
                </div>
                <div style="margin-bottom: 20px;">
                    <label>Опис:</label>
                    <textarea name="description" class="setting-input" rows="3"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Створити категорію</button>
            </form>
        `;
        
        this.showModal(modal_content);
        
        document.getElementById('addCategoryForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.create_category(new FormData(e.target));
        });
    }

    async create_user(formData) 
    {
        const user_data = Object.fromEntries(formData);
        const result = await this.api_call('/auth/register', 'POST', user_data);
        
        if(result) 
            {
            this.showNotification('Користувач успішно створений', 'success');
            this.closeModal();
            this.load_users();
        }
    }

    async updateUser(id, formData) 
    {
        try {
            const user_data = Object.fromEntries(formData);
            
            // Видаляємо пустий пароль
            if (!user_data.password) {
                delete user_data.password;
            }
            
            // Перетворюємо checkbox в boolean
            user_data.email_verified = user_data.email_verified === 'on';
            
            const result = await this.api_call(`/users/${id}`, 'PATCH', user_data);
            
            if(result) {
                this.showNotification('Користувач успішно оновлений', 'success');
                this.closeModal();
                this.load_users();
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            this.showNotification('Помилка оновлення користувача', 'error');
        }
    }

    async create_post(formData) 
    {
        const post_data = Object.fromEntries(formData);
        
        // Обробляємо множинні категорії
        const categoriesSelect = document.querySelector('select[name="categories"]');
        if (categoriesSelect) {
            const selectedCategories = Array.from(categoriesSelect.selectedOptions)
                .map(option => parseInt(option.value))
                .filter(value => !isNaN(value) && value > 0);
            
            // Якщо категорії не вибрані, встановлюємо порожній масив
            post_data.categories = selectedCategories.length > 0 ? selectedCategories : [];
        } else {
            post_data.categories = [];
        }
        
        console.log('Creating post with data:', post_data); // Для відладки
        
        const result = await this.api_call('/posts', 'POST', post_data);
        
        if(result) 
            {
            this.showNotification('Пост успішно створений', 'success');
            this.closeModal();
            this.load_posts();
        }
    }

    async updatePost(id, formData) 
    {
        try {
            const post_data = Object.fromEntries(formData);
            delete post_data.id; // Видаляємо ID з даних
            
            console.log('Updating post with data:', post_data); // Для відладки
            
            const result = await this.api_call(`/posts/${id}`, 'PATCH', post_data);
            
            if(result) {
                this.showNotification('Пост успішно оновлений', 'success');
                this.closeModal();
                this.load_posts();
            }
        } catch (error) {
            console.error('Failed to update post:', error);
            this.showNotification('Помилка оновлення поста', 'error');
        }
    }

    async create_category(formData) 
    {
        const category_data = Object.fromEntries(formData);
        const result = await this.api_call('/categories', 'POST', category_data);
        
        if(result) 
        {
            this.showNotification('Категорія успішно створена', 'success');
            this.closeModal();
            this.load_categories();
        }
    }

    async updateComment(id, formData) 
    {
        try {
            const comment_data = Object.fromEntries(formData);
            delete comment_data.id; // Видаляємо ID з даних
            
            const result = await this.api_call(`/comments/${id}`, 'PUT', comment_data);
            
            if(result) {
                this.showNotification('Коментар успішно оновлений', 'success');
                this.closeModal();
                this.load_comments();
            }
        } catch (error) {
            console.error('Failed to update comment:', error);
            this.showNotification('Помилка оновлення коментаря', 'error');
        }
    }

    async updateCategory(id, formData) 
    {
        try {
            const category_data = Object.fromEntries(formData);
            delete category_data.id; // Видаляємо ID з даних
            
            const result = await this.api_call(`/categories/${id}`, 'PATCH', category_data);
            
            if(result) {
                this.showNotification('Категорія успішно оновлена', 'success');
                this.closeModal();
                this.load_categories();
            }
        } catch (error) {
            console.error('Failed to update category:', error);
            this.showNotification('Помилка оновлення категорії', 'error');
        }
    }

    async editUser(id) 
    {
        try {
            console.log('Loading user data for editing:', id);
            
            // Завантажуємо дані користувача (API повертає повну інформацію для адмінів)
            const response = await this.api_call(`/users/${id}`);
            console.log('User data loaded:', response);
            
            const user = response; // Дані вже розпаковані в api_call
            if (!user) {
                this.showNotification('Не вдалося завантажити дані користувача', 'error');
                return;
            }

            const modalContent = `
                <h2>Редагувати користувача</h2>
                <form id="editUserForm">
                    <input type="hidden" name="id" value="${user.id}">
                    <div style="margin-bottom: 15px;">
                        <label>Логін:</label>
                        <input type="text" name="login" value="${user.login}" required class="setting-input">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label>Повне ім'я:</label>
                        <input type="text" name="full_name" value="${user.full_name || ''}" required class="setting-input">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label>Email:</label>
                        <input type="email" name="email" value="${user.email}" required class="setting-input">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label>Новий пароль (залиште порожнім, щоб не змінювати):</label>
                        <input type="password" name="password" class="setting-input">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label>Роль:</label>
                        <select name="role" class="setting-input">
                            <option value="guest" ${user.role === 'guest' ? 'selected' : ''}>Гість</option>
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>Користувач</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Адміністратор</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label>
                            <input type="checkbox" name="email_verified" ${user.email_verified ? 'checked' : ''}> Email підтверджено
                        </label>
                    </div>
                    <button type="submit" class="btn btn-primary">Зберегти зміни</button>
                    <button type="button" class="btn btn-secondary" onclick="dashboard.closeModal()">Скасувати</button>
                </form>
            `;

            this.showModal(modalContent);

            document.getElementById('editUserForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateUser(id, new FormData(e.target));
            });

        } catch (error) {
            console.error('Failed to load user for editing:', error);
            this.showNotification('Помилка завантаження даних користувача', 'error');
        }
    }

    async deleteUser(id) 
    {
        if(confirm('Ви впевнені, що хочете видалити цього користувача?')) 
            {
            const result = await this.api_call(`/users/${id}`, 'DELETE');
            
            if(result) 
                {
                this.showNotification('Користувач видалений', 'success');
                this.load_users();
            }
        }
    }

    async editPost(id) 
    {
        try {
            // Завантажуємо дані поста
            const post = await this.api_call(`/posts/${id}`);
            if (!post) return;

            const modalContent = `
                <h2>Редагувати пост</h2>
                <form id="editPostForm">
                    <input type="hidden" name="id" value="${post.id}">
                    <div style="margin-bottom: 15px;">
                        <label>Заголовок:</label>
                        <input type="text" name="title" value="${post.title}" required class="setting-input">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label>Контент:</label>
                        <textarea name="content" required class="setting-input" rows="8">${post.content}</textarea>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label>Статус:</label>
                        <select name="status" class="setting-input">
                            <option value="active" ${post.status === 'active' ? 'selected' : ''}>Активний</option>
                            <option value="inactive" ${post.status === 'inactive' ? 'selected' : ''}>Неактивний</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Зберегти зміни</button>
                    <button type="button" class="btn btn-secondary" onclick="dashboard.closeModal()">Скасувати</button>
                </form>
            `;

            this.showModal(modalContent);

            document.getElementById('editPostForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updatePost(id, new FormData(e.target));
            });

        } catch (error) {
            console.error('Failed to load post for editing:', error);
            this.showNotification('Помилка завантаження даних поста', 'error');
        }
    }

    async deletePost(id) 
    {
        if(confirm('Ви впевнені, що хочете видалити цей пост?')) 
            {
            const result = await this.api_call(`/posts/${id}`, 'DELETE');
            
            if(result) 
                {
                this.showNotification('Пост видалений', 'success');
                this.load_posts();
            }
        }
    }

    async editComment(id) 
    {
        try {
            // Завантажуємо дані коментаря
            const comment = await this.api_call(`/comments/${id}`);
            if (!comment) return;

            const modalContent = `
                <h2>Редагувати коментар</h2>
                <form id="editCommentForm">
                    <input type="hidden" name="id" value="${comment.id}">
                    <div style="margin-bottom: 15px;">
                        <label>Контент:</label>
                        <textarea name="content" required class="setting-input" rows="6">${comment.content}</textarea>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label>Статус:</label>
                        <select name="status" class="setting-input">
                            <option value="active" ${comment.status === 'active' ? 'selected' : ''}>Активний</option>
                            <option value="inactive" ${comment.status === 'inactive' ? 'selected' : ''}>Неактивний</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Зберегти зміни</button>
                    <button type="button" class="btn btn-secondary" onclick="dashboard.closeModal()">Скасувати</button>
                </form>
            `;

            this.showModal(modalContent);

            document.getElementById('editCommentForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateComment(id, new FormData(e.target));
            });

        } catch (error) {
            console.error('Failed to load comment for editing:', error);
            this.showNotification('Помилка завантаження даних коментаря', 'error');
        }
    }

    async deleteComment(id) 
    {
        if(confirm('Ви впевнені, що хочете видалити цей коментар?')) 
            {
            const result = await this.api_call(`/comments/${id}`, 'DELETE');
            
            if(result) 
                {
                this.showNotification('Коментар видалений', 'success');
                this.load_comments();
            }
        }
    }

    async editCategory(id) 
    {
        try {
            // Завантажуємо дані категорії
            const category = await this.api_call(`/categories/${id}`);
            if (!category) return;

            const modalContent = `
                <h2>Редагувати категорію</h2>
                <form id="editCategoryForm">
                    <input type="hidden" name="id" value="${category.id}">
                    <div style="margin-bottom: 15px;">
                        <label>Назва:</label>
                        <input type="text" name="title" value="${category.title}" required class="setting-input">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label>Опис:</label>
                        <textarea name="description" class="setting-input" rows="4">${category.description || ''}</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Зберегти зміни</button>
                    <button type="button" class="btn btn-secondary" onclick="dashboard.closeModal()">Скасувати</button>
                </form>
            `;

            this.showModal(modalContent);

            document.getElementById('editCategoryForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateCategory(id, new FormData(e.target));
            });

        } catch (error) {
            console.error('Failed to load category for editing:', error);
            this.showNotification('Помилка завантаження даних категорії', 'error');
        }
    }

    async deleteCategory(id) 
    {
        if(confirm('Ви впевнені, що хочете видалити цю категорію?')) 
            {
            const result = await this.api_call(`/categories/${id}`, 'DELETE');
            
            if(result) 
                {
                this.showNotification('Категорія видалена', 'success');
                this.load_categories();
            }
        }
    }

    showNotification(message, type = 'info') 
    {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 6px;
            color: white;
            z-index: 4000;
            font-weight: 500;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        notification.style.backgroundColor = colors[type];
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new AdminDashboard();
});
