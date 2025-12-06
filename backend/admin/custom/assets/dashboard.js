class admin_dashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.apiBase = '/api';
        this.init();
    }

    init() {
        this.bind_events();
        this.load_dashboard_data();
        this.check_mobile_view();
    }

    bind_events() {
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('a').dataset.section;
                this.show_section(section);
            });
        });

        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggle_sidebar();
        });

        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
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
            this.check_mobile_view();
        });
    }

    show_section(sectionName) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        document.getElementById(sectionName).classList.add('active');

        document.querySelectorAll('.sidebar-menu li').forEach(li => {
            li.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).parentElement.classList.add('active');

        const titles = {
            dashboard: 'Dashboard',
            users: 'Users',
            posts: 'Posts',
            comments: 'Comments',
            categories: 'Categories',
            settings: 'Settings'
        };
        document.getElementById('pageTitle').textContent = titles[sectionName];

        this.currentSection = sectionName;

        this.load_section_data(sectionName);
    }

    toggle_sidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
    }

    check_mobile_view() {
        const is_mobile = window.innerWidth <= 768;
        const sidebar = document.querySelector('.sidebar');

        if (is_mobile) sidebar.classList.remove('active');
    }

    showLoading() {
        document.getElementById('loadingSpinner').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loadingSpinner').style.display = 'none';
    }

    showModal(content) {
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    async api_call(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers:
                {
                    'Content-Type': 'application/json',
                }
            };

            if (!options.headers['Content-Type']) delete options.headers['Content-Type'];

            options.credentials = 'include';

            if (data) options.body = JSON.stringify(data);

            const response = await fetch(`${this.apiBase}${endpoint}`, options);

            if (response.status === 401 || response.status === 403) {
                this.handleAuthError(response.status);
                return null;
            }

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();

            if (result && result.status === 'success' && result.data) return result.data;

            return result;
        } catch (error) {
            console.error('API call failed:', error);
            this.showNotification('Error loading data', 'error');
            return null;
        }
    }

    handleAuthError(status) {
        const message = status === 401
            ? 'Session expired. Please log in again.'
            : 'Insufficient permissions.';

        this.showNotification(message, 'error');

        setTimeout(() => {
            window.location.href = '/admin-panel/login';
        }, 1500);
    }

    async load_dashboard_data() {
        this.showLoading();

        try {
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

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showNotification('Error loading statistics', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async load_section_data(section) {
        switch (section) {
            case 'users': await this.load_users(); break;
            case 'posts': await this.load_posts(); break;
            case 'comments': await this.load_comments(); break;
            case 'categories': await this.load_categories(); break;
        }
    }

    async load_users() {
        this.showLoading();

        try {
            console.log('Loading users...');
            const users = await this.api_call('/users');
            console.log('Users loaded:', users?.length, users);
            this.renderUsersTable(users || []);
        } catch (error) {
            console.error('Failed to load users:', error);
            this.showNotification('Error loading users', 'error');
        } finally {
            this.hideLoading();
        }
    }

    translateRole(role) {
        const role_translations = {
            'guest': 'Guest',
            'user': 'User',
            'admin': 'Administrator'
        };
        return role_translations[role] || role;
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.login}</td>
                <td>${user.full_name || 'N/A'}</td>
                <td>${user.email}</td>
                <td><span class = "status-badge ${user.role}">${this.translateRole(user.role)}</span></td>
                <td><span class = "status-badge ${user.email_verified ? 'verified' : 'inactive'}">
                    ${user.email_verified ? 'Confirmed' : 'Not Confirmed'}
                </span></td>
                <td>${new Date(user.created_at).toLocaleDateString('en-US')}</td>
                <td>
                    <button class = "btn btn-small btn-primary" onclick = "editUser(${user.id})">
                        <i class = "fas fa-edit"></i>
                    </button>
                    <button class = "btn btn-small btn-danger" onclick = "deleteUser(${user.id})">
                        <i class = "fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async load_posts() {
        this.showLoading();

        try {
            const posts = await this.api_call('/posts?status=all&limit=100');

            this.renderPostsTable(posts || []);
        } catch (error) {
            console.error('Failed to load posts:', error);
        } finally {
            this.hideLoading();
        }
    }

    renderPostsTable(posts) {
        const tbody = document.getElementById('postsTableBody');
        if (!tbody) return;

        tbody.innerHTML = posts.map(post => `
            <tr>
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.author_id}</td>
                <td><span class="status-badge ${post.status}">${post.status}</span></td>
                <td>${new Date(post.publish_date).toLocaleDateString('en-US')}</td>
                <td>${post.likes_count || 0}</td>
                <td>${post.comments_count || 0}</td>
                <td>
                    <button class = "btn btn-small btn-primary" onclick = "editPost(${post.id})">
                        <i class = "fas fa-edit"></i>
                    </button>
                    <button class = "btn btn-small btn-danger" onclick = "deletePost(${post.id})">
                        <i class = "fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async load_comments() {
        this.showLoading();

        try {
            const comments = await this.api_call('/posts/all/comments');

            this.renderCommentsTable(comments || []);
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            this.hideLoading();
        }
    }

    renderCommentsTable(comments) {
        const tbody = document.getElementById('commentsTableBody');
        if (!tbody) return;

        tbody.innerHTML = comments.map(comment => `
            <tr>
                <td>${comment.id}</td>
                <td>${comment.content.substring(0, 50)}...</td>
                <td>${comment.author_id}</td>
                <td>${comment.post_id}</td>
                <td><span class="status-badge ${comment.status}">${comment.status}</span></td>
                <td>${new Date(comment.publish_date).toLocaleDateString('en-US')}</td>
                <td>
                    <button class = "btn btn-small btn-primary" onclick = "editComment(${comment.id})">
                        <i class = "fas fa-edit"></i>
                    </button>
                    <button class = "btn btn-small btn-danger" onclick = "deleteComment(${comment.id})">
                        <i class = "fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async load_categories() {
        this.showLoading();

        try {
            const categories = await this.api_call('/categories');

            this.renderCategoriesTable(categories || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            this.hideLoading();
        }
    }

    renderCategoriesTable(categories) {
        const tbody = document.getElementById('categoriesTableBody');
        if (!tbody) return;

        tbody.innerHTML = categories.map(category => `
            <tr>
                <td>${category.id}</td>
                <td>${category.title}</td>
                <td>${category.description}</td>
                <td>${new Date(category.created_at).toLocaleDateString('en-US')}</td>
                <td>
                    <button class = "btn btn-small btn-primary" onclick = "editCategory(${category.id})">
                        <i class = "fas fa-edit"></i>
                    </button>
                    <button class = "btn btn-small btn-danger" onclick = "deleteCategory(${category.id})">
                        <i class = "fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    searchUsers(query) {
        const rows = document.querySelectorAll('#usersTableBody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    searchPosts(query) {
        const rows = document.querySelectorAll('#postsTableBody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    searchComments(query) {
        const rows = document.querySelectorAll('#commentsTableBody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    filterUsers(type, value) {
        const rows = document.querySelectorAll('#usersTableBody tr');

        rows.forEach(row => {
            if (!value) {
                row.style.display = '';
                return;
            }

            const role_cell = row.cells[4];
            const role_text = role_cell.textContent.toLowerCase();
            row.style.display = role_text.includes(value.toLowerCase()) ? '' : 'none';
        });
    }

    filterPosts(type, value) {
        const rows = document.querySelectorAll('#postsTableBody tr');

        rows.forEach(row => {
            if (!value) {
                row.style.display = '';
                return;
            }

            const status_cell = row.cells[3];
            const status_text = status_cell.textContent.toLowerCase();
            row.style.display = status_text.includes(value.toLowerCase()) ? '' : 'none';
        });
    }

    filterComments(type, value) {
        const rows = document.querySelectorAll('#commentsTableBody tr');

        rows.forEach(row => {
            if (!value) {
                row.style.display = '';
                return;
            }

            const status_cell = row.cells[4];
            const status_text = status_cell.textContent.toLowerCase();
            row.style.display = status_text.includes(value.toLowerCase()) ? '' : 'none';
        });
    }

    showAddUserModal() {
        const modal_content = `
            <h2>Add new user</h2>
            <form id = "addUserForm">
                <div style = "margin-bottom: 15px;">
                    <label>Login:</label>
                    <input type = "text" name = "login" required class = "setting-input">
                </div>
                <div style = "margin-bottom: 15px;">
                    <label>Full Name:</label>
                    <input type = "text" name = "full_name" required class = "setting-input">
                </div>
                <div style = "margin-bottom: 15px;">
                    <label>Email:</label>
                    <input type = "email" name = "email" required class = "setting-input">
                </div>
                <div style = "margin-bottom: 15px;">
                    <label>Password:</label>
                    <input type = "password" name = "password" required class = "setting-input">
                </div>
                <div style = "margin-bottom: 20px;">
                    <label>Role:</label>
                    <select name = "role" class = "setting-input">
                        <option value = "guest">Guest</option>
                        <option value = "user">User</option>
                        <option value = "admin">Administrator</option>
                    </select>
                </div>
                <button type = "submit" class = "btn btn-primary">Create User</button>
            </form>
        `;

        this.showModal(modal_content);

        document.getElementById('addUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.create_user(new FormData(e.target));
        });
    }

    async showAddPostModal() {
        const [users, categories] = await Promise.all([
            this.api_call('/users'),
            this.api_call('/categories')
        ]);

        const user_options = users?.map(user =>
            `<option value="${user.id}">${user.login} (${user.full_name})</option>`
        ).join('') || '';

        const category_options = categories?.map(category =>
            `<option value="${category.id}">${category.title}</option>`
        ).join('') || '';

        const modal_content = `
            <h2>Add new post</h2>
            <form id = "addPostForm">
                <div style = "margin-bottom: 15px;">
                    <label>Author:</label>
                    <select name = "author_id" required class = "setting-input">
                        <option value = "">Select author</option>
                        ${user_options}
                    </select>
                </div>
                <div style = "margin-bottom: 15px;">
                    <label>Title:</label>
                    <input type = "text" name = "title" required class = "setting-input" minlength = "5">
                </div>
                <div style = "margin-bottom: 15px;">
                    <label>Content:</label>
                    <textarea name = "content" required class = "setting-input" rows = "5" minlength = "10"></textarea>
                </div>
                <div style = "margin-bottom: 15px;">
                    <label>Categories:</label>
                    <select name = "categories" multiple required class = "setting-input" style = "height: 100px;">
                        ${category_options}
                    </select>
                    <small style = "color: #666;">Hold Ctrl to select multiple categories</small>
                </div>
                <div style = "margin-bottom: 20px;">
                    <label>Status:</label>
                    <select name = "status" class = "setting-input">
                        <option value = "active">Active</option>
                        <option value = "inactive">Inactive</option>
                    </select>
                </div>
                <button type = "submit" class = "btn btn-primary">Create post</button>
            </form>
        `;

        this.showModal(modal_content);

        document.getElementById('addPostForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.create_post(new FormData(e.target));
        });
    }

    showAddCategoryModal() {
        const modal_content = `
            <h2>Add new category</h2>
            <form id = "addCategoryForm">
                <div style = "margin-bottom: 15px;">
                    <label>Name:</label>
                    <input type = "text" name = "title" required class = "setting-input">
                </div>
                <div style = "margin-bottom: 20px;">
                    <label>Description:</label>
                    <textarea name = "description" class = "setting-input" rows = "3"></textarea>
                </div>
                <button type = "submit" class = "btn btn-primary">Create category</button>
            </form>
        `;

        this.showModal(modal_content);

        document.getElementById('addCategoryForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.create_category(new FormData(e.target));
        });
    }

    async create_user(formData) {
        const user_data = Object.fromEntries(formData);
        const result = await this.api_call('/auth/register', 'POST', user_data);

        if (result) {
            this.showNotification('User successfully created', 'success');
            this.closeModal();
            this.load_users();
        }
    }

    async updateUser(id, formData) {
        try {
            const user_data = Object.fromEntries(formData);

            if (!user_data.password) delete user_data.password;

            user_data.email_verified = user_data.email_verified === 'on';

            const result = await this.api_call(`/users/${id}`, 'PATCH', user_data);

            if (result) {
                this.showNotification('User successfully updated', 'success');
                this.closeModal();
                this.load_users();
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            this.showNotification('Error updating user', 'error');
        }
    }

    async create_post(formData) {
        const post_data = Object.fromEntries(formData);

        const categories_select = document.querySelector('select[name="categories"]');
        if (categories_select) {
            const selected_categories = Array.from(categories_select.selectedOptions)
                .map(option => parseInt(option.value))
                .filter(value => !isNaN(value) && value > 0);

            post_data.categories = selected_categories.length > 0 ? selected_categories : [];
        } else {
            post_data.categories = [];
        }

        console.log('Creating post with data:', post_data);

        const result = await this.api_call('/posts', 'POST', post_data);

        if (result) {
            this.showNotification('Post successfully created', 'success');
            this.closeModal();
            this.load_posts();
        }
    }

    async update_post(id, formData) {
        try {
            const post_data = Object.fromEntries(formData);
            delete post_data.id;

            console.log('Updating post with data:', post_data);

            const result = await this.api_call(`/posts/${id}`, 'PATCH', post_data);

            if (result) {
                this.showNotification('Post successfully updated', 'success');
                this.closeModal();
                this.load_posts();
            }
        } catch (error) {
            console.error('Failed to update post:', error);
            this.showNotification('Error updating post', 'error');
        }
    }

    async create_category(formData) {
        const category_data = Object.fromEntries(formData);
        const result = await this.api_call('/categories', 'POST', category_data);

        if (result) {
            this.showNotification('Category successfully created', 'success');
            this.closeModal();
            this.load_categories();
        }
    }

    async update_comment(id, formData) {
        try {
            const comment_data = Object.fromEntries(formData);
            delete comment_data.id;

            const result = await this.api_call(`/comments/${id}`, 'PUT', comment_data);

            if (result) {
                this.showNotification('Comment successfully updated', 'success');
                this.closeModal();
                this.load_comments();
            }
        } catch (error) {
            console.error('Failed to update comment:', error);
            this.showNotification('Error updating comment', 'error');
        }
    }

    async update_category(id, formData) {
        try {
            const category_data = Object.fromEntries(formData);
            delete category_data.id;

            const result = await this.api_call(`/categories/${id}`, 'PATCH', category_data);

            if (result) {
                this.showNotification('Category successfully updated', 'success');
                this.closeModal();
                this.load_categories();
            }
        } catch (error) {
            console.error('Failed to update category:', error);
            this.showNotification('Error updating category', 'error');
        }
    }

    async edit_user(id) {
        try {
            console.log('Loading user data for editing:', id);

            const response = await this.api_call(`/users/${id}`);
            console.log('User data loaded:', response);

            const user = response;
            if (!user) {
                this.showNotification('Failed to load user data', 'error');
                return;
            }

            const modal_content = `
                <h2>Edit User</h2>
                <form id = "editUserForm">
                    <input type = "hidden" name = "id" value = "${user.id}">
                    <div style = "margin-bottom: 15px;">
                        <label>Login:</label>
                        <input type = "text" name = "login" value = "${user.login}" required class = "setting-input">
                    </div>
                    <div style = "margin-bottom: 15px;">
                        <label>Full Name:</label>
                        <input type = "text" name = "full_name" value = "${user.full_name || ''}" required class = "setting-input">
                    </div>
                    <div style = "margin-bottom: 15px;">
                        <label>Email:</label>
                        <input type = "email" name = "email" value = "${user.email}" required class = "setting-input">
                    </div>
                    <div style = "margin-bottom: 15px;">
                        <label>New Password (leave blank to keep unchanged):</label>
                        <input type = "password" name = "password" class = "setting-input">
                    </div>
                    <div style = "margin-bottom: 15px;">
                        <label>Role:</label>
                        <select name = "role" class = "setting-input">
                            <option value = "guest" ${user.role === 'guest' ? 'selected' : ''}>Guest</option>
                            <option value = "user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                            <option value = "admin" ${user.role === 'admin' ? 'selected' : ''}>Administrator</option>
                        </select>
                    </div>
                    <div style = "margin-bottom: 20px;">
                        <label>
                            <input type = "checkbox" name = "email_verified" ${user.email_verified ? 'checked' : ''}> Email verified
                        </label>
                    </div>
                    <button type = "submit" class = "btn btn-primary">Save Changes</button>
                    <button type = "button" class = "btn btn-secondary" onclick = "dashboard.closeModal()">Cancel</button>
                </form>
            `;

            this.showModal(modal_content);

            document.getElementById('editUserForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateUser(id, new FormData(e.target));
            });

        } catch (error) {
            console.error('Failed to load user for editing:', error);
            this.showNotification('Error loading user data', 'error');
        }
    }

    async delete_user(id) {
        if (confirm('Are you sure you want to delete this user?')) {
            const result = await this.api_call(`/users/${id}`, 'DELETE');

            if (result) {
                this.showNotification('User deleted', 'success');
                this.load_users();
            }
        }
    }

    async edit_post(id) {
        try {
            const post = await this.api_call(`/posts/${id}`);
            if (!post) return;

            const modal_content = `
                <h2>Edit Post</h2>
                <form id = "editPostForm">
                    <input type = "hidden" name = "id" value = "${post.id}">
                    <div style = "margin-bottom: 15px;">
                        <label>Title:</label>
                        <input type = "text" name = "title" value = "${post.title}" required class = "setting-input">
                    </div>
                    <div style = "margin-bottom: 15px;">
                        <label>Content:</label>
                        <textarea name = "content" required class = "setting-input" rows = "8">${post.content}</textarea>
                    </div>
                    <div style = "margin-bottom: 20px;">
                        <label>Status:</label>
                        <select name = "status" class = "setting-input">
                            <option value = "active" ${post.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value = "inactive" ${post.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                    <button type = "submit" class = "btn btn-primary">Save Changes</button>
                    <button type = "button" class = "btn btn-secondary" onclick = "dashboard.closeModal()">Cancel</button>
                </form>
            `;

            this.showModal(modal_content);

            document.getElementById('editPostForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.update_post(id, new FormData(e.target));
            });

        } catch (error) {
            console.error('Failed to load post for editing:', error);
            this.showNotification('Error loading post data', 'error');
        }
    }

    async delete_post(id) {
        if (confirm('Are you sure you want to delete this post?')) {
            const result = await this.api_call(`/posts/${id}`, 'DELETE');

            if (result) {
                this.showNotification('Post deleted', 'success');
                this.load_posts();
            }
        }
    }

    async edit_comment(id) {
        try {
            const comment = await this.api_call(`/comments/${id}`);
            if (!comment) return;

            const modal_content = `
                <h2>Edit Comment</h2>
                <form id = "editCommentForm">
                    <input type = "hidden" name = "id" value = "${comment.id}">
                    <div style = "margin-bottom: 15px;">
                        <label>Content:</label>
                        <textarea name = "content" required class = "setting-input" rows = "6">${comment.content}</textarea>
                    </div>
                    <div style = "margin-bottom: 20px;">
                        <label>Status:</label>
                        <select name = "status" class = "setting-input">
                            <option value = "active" ${comment.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value = "inactive" ${comment.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                    <button type = "submit" class = "btn btn-primary">Save Changes</button>
                    <button type = "button" class = "btn btn-secondary" onclick = "dashboard.closeModal()">Cancel</button>
                </form>
            `;

            this.showModal(modal_content);

            document.getElementById('editCommentForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.update_comment(id, new FormData(e.target));
            });

        } catch (error) {
            console.error('Failed to load comment for editing:', error);
            this.showNotification('Error loading comment data', 'error');
        }
    }

    async delete_comment(id) {
        if (confirm('Are you sure you want to delete this comment?')) {
            const result = await this.api_call(`/comments/${id}`, 'DELETE');

            if (result) {
                this.showNotification('Comment deleted', 'success');
                this.load_comments();
            }
        }
    }

    async edit_category(id) {
        try {
            const category = await this.api_call(`/categories/${id}`);
            if (!category) return;

            const modal_content = `
                <h2>Edit Category</h2>
                <form id = "editCategoryForm">
                    <input type = "hidden" name = "id" value = "${category.id}">
                    <div style = "margin-bottom: 15px;">
                        <label>Name:</label>
                        <input type = "text" name = "title" value = "${category.title}" required class = "setting-input">
                    </div>
                    <div style = "margin-bottom: 20px;">
                        <label>Description:</label>
                        <textarea name = "description" class = "setting-input" rows = "4">${category.description || ''}</textarea>
                    </div>
                    <button type = "submit" class = "btn btn-primary">Save Changes</button>
                    <button type = "button" class = "btn btn-secondary" onclick = "dashboard.closeModal()">Cancel</button>
                </form>
            `;

            this.showModal(modal_content);

            document.getElementById('editCategoryForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.update_category(id, new FormData(e.target));
            });

        } catch (error) {
            console.error('Failed to load category for editing:', error);
            this.showNotification('Error loading category data', 'error');
        }
    }

    async delete_category(id) {
        if (confirm('Are you sure you want to delete this category?')) {
            const result = await this.api_call(`/categories/${id}`, 'DELETE');

            if (result) {
                this.showNotification('Category deleted', 'success');
                this.load_categories();
            }
        }
    }

    showNotification(message, type = 'info') {
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
    window.dashboard = new admin_dashboard();

    window.editUser = (id) => window.dashboard.edit_user(id);
    window.deleteUser = (id) => window.dashboard.delete_user(id);
    window.editPost = (id) => window.dashboard.edit_post(id);
    window.deletePost = (id) => window.dashboard.delete_post(id);
    window.editComment = (id) => window.dashboard.edit_comment(id);
    window.deleteComment = (id) => window.dashboard.delete_comment(id);
    window.editCategory = (id) => window.dashboard.edit_category(id);
    window.deleteCategory = (id) => window.dashboard.delete_category(id);
});
