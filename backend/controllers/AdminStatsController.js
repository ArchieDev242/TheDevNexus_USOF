import dbConnect from '../utils/dbConnect.js';

class AdminStatsController 
{
    static async get_basic(req, res) 
    {
        try 
        {
            const users_result = await dbConnect.make_request('SELECT COUNT(*) as count FROM users');
            const posts_result = await dbConnect.make_request('SELECT COUNT(*) as count FROM posts');
            const comments_result = await dbConnect.make_request('SELECT COUNT(*) as count FROM comments');
            const categories_result = await dbConnect.make_request('SELECT COUNT(*) as count FROM categories');

            res.json({
                users: users_result[0][0].count,
                posts: posts_result[0][0].count,
                comments: comments_result[0][0].count,
                categories: categories_result[0][0].count
            });
        } catch(error) 
        {
            console.error('Error fetching stats:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    }

    static async get_detailed(req, res) 
    {
        try 
        {
            const users_by_role_result = await dbConnect.make_request(
                'SELECT role, COUNT(*) as count FROM users GROUP BY role'
            );

            const posts_by_status_result = await dbConnect.make_request(
                'SELECT status, COUNT(*) as count FROM posts GROUP BY status'
            );

            const top_categories_result = await dbConnect.make_request(`
                SELECT c.title, COUNT(pc.post_id) as posts_count
                FROM categories c
                LEFT JOIN post_categories pc ON c.id = pc.category_id
                GROUP BY c.id, c.title
                ORDER BY posts_count DESC
                LIMIT 10
            `);

            res.json({
                usersByRole: users_by_role_result[0],
                postsByStatus: posts_by_status_result[0],
                topCategories: top_categories_result[0]
            });
        } catch(error) 
        {
            console.error('Error fetching detailed stats:', error);
            res.status(500).json({ error: 'Failed to fetch detailed stats' });
        }
    }
}

export default AdminStatsController;
