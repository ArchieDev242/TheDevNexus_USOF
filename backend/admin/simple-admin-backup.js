import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import dbConnect from './utils/dbConnect.js';

dotenv.config();

const PORT = process.env.ADMIN_PORT || 4001;

async function startAdminServer() {
    try {
        // Перевіряємо підключення до БД
        await dbConnect.connect();
        console.log('✅ Database connection successful');

        // Створюємо Express додаток
        const app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(express.static('public'));

        // Базова HTML сторінка для адмін-панелі
        const adminHTML = `
        <!DOCTYPE html>
        <html lang="uk">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TheDevNexus USOF Admin</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
                .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
                .header { background: rgba(255,255,255,0.95); border-radius: 15px; padding: 30px; margin-bottom: 30px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .stat-card { background: rgba(255,255,255,0.95); border-radius: 15px; padding: 30px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                .stat-number { font-size: 3em; font-weight: bold; color: #667eea; margin-bottom: 10px; }
                .stat-label { font-size: 1.2em; color: #666; }
                .actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
                .action-card { background: rgba(255,255,255,0.95); border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 15px 30px; border-radius: 10px; font-size: 1.1em; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; margin: 10px 0; }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
                h1 { color: #333; margin-bottom: 10px; }
                h2 { color: #667eea; margin-bottom: 20px; }
                p { color: #666; line-height: 1.6; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚀 TheDevNexus USOF Admin Panel</h1>
                    <p>Панель управління системою</p>
                </div>
                
                <div class="stats" id="stats">
                    <div class="stat-card">
                        <div class="stat-number" id="users-count">-</div>
                        <div class="stat-label">Користувачі</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="posts-count">-</div>
                        <div class="stat-label">Пости</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="comments-count">-</div>
                        <div class="stat-label">Коментарі</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="categories-count">-</div>
                        <div class="stat-label">Категорії</div>
                    </div>
                </div>

                <div class="actions">
                    <div class="action-card">
                        <h2>👥 Управління користувачами</h2>
                        <p>Перегляд, редагування та управління користувачами системи</p>
                        <a href="/admin/users" class="btn">Переглянути користувачів</a>
                    </div>
                    <div class="action-card">
                        <h2>📝 Управління постами</h2>
                        <p>Модерація та управління контентом постів</p>
                        <a href="/admin/posts" class="btn">Переглянути пости</a>
                    </div>
                    <div class="action-card">
                        <h2>💬 Управління коментарями</h2>
                        <p>Модерація коментарів та відповідей</p>
                        <a href="/admin/comments" class="btn">Переглянути коментарі</a>
                    </div>
                    <div class="action-card">
                        <h2>📁 Управління категоріями</h2>
                        <p>Створення та редагування категорій постів</p>
                        <a href="/admin/categories" class="btn">Переглянути категорії</a>
                    </div>
                </div>
            </div>

            <script>
                // Завантажуємо статистику
                fetch('/admin/api/stats')
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('users-count').textContent = data.users || 0;
                        document.getElementById('posts-count').textContent = data.posts || 0;
                        document.getElementById('comments-count').textContent = data.comments || 0;
                        document.getElementById('categories-count').textContent = data.categories || 0;
                    })
                    .catch(error => console.error('Error loading stats:', error));
            </script>
        </body>
        </html>
        `;

        // Головна сторінка адмін-панелі
        app.get('/admin', (req, res) => {
            res.send(adminHTML);
        });

        // API для статистики
        app.get('/admin/api/stats', async (req, res) => {
            try {
                const stats = await Promise.all([
                    dbConnect.query('SELECT COUNT(*) as count FROM users'),
                    dbConnect.query('SELECT COUNT(*) as count FROM posts'),
                    dbConnect.query('SELECT COUNT(*) as count FROM comments'),
                    dbConnect.query('SELECT COUNT(*) as count FROM categories')
                ]);

                res.json({
                    users: stats[0][0].count,
                    posts: stats[1][0].count,
                    comments: stats[2][0].count,
                    categories: stats[3][0].count
                });
            } catch (error) {
                console.error('Error getting stats:', error);
                res.status(500).json({ error: 'Failed to get stats' });
            }
        });

        // API для користувачів
        app.get('/admin/users', async (req, res) => {
            try {
                const users = await dbConnect.query('SELECT id, login, full_name, email, role, rating, email_verified, created_at FROM users ORDER BY created_at DESC');
                
                const usersHTML = `
                <!DOCTYPE html>
                <html lang="uk">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Користувачі - Admin</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
                        .container { max-width: 1400px; margin: 0 auto; }
                        .header { background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
                        .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; text-decoration: none; }
                        .table-container { background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px; overflow-x: auto; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background: #f8f9fa; font-weight: 600; }
                        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; }
                        .badge-admin { background: #e74c3c; color: white; }
                        .badge-user { background: #3498db; color: white; }
                        .badge-verified { background: #27ae60; color: white; }
                        .badge-unverified { background: #f39c12; color: white; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>👥 Користувачі</h1>
                            <a href="/admin" class="btn">← Назад до панелі</a>
                        </div>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Логін</th>
                                        <th>Повне ім'я</th>
                                        <th>Email</th>
                                        <th>Роль</th>
                                        <th>Рейтинг</th>
                                        <th>Верифікація</th>
                                        <th>Дата реєстрації</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${users.map(user => `
                                        <tr>
                                            <td>${user.id}</td>
                                            <td>${user.login}</td>
                                            <td>${user.full_name}</td>
                                            <td>${user.email}</td>
                                            <td><span class="badge badge-${user.role}">${user.role === 'admin' ? 'Адмін' : 'Користувач'}</span></td>
                                            <td>${user.rating}</td>
                                            <td><span class="badge badge-${user.email_verified ? 'verified' : 'unverified'}">${user.email_verified ? 'Верифіковано' : 'Не верифіковано'}</span></td>
                                            <td>${new Date(user.created_at).toLocaleDateString('uk-UA')}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </body>
                </html>
                `;
                
                res.send(usersHTML);
            } catch (error) {
                console.error('Error getting users:', error);
                res.status(500).send('Error loading users');
            }
        });

        // Головна сторінка перенаправляє на адмін
        app.get('/', (req, res) => {
            res.redirect('/admin');
        });

        app.listen(PORT, () => {
            console.log(`🚀 Admin panel running at http://localhost:${PORT}/admin`);
            console.log(`📊 Stats API: http://localhost:${PORT}/admin/api/stats`);
            console.log(`👥 Users: http://localhost:${PORT}/admin/users`);
        });

    } catch (error) {
        console.error('❌ Failed to start admin server:', error);
        process.exit(1);
    }
}

startAdminServer();
