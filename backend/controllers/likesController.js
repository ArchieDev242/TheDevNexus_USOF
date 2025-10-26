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
            const { id } = req.params;
            const user_id = req.user?.id;
            
            const count_query = `
                SELECT 
                    COUNT(CASE WHEN type = 'like' THEN 1 END) as likes_count,
                    COUNT(CASE WHEN type = 'dislike' THEN 1 END) as dislikes_count
                FROM likes 
                WHERE post_id = ?
            `;
            
            const count_result = await DB_connect.make_request(count_query, [id]);
            const counts = count_result[0][0];
            
            let user_reaction = { liked: false, disliked: false };
            
            if(user_id) 
            {
                const user_query = `
                    SELECT type 
                    FROM likes 
                    WHERE post_id = ? AND author_id = ?
                `;
                
                const user_result = await DB_connect.make_request(user_query, [id, user_id]);
                
                if(user_result[0].length > 0) 
                {
                    const reaction_type = user_result[0][0].type;
                    user_reaction.liked = reaction_type === 'like';
                    user_reaction.disliked = reaction_type === 'dislike';
                }
            }
            
            res.json({
                status: 'success',
                data: {
                    likes_count: counts.likes_count,
                    dislikes_count: counts.dislikes_count,
                    liked: user_reaction.liked,
                    disliked: user_reaction.disliked
                }
            });
        } catch(error) 
        {
            console.error('Error fetching post likes:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Failed to fetch likes' 
            });
        }
    }

    static async get_comment_likes(req, res) 
    {
        try 
        {
            const { id } = req.params;
            const user_id = req.user?.id;
            
            const count_query = `
                SELECT 
                    COUNT(CASE WHEN type = 'like' THEN 1 END) as likes_count,
                    COUNT(CASE WHEN type = 'dislike' THEN 1 END) as dislikes_count
                FROM likes 
                WHERE comment_id = ?
            `;
            
            const count_result = await DB_connect.make_request(count_query, [id]);
            const counts = count_result[0][0];
            
            let user_reaction = { liked: false, disliked: false };
            
            if(user_id) 
            {
                const user_query = `
                    SELECT type 
                    FROM likes 
                    WHERE comment_id = ? AND author_id = ?
                `;
                
                const user_result = await DB_connect.make_request(user_query, [id, user_id]);
                
                if(user_result[0].length > 0) 
                {
                    const reaction_type = user_result[0][0].type;
                    user_reaction.liked = reaction_type === 'like';
                    user_reaction.disliked = reaction_type === 'dislike';
                }
            }
            
            res.json({
                status: 'success',
                data: {
                    likes_count: counts.likes_count,
                    dislikes_count: counts.dislikes_count,
                    liked: user_reaction.liked,
                    disliked: user_reaction.disliked
                }
            });
        } catch(error) 
        {
            console.error('Error fetching comment likes:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Failed to fetch likes' 
            });
        }
    }

    // ===============================
    // AUTHORIZED USERS
    // ===============================
    
    static async like_post(req, res) 
    {
        try 
        {
            console.log('=== LIKE POST DEBUG ===');
            console.log('req.user:', req.user);
            console.log('req.cookies:', req.cookies);
            console.log('auth header:', req.headers.authorization);
            
            const author_id = req.user?.id;
            
            if(!author_id) 
            {
                console.log('Authentication failed - no user ID');
                return res.status(401).json({ 
                    status: 'error',
                    message: 'Authentication required' 
                });
            }
            
            const { id } = req.params;

            // post exists?
            const post_check = await DB_connect.make_request(
                'SELECT id FROM posts WHERE id = ? AND status = "active"',
                [id]
            );
            
            if(post_check[0].length === 0) 
            {
                return res.status(404).json({ 
                    status: 'error',
                    message: 'Post not found' 
                });
            }

            const like_exists = await DB_connect.make_request(
                'SELECT id, type FROM likes WHERE author_id = ? AND post_id = ?',
                [author_id, id]
            );

            if(like_exists[0].length > 0) 
            {
                const current_type = like_exists[0][0].type;
                
                if(current_type === 'like') 
                {
                    await DB_connect.make_request(
                        'DELETE FROM likes WHERE author_id = ? AND post_id = ?',
                        [author_id, id]
                    );
                } else 
                {
                    await DB_connect.make_request(
                        'UPDATE likes SET type = "like" WHERE author_id = ? AND post_id = ?',
                        [author_id, id]
                    );
                }
            } else 
            {
                await DB_connect.make_request(
                    'INSERT INTO likes (author_id, post_id, type) VALUES (?, ?, "like")',
                    [author_id, id]
                );
            }
            
            const count_query = `
                SELECT 
                    COUNT(CASE WHEN type = 'like' THEN 1 END) as likes_count,
                    COUNT(CASE WHEN type = 'dislike' THEN 1 END) as dislikes_count
                FROM likes 
                WHERE post_id = ?
            `;
            
            const count_result = await DB_connect.make_request(count_query, [id]);
            const counts = count_result[0][0];
            
            const user_query = `
                SELECT type 
                FROM likes 
                WHERE post_id = ? AND author_id = ?
            `;
            
            const user_result = await DB_connect.make_request(user_query, [id, author_id]);
            
            let user_reaction = { liked: false, disliked: false };
            if(user_result[0].length > 0) 
            {
                const reaction_type = user_result[0][0].type;
                user_reaction.liked = reaction_type === 'like';
                user_reaction.disliked = reaction_type === 'dislike';
            }
            
            res.json({
                status: 'success',
                data: {
                    likes_count: counts.likes_count,
                    dislikes_count: counts.dislikes_count,
                    liked: user_reaction.liked,
                    disliked: user_reaction.disliked
                }
            });
        } catch(error) 
        {
            console.error('Error liking post:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Failed to like post' 
            });
        }
    }

    static async dislike_post(req, res) 
    {
        try {
            const author_id = req.user?.id;
            
            if(!author_id) 
            {
                return res.status(401).json({ 
                    status: 'error',
                    message: 'Authentication required' 
                });
            }
            
            const { id } = req.params;
            
            const post_check = await DB_connect.make_request(
                'SELECT id FROM posts WHERE id = ? AND status = "active"',
                [id]
            );
            
            if(post_check[0].length === 0) 
            {
                return res.status(404).json({ 
                    status: 'error',
                    message: 'Post not found' 
                });
            }

            const like_exists = await DB_connect.make_request(
                'SELECT id, type FROM likes WHERE author_id = ? AND post_id = ?',
                [author_id, id]
            );

            if(like_exists[0].length > 0) 
            {
                const current_type = like_exists[0][0].type;
                
                if(current_type === 'dislike') 
                {
                    await DB_connect.make_request(
                        'DELETE FROM likes WHERE author_id = ? AND post_id = ?',
                        [author_id, id]
                    );
                } else 
                {
                    await DB_connect.make_request(
                        'UPDATE likes SET type = "dislike" WHERE author_id = ? AND post_id = ?',
                        [author_id, id]
                    );
                }
            } else 
            {
                await DB_connect.make_request(
                    'INSERT INTO likes (author_id, post_id, type) VALUES (?, ?, "dislike")',
                    [author_id, id]
                );
            }
            
            const count_query = `
                SELECT 
                    COUNT(CASE WHEN type = 'like' THEN 1 END) as likes_count,
                    COUNT(CASE WHEN type = 'dislike' THEN 1 END) as dislikes_count
                FROM likes 
                WHERE post_id = ?
            `;
            
            const count_result = await DB_connect.make_request(count_query, [id]);
            const counts = count_result[0][0];
            
            const user_query = `
                SELECT type 
                FROM likes 
                WHERE post_id = ? AND author_id = ?
            `;
            
            const user_result = await DB_connect.make_request(user_query, [id, author_id]);
            
            let user_reaction = { liked: false, disliked: false };
            if(user_result[0].length > 0) 
            {
                const reaction_type = user_result[0][0].type;
                user_reaction.liked = reaction_type === 'like';
                user_reaction.disliked = reaction_type === 'dislike';
            }
            
            res.json({
                status: 'success',
                data: {
                    likes_count: counts.likes_count,
                    dislikes_count: counts.dislikes_count,
                    liked: user_reaction.liked,
                    disliked: user_reaction.disliked
                }
            });
        } catch(error) 
        {
            console.error('Error disliking post:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Failed to dislike post' 
            });
        }
    }

    static async like_comment(req, res) 
    {
        try 
        {
            const author_id = req.user?.id;
            
            if(!author_id) 
            {
                return res.status(401).json({ 
                    status: 'error',
                    message: 'Authentication required' 
                });
            }
            
            const { id } = req.params;
            
            const comment_check = await DB_connect.make_request(
                'SELECT id FROM comments WHERE id = ? AND status = "active"',
                [id]
            );
            
            if(comment_check[0].length === 0) 
            {
                return res.status(404).json({ 
                    status: 'error',
                    message: 'Comment not found' 
                });
            }

            const like_exists = await DB_connect.make_request(
                'SELECT id, type FROM likes WHERE author_id = ? AND comment_id = ?',
                [author_id, id]
            );

            if(like_exists[0].length > 0) 
            {
                const current_type = like_exists[0][0].type;
                
                if(current_type === 'like') 
                {
                    await DB_connect.make_request(
                        'DELETE FROM likes WHERE author_id = ? AND comment_id = ?',
                        [author_id, id]
                    );
                } else 
                {
                    await DB_connect.make_request(
                        'UPDATE likes SET type = "like" WHERE author_id = ? AND comment_id = ?',
                        [author_id, id]
                    );
                }
            } else 
            {
                await DB_connect.make_request(
                    'INSERT INTO likes (author_id, post_id, comment_id, type) VALUES (?, NULL, ?, "like")',
                    [author_id, id]
                );
            }
            
            const count_query = `
                SELECT 
                    COUNT(CASE WHEN type = 'like' THEN 1 END) as likes_count,
                    COUNT(CASE WHEN type = 'dislike' THEN 1 END) as dislikes_count
                FROM likes 
                WHERE comment_id = ?
            `;
            
            const count_result = await DB_connect.make_request(count_query, [id]);
            const counts = count_result[0][0];
            
            const user_query = `
                SELECT type 
                FROM likes 
                WHERE comment_id = ? AND author_id = ?
            `;
            
            const user_result = await DB_connect.make_request(user_query, [id, author_id]);
            
            let user_reaction = { liked: false, disliked: false };
            if(user_result[0].length > 0) 
            {
                const reaction_type = user_result[0][0].type;
                user_reaction.liked = reaction_type === 'like';
                user_reaction.disliked = reaction_type === 'dislike';
            }
            
            res.json({
                status: 'success',
                data: {
                    likes_count: counts.likes_count,
                    dislikes_count: counts.dislikes_count,
                    liked: user_reaction.liked,
                    disliked: user_reaction.disliked
                }
            });
        } catch(error) 
        {
            console.error('Error liking comment:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Failed to like comment' 
            });
        }
    }

    static async dislike_comment(req, res) 
    {
        try 
        {
            const author_id = req.user?.id;
            
            if(!author_id) 
            {
                return res.status(401).json({ 
                    status: 'error',
                    message: 'Authentication required' 
                });
            }
            
            const { id } = req.params;
            
            const comment_check = await DB_connect.make_request(
                'SELECT id FROM comments WHERE id = ? AND status = "active"',
                [id]
            );
            
            if(comment_check[0].length === 0) 
            {
                return res.status(404).json({ 
                    status: 'error',
                    message: 'Comment not found' 
                });
            }

            const like_exists = await DB_connect.make_request(
                'SELECT id, type FROM likes WHERE author_id = ? AND comment_id = ?',
                [author_id, id]
            );

            if(like_exists[0].length > 0) 
            {
                const current_type = like_exists[0][0].type;
                
                if(current_type === 'dislike') 
                {
                    await DB_connect.make_request(
                        'DELETE FROM likes WHERE author_id = ? AND comment_id = ?',
                        [author_id, id]
                    );
                } else 
                {
                    await DB_connect.make_request(
                        'UPDATE likes SET type = "dislike" WHERE author_id = ? AND comment_id = ?',
                        [author_id, id]
                    );
                }
            } else 
            {
                await DB_connect.make_request(
                    'INSERT INTO likes (author_id, post_id, comment_id, type) VALUES (?, NULL, ?, "dislike")',
                    [author_id, id]
                );
            }
            
            const count_query = `
                SELECT 
                    COUNT(CASE WHEN type = 'like' THEN 1 END) as likes_count,
                    COUNT(CASE WHEN type = 'dislike' THEN 1 END) as dislikes_count
                FROM likes 
                WHERE comment_id = ?
            `;
            
            const count_result = await DB_connect.make_request(count_query, [id]);
            const counts = count_result[0][0];
            
            const user_query = `
                SELECT type 
                FROM likes 
                WHERE comment_id = ? AND author_id = ?
            `;
            
            const user_result = await DB_connect.make_request(user_query, [id, author_id]);
            
            let user_reaction = { liked: false, disliked: false };
            if(user_result[0].length > 0) 
            {
                const reaction_type = user_result[0][0].type;
                user_reaction.liked = reaction_type === 'like';
                user_reaction.disliked = reaction_type === 'dislike';
            }
            
            res.json({
                status: 'success',
                data: {
                    likes_count: counts.likes_count,
                    dislikes_count: counts.dislikes_count,
                    liked: user_reaction.liked,
                    disliked: user_reaction.disliked
                }
            });
        } catch(error) 
        {
            console.error('Error disliking comment:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Failed to dislike comment' 
            });
        }
    }

    static async get_user_likes(req, res) 
    {
        try 
        {
            const author_id = req.user?.id || 1;
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
                WHERE l.author_id = ?
                ORDER BY l.id DESC
                LIMIT ? OFFSET ?
            `;
            
            const result = await DB_connect.make_request(query, [author_id, parseInt(limit), offset]);
            res.json(result[0]);
        } catch(error) 
        {
            console.error('Error fetching user likes:', error);
            res.status(500).json({ error: 'Failed to fetch user likes' });
        }
    }

    // ===============================
    // USER RATING/REPUTATION SYSTEM
    // ===============================

    static async rate_user(req, res) 
    {
        try 
        {
            const giver_id = req.user?.id;
            const { userId } = req.params;
            const { value } = req.body; // 1 for like, -1 for dislike

            if(!giver_id) return res.status(401).json({ error: 'Authentication required' });
            
            if(giver_id == userId) return res.status(400).json({ error: 'Cannot rate yourself' });
            
            if(value !== 1 && value !== -1) return res.status(400).json({ error: 'Value must be 1 or -1' });

            const user_check = await DB_connect.make_request(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );
            
            if(user_check[0].length === 0) return res.status(404).json({ error: 'User not found' });

            const existing_rating = await DB_connect.make_request(
                'SELECT * FROM user_reputations WHERE giver_id = ? AND receiver_id = ?',
                [giver_id, userId]
            );

            if(existing_rating[0].length > 0) 
            {
                const current_value = existing_rating[0][0].value;
                
                if(current_value === value) 
                {
                    await DB_connect.make_request(
                        'DELETE FROM user_reputations WHERE giver_id = ? AND receiver_id = ?',
                        [giver_id, userId]
                    );
                    
                    // Update user rating
                    await DB_connect.make_request(
                        'UPDATE users SET rating = rating - ? WHERE id = ?',
                        [value, userId]
                    );
                    
                    return res.json({ success: true, message: 'Rating removed', action: 'removed' });
                } else 
                {
                    await DB_connect.make_request(
                        'UPDATE user_reputations SET value = ? WHERE giver_id = ? AND receiver_id = ?',
                        [value, giver_id, userId]
                    );
                    
                    const delta = value - current_value;
                    await DB_connect.make_request(
                        'UPDATE users SET rating = rating + ? WHERE id = ?',
                        [delta, userId]
                    );
                    
                    return res.json({ success: true, message: 'Rating updated', action: value === 1 ? 'liked' : 'disliked' });
                }
            } else 
            {
                await DB_connect.make_request(
                    'INSERT INTO user_reputations (giver_id, receiver_id, value) VALUES (?, ?, ?)',
                    [giver_id, userId, value]
                );
                
                await DB_connect.make_request(
                    'UPDATE users SET rating = rating + ? WHERE id = ?',
                    [value, userId]
                );
                
                return res.json({ success: true, message: 'Rating added', action: value === 1 ? 'liked' : 'disliked' });
            }
        } catch(error) 
        {
            console.error('Error rating user:', error);
            res.status(500).json({ error: 'Failed to rate user' });
        }
    }

    static async get_user_rating(req, res) 
    {
        try 
        {
            const { userId } = req.params;
            const current_user_id = req.user?.id;

            const query = `
                SELECT 
                    u.rating,
                    u.reputation_score,
                    (SELECT COUNT(*) FROM user_reputations WHERE receiver_id = ? AND value = 1) as likes_count,
                    (SELECT COUNT(*) FROM user_reputations WHERE receiver_id = ? AND value = -1) as dislikes_count
                FROM users u
                WHERE u.id = ?
            `;
            
            const result = await DB_connect.make_request(query, [userId, userId, userId]);
            
            if(result[0].length === 0) return res.status(404).json({ error: 'User not found' });

            const user_rating = result[0][0];

            let user_vote = null;
            if(current_user_id) 
            {
                const vote_query = 'SELECT value FROM user_reputations WHERE giver_id = ? AND receiver_id = ?';
                const vote_result = await DB_connect.make_request(vote_query, [current_user_id, userId]);
                user_vote = vote_result[0].length > 0 ? vote_result[0][0].value : null;
            }

            res.json({
                rating: user_rating.rating,
                reputation_score: user_rating.reputation_score,
                likes_count: user_rating.likes_count,
                dislikes_count: user_rating.dislikes_count,
                user_vote: user_vote
            });
        } catch(error) 
        {
            console.error('Error fetching user rating:', error);
            res.status(500).json({ error: 'Failed to fetch user rating' });
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
