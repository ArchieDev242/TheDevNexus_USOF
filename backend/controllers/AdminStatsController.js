import DB_connect from '../utils/dbConnect.js';

class admin_stats_controller 
{
    static async get_basic(req, res) 
    {
        try 
        {
            const users_result = await DB_connect.make_request('SELECT COUNT(*) as count FROM users');
            const posts_result = await DB_connect.make_request('SELECT COUNT(*) as count FROM posts');
            const comments_result = await DB_connect.make_request('SELECT COUNT(*) as count FROM comments');
            const categories_result = await DB_connect.make_request('SELECT COUNT(*) as count FROM categories');

            res.json({
                status: 'success',
                data: 
                {
                    totalUsers: users_result[0][0].count,
                    totalPosts: posts_result[0][0].count,
                    totalComments: comments_result[0][0].count,
                    totalCategories: categories_result[0][0].count
                }
            });
        } catch(error) 
        {
            console.error('Error fetching stats:', error);
            res.status(500).json({ status: 'error', message: 'Failed to fetch stats' });
        }
    }

    static async get_detailed(req, res) 
    {
        try 
        {
            const users_by_role_result = await DB_connect.make_request(
                'SELECT role, COUNT(*) as count FROM users GROUP BY role'
            );

            const posts_by_status_result = await DB_connect.make_request(
                'SELECT status, COUNT(*) as count FROM posts GROUP BY status'
            );

            const top_categories_result = await DB_connect.make_request(`
                SELECT c.title, COUNT(pc.post_id) as posts_count
                FROM categories c
                LEFT JOIN post_categories pc ON c.id = pc.category_id
                GROUP BY c.id, c.title
                ORDER BY posts_count DESC
                LIMIT 10
            `);

            res.json({
                status: 'success',
                data: {
                    usersByRole: users_by_role_result[0],
                    postsByStatus: posts_by_status_result[0],
                    topCategories: top_categories_result[0]
                }
            });
        } catch(error) 
        {
            console.error('Error fetching detailed stats:', error);
            res.status(500).json({ status: 'error', message: 'Failed to fetch detailed stats' });
        }
    }
}

export default admin_stats_controller;
