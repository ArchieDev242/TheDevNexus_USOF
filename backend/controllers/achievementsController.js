import Achievement from '../models/Achievement.js';
import achievement_service from '../services/AchievementService.js';

export const get_all_achievements = async (req, res) => {
    try 
    {
        const achievements = await Achievement.get_all();
        res.json({
            status: 'success',
            data: achievements
        });
    } catch(error) 
    {
        console.error('Error fetching achievements:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch achievements'
        });
    }
};

export const get_user_achievements = async (req, res) => {
    try 
    {
        const user_id = req.user.id;
        
        const achievements = await achievement_service.get_user_achievements(user_id);
        const stats = await achievement_service.get_user_stats(user_id);
        
        res.json({
            success: true,
            achievements: achievements,
            stats: stats
        });
    } catch(error) 
    {
        console.error('Error fetching user achievements:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user achievements'
        });
    }
};

export const get_public_user_achievements = async (req, res) => {
    try 
    {
        const { user_id } = req.params;
        
        const achievements = await achievement_service.get_user_achievements(user_id);
        const stats = await achievement_service.get_user_stats(user_id);
        
        res.json({
            success: true,
            achievements: achievements,
            stats: stats
        });
    } catch(error) 
    {
        console.error('Error fetching public user achievements:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user achievements'
        });
    }
};

export const get_leaderboard = async (req, res) => {
    try 
    {
        const limit = parseInt(req.query.limit) || 10;
        const leaderboard = await achievement_service.get_leaderboard(limit);
        
        res.json({
            success: true,
            leaderboard: leaderboard,
            count: leaderboard.length
        });
    } catch(error) 
    {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch leaderboard'
        });
    }
};

export const get_achievement_details = async (req, res) => {
    try 
    {
        const { id } = req.params;
        let achievement;
        
        if(isNaN(id)) 
            {
            achievement = await Achievement.get_by_key(id);
        } else 
            {
            achievement = await Achievement.get_by_id(parseInt(id));
        }
        
        if(!achievement) 
            {
            return res.status(404).json({
                success: false,
                error: 'Achievement not found'
            });
        }
        
        res.json({
            success: true,
            achievement: achievement
        });
    } catch(error) 
    {
        console.error('Error fetching achievement details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch achievement details'
        });
    }
};

export const award_achievement = async (req, res) => {
    try 
    {
        if(req.user.role !== 'admin') 
            {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }
        
        const { user_id, achievement_key } = req.body;
        
        if(!user_id || !achievement_key) 
            {
            return res.status(400).json({
                success: false,
                error: 'user_id and achievement_key are required'
            });
        }
        
        const result = await achievement_service.award_achievement(user_id, achievement_key);
        
        if(result.success) 
            {
            res.json({
                success: true,
                message: 'Achievement awarded successfully',
                achievement: result.achievement,
                points_earned: result.points_earned
            });
        } else 
            {
            res.status(400).json({
                success: false,
                error: result.message
            });
        }
    } catch(error) 
    {
        console.error('Error awarding achievement:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to award achievement'
        });
    }
};