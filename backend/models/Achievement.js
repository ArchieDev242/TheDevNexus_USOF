import dbConnect from '../utils/dbConnect.js';

class Achievement 
{
    constructor(data) 
    {
        this.id = data.id;
        this.key_name = data.key_name;
        this.title = data.title;
        this.description = data.description;
        this.icon = data.icon;
        this.points = data.points;
        this.is_active = data.is_active;
        this.created_at = data.created_at;
    }

    static async get_all() 
    {
        const [rows] = await dbConnect.make_request(
            'SELECT * FROM achievements WHERE is_active = TRUE ORDER BY points ASC'
        );
        return rows.map(row => new Achievement(row));
    }

    static async get_by_key(key_name) 
    {
        const [rows] = await dbConnect.make_request(
            'SELECT * FROM achievements WHERE key_name = ? AND is_active = TRUE',
            [key_name]
        );

        return rows.length ? new Achievement(rows[0]) : null;
    }

    static async get_by_id(id) 
    {
        const [rows] = await dbConnect.make_request(
            'SELECT * FROM achievements WHERE id = ? AND is_active = TRUE',
            [id]
        );

        return rows.length ? new Achievement(rows[0]) : null;
    }

    static async get_user_achievements(user_id) 
    {
        const [rows] = await dbConnect.make_request(`
            SELECT a.*, ua.earned_at, ua.progress 
            FROM achievements a 
            INNER JOIN user_achievements ua ON a.id = ua.achievement_id 
            WHERE ua.user_id = ? AND a.is_active = TRUE 
            ORDER BY ua.earned_at DESC
        `, [user_id]);
        
        return rows.map(row => ({
            ...new Achievement(row),
            earned_at: row.earned_at,
            progress: row.progress
        }));
    }

    static async user_has_achievement(user_id, achievement_key) 
    {
        const [rows] = await dbConnect.make_request(`
            SELECT ua.id 
            FROM user_achievements ua 
            INNER JOIN achievements a ON ua.achievement_id = a.id 
            WHERE ua.user_id = ? AND a.key_name = ?
        `, [user_id, achievement_key]);
        
        return rows.length > 0;
    }

    static async award_achievement(user_id, achievement_key, progress = 100) 
    {
        try 
        {
            if(await Achievement.user_has_achievement(user_id, achievement_key)) 
                {
                return { success: false, message: 'Achievement already earned' };
            }

            const achievement = await Achievement.get_by_key(achievement_key);
            if(!achievement) return { success: false, message: 'Achievement not found' };

            await dbConnect.make_request(`
                INSERT INTO user_achievements (user_id, achievement_id, progress) 
                VALUES (?, ?, ?)
            `, [user_id, achievement.id, progress]);

            await dbConnect.make_request(`
                UPDATE users 
                SET rating = rating + ? 
                WHERE id = ?
            `, [achievement.points, user_id]);

            return { 
                success: true, 
                achievement: achievement,
                points_earned: achievement.points
            };
        } catch(error) 
        {
            console.error('Error awarding achievement:', error);
            return { success: false, message: 'Database error' };
        }
    }

    static async get_user_stats(user_id) 
    {
        const [rows] = await dbConnect.make_request(`
            SELECT 
                COUNT(*) as total_earned,
                SUM(a.points) as total_points,
                (SELECT COUNT(*) FROM achievements WHERE is_active = TRUE) as total_available
            FROM user_achievements ua
            INNER JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ? AND a.is_active = TRUE
        `, [user_id]);

        return rows[0] || { total_earned: 0, total_points: 0, total_available: 0 };
    }

    static async get_leaderboard(limit = 10) 
    {
        const [rows] = await dbConnect.make_request(`
            SELECT 
                u.id,
                u.login,
                u.full_name,
                u.profile_picture,
                COALESCE(SUM(a.points), 0) as achievement_points,
                COUNT(ua.id) as achievements_count
            FROM users u
            LEFT JOIN user_achievements ua ON u.id = ua.user_id
            LEFT JOIN achievements a ON ua.achievement_id = a.id AND a.is_active = TRUE
            WHERE u.role = 'user'
            GROUP BY u.id, u.login, u.full_name, u.profile_picture
            ORDER BY achievement_points DESC, achievements_count DESC
            LIMIT ?
        `, [limit]);

        return rows;
    }
}

export default Achievement;
