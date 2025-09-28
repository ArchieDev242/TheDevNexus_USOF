import Achievement from '../models/Achievement.js';
import dbConnect from '../utils/dbConnect.js';
import NotificationService from './NotificationService.js';

class AchievementService 
{
    constructor() 
    {
        this.achievementCache = new Map();
        this.cacheLoaded = false;
    }

    async load_achievements() 
    {
        if(this.cacheLoaded) return;
        
        try 
        {
            const achievements = await Achievement.get_all();
            achievements.forEach(achievement => {
                this.achievementCache.set(achievement.key_name, achievement);
            });
            this.cacheLoaded = true;
            console.log('AchievementService: Loaded', achievements.length, 'achievements');
        } catch(error) 
        {
            console.error('❌ AchievementService: Failed to load achievements:', error);
        }
    }

    async ensure_cache_loaded() 
    {
        if(!this.cacheLoaded) await this.load_achievements();
    }

    async award_achievement(user_id, achievement_key, context = {}) 
    {
        try 
        {
            await this.ensure_cache_loaded();
            console.log('AchievementService: Checking achievement', achievement_key, 'for user', user_id);
            
            const result = await Achievement.award_achievement(user_id, achievement_key);
            
            if(result.success) 
                {
                console.log('Achievement earned:', achievement_key, 'by user', user_id);
                
                await NotificationService.create({
                    user_id: user_id,
                    type: 'system',
                    title: `Нова ачівка: ${result.achievement.title}!`,
                    message: `Вітаємо! Ви отримали ачівку "${result.achievement.title}" (+${result.points_earned} балів)`,
                    related_type: 'achievement',
                    related_id: result.achievement.id
                });

                return result;
            } else 
                {
                console.log('ℹAchievement not awarded:', result.message);
                return result;
            }
        } catch(error) 
        {
            console.error('❌ AchievementService: Error awarding achievement:', error);
            return { success: false, message: 'Service error' };
        }
    }

    // "Hello, World!" - first post
    async check_HelloWorld(user_id) 
    {
        const [rows] = await dbConnect.make_request(
            'SELECT COUNT(*) as post_count FROM posts WHERE author_id = ? AND status = "active"',
            [user_id]
        );
        
        if(rows[0].post_count === 1) return this.award_achievement(user_id, 'hello_world');

        return { success: false, message: 'Not first post' };
    }

    // "Chatterbox" - 10 comments
    async check_Chatterbox(user_id) 
    {
        const [rows] = await dbConnect.make_request(
            'SELECT COUNT(*) as comment_count FROM comments WHERE author_id = ? AND status = "active"',
            [user_id]
        );
        
        if(rows[0].comment_count >= 10) return this.award_achievement(user_id, 'chatterbox');

        return { success: false, message: 'Need more comments' };
    }

    // "Hero of the Day" - 10 likes in first 24 hours
    async checkHeroOfTheDay(post_id, author_id) 
    {
        const [rows] = await dbConnect.make_request(`
            SELECT 
                p.publish_date,
                COUNT(l.id) as like_count
            FROM posts p
            LEFT JOIN likes l ON p.id = l.post_id AND l.type = 'like'
            WHERE p.id = ? AND p.author_id = ?
            AND p.publish_date > DATE_SUB(NOW(), INTERVAL 24 HOUR)
            GROUP BY p.id, p.publish_date
        `, [post_id, author_id]);
        
        if(rows.length && rows[0].like_count >= 10) return this.award_achievement(author_id, 'hero_of_the_day');

        return { success: false, message: 'Not enough likes in 24h' };
    }

    // "Wise One" - 60+ likes on any post
    async check_WiseOne(author_id) 
    {
        const [rows] = await dbConnect.make_request(`
            SELECT 
                p.id,
                COUNT(l.id) as like_count
            FROM posts p
            LEFT JOIN likes l ON p.id = l.post_id AND l.type = 'like'
            WHERE p.author_id = ? AND p.status = 'active'
            GROUP BY p.id
            HAVING like_count >= 60
            LIMIT 1
        `, [author_id]);
        
        if(rows.length > 0) return this.award_achievement(author_id, 'wise_one');

        return { success: false, message: 'Need more likes' };
    }

    // "Architect" - post with code snippet
    async check_Architect(user_id, post_content) 
    {
        // simple check for code blocks (```code``` or <code> tags)
        const has_code_block = /```[\s\S]*?```|<code[\s\S]*?<\/code>/i.test(post_content);
        
        if(has_code_block) return this.award_achievement(user_id, 'architect');

        return { success: false, message: 'No code snippet found' };
    }

    // "Legend" - thanks from 50% of users
    async check_Legend(user_id) 
    {
        const [total_sers] = await dbConnect.make_request(
            'SELECT COUNT(*) as total FROM users WHERE role = "user" AND id != ?',
            [user_id]
        );
        
        const [thanks_rows] = await dbConnect.make_request(`
            SELECT COUNT(DISTINCT l.author_id) as unique_thanks
            FROM likes l
            INNER JOIN posts p ON l.post_id = p.id
            WHERE p.author_id = ? AND l.type = 'thanks'
        `, [user_id]);
        
        const required_thanks = Math.ceil(total_sers[0].total * 0.5);
        const actual_thanks = thanks_rows[0].unique_thanks;
        
        if(actual_thanks >= required_thanks) return this.award_achievement(user_id, 'legend');

        return { success: false, message: `Need thanks from ${required_thanks - actual_thanks} more users` };
    }

    async check_achievements_after_post(user_id, post_id, post_content) 
    {
        const results = [];
        
        // check  Hello World (first post)
        results.push(await this.check_HelloWorld(user_id));
        
        // check Architect (code snippet)
        results.push(await this.check_Architect(user_id, post_content));
        
        return results.filter(r => r.success);
    }

    async check_achievements_after_comment(user_id) 
    {
        const results = [];
        
        // check Chatterbox (10 comments)
        results.push(await this.check_Chatterbox(user_id));
        
        return results.filter(r => r.success);
    }

    async check_achievements_after_like(post_id, post_author_id, like_type) 
    {
        const results = [];
        
        if(like_type === 'like') 
            {
            // check Hero of the Day
            results.push(await this.checkHeroOfTheDay(post_id, post_author_id));
            
            // check Wise One
            results.push(await this.check_WiseOne(post_author_id));
        }
        
        if(like_type === 'thanks') 
            {
            // check Legend
            results.push(await this.check_Legend(post_author_id));
        }
        
        return results.filter(r => r.success);
    }

    async get_user_achievements(user_id) 
    {
        return await Achievement.get_user_achievements(user_id);
    }

    async get_leaderboard(limit = 10) 
    {
        return await Achievement.get_leaderboard(limit);
    }

    async get_user_stats(user_id) 
    {
        return await Achievement.get_user_stats(user_id);
    }
}

export default new AchievementService();