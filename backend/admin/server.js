import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import adminUsersRoutes from '../routes/adminUsers.js';
import adminPostsRoutes from '../routes/adminPosts.js';
import adminCommentsRoutes from '../routes/adminComments.js';
import adminStatsRoutes from '../routes/adminStats.js';
import dbConnect from '../utils/dbConnect.js';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = config.admin.port;

async function start_admin_server() 
{
    try 
    {
        // DB connection check
        await dbConnect.connect();
        console.log('✅ Database connection successful');

        // Express app
        const app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(express.static(path.join(__dirname, '../public')));

        app.use('/admin/api/users', adminUsersRoutes);
        app.use('/admin/api/posts', adminPostsRoutes);
        app.use('/admin/api/comments', adminCommentsRoutes);
        app.use('/admin/api/stats', adminStatsRoutes);

        app.get('/admin/api/categories', async (req, res) => {
            try 
            {
                const result = await dbConnect.make_request('SELECT * FROM categories ORDER BY title');
                res.json(result[0]);
            } catch(error) 
            {
                console.error('Error fetching categories:', error);
                res.status(500).json({ error: 'Failed to fetch categories' });
            }
        });

        app.get('/admin', (req, res) => {
            res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
        });

        // main page route
        app.get('/', (req, res) => {
            res.redirect('/admin');
        });

        app.listen(PORT, () => {
            console.log(`Admin panel running at http://localhost:${PORT}/admin`);
            console.log(`API endpoints available at /admin/api/*`);
        });

    } catch(error) 
    {
        console.error('❌ Failed to start admin server:', error);
        process.exit(1);
    }
}

start_admin_server();
