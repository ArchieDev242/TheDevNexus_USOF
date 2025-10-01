import DB_connect from '../utils/dbConnect.js';

class likes_controller 
{
    // ===============================
    // ALL USERS
    // ===============================
    
    static async get_post_likes(req, res) 
    {
        try 
        {
            const { postId } = req.params;
            
            const query = `
                SELECT 
                    COUNT(CASE WHEN type = 'like' THEN 1 END) as likes_count,
                    COUNT(CASE WHEN type = 'dislike' THEN 1 END) as dislikes_count
                FROM likes 
                WHERE post_id = ?
            `;
            
            const result = await DB_connect.make_request(query, [postId]);
            res.json(result[0][0]);
        } catch(error) 
        {
            console.error('Error fetching post likes:', error);
            res.status(500).json({ error: 'Failed to fetch likes' });
        }
    }

    static async get_comment_likes(req, res) 
    {
        try 
        {
            const { commentId } = req.params;
            
            const query = `
                SELECT 
                    COUNT(CASE WHEN type = 'like' THEN 1 END) as likes_count,
                    COUNT(CASE WHEN type = 'dislike' THEN 1 END) as dislikes_count
                FROM likes 
                WHERE comment_id = ?
            `;
            
            const result = await DB_connect.make_request(query, [commentId]);
            res.json(result[0][0]);
        } catch(error) 
        {
            console.error('Error fetching comment likes:', error);
            res.status(500).json({ error: 'Failed to fetch likes' });
        }
    }

    // ===============================
    // AUTHORIZED USERS
    // ===============================
    
    static async like_post(req, res) 
    {
        try 
        {
            const user_id = req.user?.id || 1; // for testing
            const { postId } = req.params;

            // post exists?
            const post_check = await DB_connect.make_request(
                'SELECT id FROM posts WHERE id = ? AND status = "active"',
                [postId]
            );
            
            if(post_check[0].length === 0) return res.status(404).json({ error: 'Post not found' });

            const like_exists = await DB_connect.make_request(
                'SELECT id, type FROM likes WHERE user_id = ? AND post_id = ?',
                [user_id, postId]
            );

            if(like_exists[0].length > 0) 
                {
                const current_type = like_exists[0][0].type;
                
                if(current_type === 'like') 
                    {
                    await DB_connect.make_request(
                        'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
                        [user_id, postId]
                    );
                    res.json({ success: true, message: 'Like removed', action: 'unliked' });
                } else 
                    {
                    await DB_connect.make_request(
                        'UPDATE likes SET type = "like" WHERE user_id = ? AND post_id = ?',
                        [user_id, postId]
                    );
                    res.json({ success: true, message: 'Changed to like', action: 'liked' });
                }
            } else 
                {
                await DB_connect.make_request(
                    'INSERT INTO likes (user_id, post_id, type) VALUES (?, ?, "like")',
                    [user_id, postId]
                );
                res.json({ success: true, message: 'Post liked', action: 'liked' });
            }
        } catch (error) 
        {
            console.error('Error liking post:', error);
            res.status(500).json({ error: 'Failed to like post' });
        }
    }

    static async dislike_post(req, res) 
    {
        try {
            const user_id = req.user?.id || 1;
            const { postId } = req.params;
            
            const post_check = await DB_connect.make_request(
                'SELECT id FROM posts WHERE id = ? AND status = "active"',
                [postId]
            );
            
            if(post_check[0].length === 0) return res.status(404).json({ error: 'Post not found' });

            const like_exists = await DB_connect.make_request(
                'SELECT id, type FROM likes WHERE user_id = ? AND post_id = ?',
                [user_id, postId]
            );

            if(like_exists[0].length > 0) 
                {
                const current_type = like_exists[0][0].type;
                
                if(current_type === 'dislike') 
                    {
                    await DB_connect.make_request(
                        'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
                        [user_id, postId]
                    );
                    res.json({ success: true, message: 'Dislike removed', action: 'undisliked' });
                } else 
                    {
                    await DB_connect.make_request(
                        'UPDATE likes SET type = "dislike" WHERE user_id = ? AND post_id = ?',
                        [user_id, postId]
                    );
                    res.json({ success: true, message: 'Changed to dislike', action: 'disliked' });
                }
            } else 
                {
                await DB_connect.make_request(
                    'INSERT INTO likes (user_id, post_id, type) VALUES (?, ?, "dislike")',
                    [user_id, postId]
                );
                res.json({ success: true, message: 'Post disliked', action: 'disliked' });
            }
        } catch(error) 
        {
            console.error('Error disliking post:', error);
            res.status(500).json({ error: 'Failed to dislike post' });
        }
    }

    static async like_comment(req, res) 
    {
        try 
        {
            const user_id = req.user?.id || 1;
            const { commentId } = req.params;
            
            const comment_check = await DB_connect.make_request(
                'SELECT id FROM comments WHERE id = ? AND status = "active"',
                [commentId]
            );
            
            if(comment_check[0].length === 0) return res.status(404).json({ error: 'Comment not found' });

            const like_exists = await DB_connect.make_request(
                'SELECT id, type FROM likes WHERE user_id = ? AND comment_id = ?',
                [user_id, commentId]
            );

            if(like_exists[0].length > 0) 
                {
                const current_type = like_exists[0][0].type;
                
                if(current_type === 'like') 
                    {
                    await DB_connect.make_request(
                        'DELETE FROM likes WHERE user_id = ? AND comment_id = ?',
                        [user_id, commentId]
                    );
                    res.json({ success: true, message: 'Like removed', action: 'unliked' });
                } else 
                    {
                    await DB_connect.make_request(
                        'UPDATE likes SET type = "like" WHERE user_id = ? AND comment_id = ?',
                        [user_id, commentId]
                    );
                    res.json({ success: true, message: 'Changed to like', action: 'liked' });
                }
            } else 
                {
                await DB_connect.make_request(
                    'INSERT INTO likes (user_id, comment_id, type) VALUES (?, ?, "like")',
                    [user_id, commentId]
                );
                res.json({ success: true, message: 'Comment liked', action: 'liked' });
            }
        } catch(error) 
        {
            console.error('Error liking comment:', error);
            res.status(500).json({ error: 'Failed to like comment' });
        }
    }

    static async dislike_comment(req, res) 
    {
        try 
        {
            const user_id = req.user?.id || 1;
            const { commentId } = req.params;
            
            const comment_check = await DB_connect.make_request(
                'SELECT id FROM comments WHERE id = ? AND status = "active"',
                [commentId]
            );
            
            if(comment_check[0].length === 0) return res.status(404).json({ error: 'Comment not found' });

            const like_exists = await DB_connect.make_request(
                'SELECT id, type FROM likes WHERE user_id = ? AND comment_id = ?',
                [user_id, commentId]
            );

            if(like_exists[0].length > 0) 
                {
                const current_type = like_exists[0][0].type;
                
                if(current_type === 'dislike') 
                    {
                    await DB_connect.make_request(
                        'DELETE FROM likes WHERE user_id = ? AND comment_id = ?',
                        [user_id, commentId]
                    );
                    res.json({ success: true, message: 'Dislike removed', action: 'undisliked' });
                } else 
                    {
                    await DB_connect.make_request(
                        'UPDATE likes SET type = "dislike" WHERE user_id = ? AND comment_id = ?',
                        [user_id, commentId]
                    );
                    res.json({ success: true, message: 'Changed to dislike', action: 'disliked' });
                }
            } else 
                {
                await DB_connect.make_request(
                    'INSERT INTO likes (user_id, comment_id, type) VALUES (?, ?, "dislike")',
                    [user_id, commentId]
                );
                res.json({ success: true, message: 'Comment disliked', action: 'disliked' });
            }
        } catch(error) 
        {
            console.error('Error disliking comment:', error);
            res.status(500).json({ error: 'Failed to dislike comment' });
        }
    }

    static async get_user_likes(req, res) 
    {
        try 
        {
            const user_id = req.user?.id || 1;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;
            
            const query = `
                SELECT l.*, 
                       p.title as post_title,
                       c.content as comment_content,
                       CASE 
                           WHEN l.post_id IS NOT NULL THEN 'post'
                           WHEN l.comment_id IS NOT NULL THEN 'comment'
                       END as target_type
                FROM likes l
                LEFT JOIN posts p ON l.post_id = p.id
                LEFT JOIN comments c ON l.comment_id = c.id
                WHERE l.user_id = ?
                ORDER BY l.id DESC
                LIMIT ? OFFSET ?
            `;
            
            const result = await DB_connect.make_request(query, [user_id, parseInt(limit), offset]);
            res.json(result[0]);
        } catch(error) 
        {
            console.error('Error fetching user likes:', error);
            res.status(500).json({ error: 'Failed to fetch user likes' });
        }
    }

    // ===============================
    // ADMIN
    // ===============================
    
    static async admin_get_stats(req, res) 
    {
        try 
        {
            const query = `
                SELECT 
                    COUNT(*) as total_likes,
                    COUNT(CASE WHEN type = 'like' THEN 1 END) as likes_count,
                    COUNT(CASE WHEN type = 'dislike' THEN 1 END) as dislikes_count,
                    COUNT(CASE WHEN post_id IS NOT NULL THEN 1 END) as post_likes,
                    COUNT(CASE WHEN comment_id IS NOT NULL THEN 1 END) as comment_likes
                FROM likes
            `;
            
            const result = await DB_connect.make_request(query);
            res.json(result[0][0]);
        } catch(error) 
        {
            console.error('Error fetching likes stats:', error);
            res.status(500).json({ error: 'Failed to fetch likes statistics' });
        }
    }
}

export default likes_controller;
