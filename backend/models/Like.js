import DB_connect from '../utils/dbConnect.js';
import Permission from './Permission.js';

class Like 
{
    constructor(likeData) 
    {
        this.id = likeData?.id;
        this.author_id = likeData?.author_id;
        this.post_id = likeData?.post_id;
        this.comment_id = likeData?.comment_id;
        this.type = likeData?.type; // 'like', 'dislike', or 'thanks'
        this.publish_date = likeData?.publish_date;
    }

    async create() 
    {
        try 
        {
            const existing = await this.find_existing();
           
            if(existing) throw new Error('User already liked/disliked this item');

            const query = `
                INSERT INTO likes (author_id, post_id, comment_id, type)
                VALUES (?, ?, ?, ?)
            `;
            
            const result = await DB_connect.make_request(query, [
                this.author_id,
                this.post_id || null,
                this.comment_id || null,
                this.type
            ]);
            
            this.id = result[0].insertId;
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error creating like: ${error.message}`);
        }
    }

    static async can_like_post(user) 
    {
        try 
        {
            if(!user) return false;
            
            return await Permission.check_user_permission(user, Permission.PERMISSIONS.LIKE_POSTS);
        } 
        catch(error) 
        {
            throw new Error(`Error checking post like permission: ${error.message}`);
        }
    }

    static async can_like_comment(user) 
    {
        try 
        {
            if(!user) return false;
            
            return await Permission.check_user_permission(user, Permission.PERMISSIONS.LIKE_COMMENTS);
        } 
        catch(error) 
        {
            throw new Error(`Error checking comment like permission: ${error.message}`);
        }
    }

    async can_delete(user) 
    {
        try 
        {
            if(!user) return false;
            
            return this.author_id === user.id || user.is_admin();
        } 
        catch(error) 
        {
            throw new Error(`Error checking like delete permission: ${error.message}`);
        }
    }

    async find_existing() 
    {
        try 
        {
            let query;
            let params;

            if(this.post_id) 
            {
                query = 'SELECT * FROM likes WHERE author_id = ? AND post_id = ?';
                params = [this.author_id, this.post_id];
            } else if(this.comment_id) 
            {
                query = 'SELECT * FROM likes WHERE author_id = ? AND comment_id = ?';
                params = [this.author_id, this.comment_id];
            } else 
            {
                throw new Error('Either post_id or comment_id must be provided');
            }

            const result = await DB_connect.make_request(query, params);
            const rows = result[0];
            
            if(rows.length === 0) return null;
            
            return new Like(rows[0]);
        } 
        catch(error) 
        {
            throw new Error(`Error finding existing like: ${error.message}`);
        }
    }

    static async find_by_id(id) 
    {
        try 
        {
            const query = 'SELECT * FROM likes WHERE id = ?';
            const result = await DB_connect.make_request(query, [id]);
            const rows = result[0];
            
            if(rows.length === 0) return null;
            
            return new Like(rows[0]);
        } 
        catch(error) 
        {
            throw new Error(`Error finding like by ID: ${error.message}`);
        }
    }

    static async find_by_post_id(postId) 
    {
        try 
        {
            const query = `
                SELECT l.*, u.login as author_login, u.full_name as author_name
                FROM likes l
                JOIN users u ON l.author_id = u.id
                WHERE l.post_id = ?
                ORDER BY l.publish_date DESC
            `;
            
            const result = await DB_connect.make_request(query, [postId]);
            const rows = result[0];
            
            return rows.map(row => {
                const like = new Like(row);
                like.author_login = row.author_login;
                like.author_name = row.author_name;
                return like;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error finding likes by post ID: ${error.message}`);
        }
    }

    static async find_by_comment_id(commentId) 
    {
        try 
        {
            const query = `
                SELECT l.*, u.login as author_login, u.full_name as author_name
                FROM likes l
                JOIN users u ON l.author_id = u.id
                WHERE l.comment_id = ?
                ORDER BY l.publish_date DESC
            `;
            
            const result = await DB_connect.make_request(query, [commentId]);
            const rows = result[0];
            
            return rows.map(row => {
                const like = new Like(row);
                like.author_login = row.author_login;
                like.author_name = row.author_name;
                return like;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error finding likes by comment ID: ${error.message}`);
        }
    }

    static async find_by_author(authorId) 
    {
        try 
        {
            const query = `
                SELECT l.*, 
                       CASE 
                           WHEN l.post_id IS NOT NULL THEN p.title
                           ELSE NULL
                       END as post_title,
                       CASE 
                           WHEN l.comment_id IS NOT NULL THEN c.content
                           ELSE NULL
                       END as comment_content
                FROM likes l
                LEFT JOIN posts p ON l.post_id = p.id
                LEFT JOIN comments c ON l.comment_id = c.id
                WHERE l.author_id = ?
                ORDER BY l.publish_date DESC
            `;
            
            const result = await DB_connect.make_request(query, [authorId]);
            const rows = result[0];
            
            return rows.map(row => {
                const like = new Like(row);
                like.post_title = row.post_title;
                like.comment_content = row.comment_content;
                return like;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error finding likes by author: ${error.message}`);
        }
    }

    async delete() 
    {
        try 
        {
            const query = 'DELETE FROM likes WHERE id = ?';
            await DB_connect.make_request(query, [this.id]);
            
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error deleting like: ${error.message}`);
        }
    }

    async update_type(new_type) 
    {
        try 
        {
            await DB_connect.make_request('UPDATE likes SET type = ? WHERE id = ?', [new_type, this.id]);
            this.type = new_type;
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error updating like type: ${error.message}`);
        }
    }

    static async delete_user_post_like(authorId, postId) 
    {
        try 
        {
            const query = 'DELETE FROM likes WHERE author_id = ? AND post_id = ?';
            const result = await DB_connect.make_request(query, [authorId, postId]);
            const rows = result[0];
            
            return result[0].affectedRows > 0;
        } 
        catch(error) 
        {
            throw new Error(`Error deleting user post like: ${error.message}`);
        }
    }

    static async delete_user_comment_like(authorId, commentId) 
    {
        try 
        {
            const query = 'DELETE FROM likes WHERE author_id = ? AND comment_id = ?';
            const result = await DB_connect.make_request(query, [authorId, commentId]);
            const rows = result[0];
            
            return result[0].affectedRows > 0;
        } 
        catch(error) 
        {
            throw new Error(`Error deleting user comment like: ${error.message}`);
        }
    }

    static async toggle_like(user, postId, commentId, type) 
    {
        try 
        {
            if(!user) throw new Error('User authentication required for liking');
            
            if(postId && !(await this.can_like_post(user))) throw new Error('No permission to like posts');
            
            if(commentId && !(await this.can_like_comment(user))) throw new Error('No permission to like comments');

            const like = new Like({
                author_id: user.id,
                post_id: postId,
                comment_id: commentId,
                type: type
            });

            const existing = await like.find_existing();
            
            if(existing) 
            {
                if(existing.type === type) 
                {
                    await existing.delete();
                    return { action: 'removed', like: null };
                } else 
                {
                    await DB_connect.make_request('UPDATE likes SET type = ? WHERE id = ?', [type, existing.id]);
                    existing.type = type;
                    return { action: 'updated', like: existing };
                }
            } else 
            {
                await like.create();
                return { action: 'created', like: like };
            }
        } 
        catch(error) 
        {
            throw new Error(`Error toggling like: ${error.message}`);
        }
    }

    static async get_post_likes_stats(postId, userId = null) 
    {
        try 
        {
            const stats_query = `
                SELECT 
                    SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) as likes_count,
                    SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END) as dislikes_count,
                    COUNT(*) as total
                FROM likes 
                WHERE post_id = ?
            `;

            const result = await DB_connect.make_request(stats_query, [postId]);
            const rows = result[0];

            let liked = false;
            let disliked = false;

            if(userId) 
            {
                const reaction_query = `
                    SELECT type FROM likes 
                    WHERE post_id = ? AND author_id = ?
                    LIMIT 1
                `;

                const reaction_result = await DB_connect.make_request(reaction_query, [postId, userId]);
                const reaction_row = reaction_result[0][0];

                if(reaction_row) 
                {
                    liked = reaction_row.type === 'like';
                    disliked = reaction_row.type === 'dislike';
                }
            }

            const likes_count = rows[0]?.likes_count || 0;
            const dislikes_count = rows[0]?.dislikes_count || 0;

            return {
                liked,
                disliked,
                likes_count,
                dislikes_count,
                total: rows[0]?.total || likes_count + dislikes_count,
                count: likes_count
            };
        } 
        catch(error) 
        {
            throw new Error(`Error getting post likes stats: ${error.message}`);
        }
    }

    static async get_comment_likes_stats(commentId, userId = null) 
    {
        try 
        {
            const stats_query = `
                SELECT 
                    SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) as likes_count,
                    SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END) as dislikes_count,
                    COUNT(*) as total
                FROM likes 
                WHERE comment_id = ?
            `;

            const result = await DB_connect.make_request(stats_query, [commentId]);
            const rows = result[0];

            let liked = false;
            let disliked = false;

            if(userId) 
            {
                const reaction_query = `
                    SELECT type FROM likes 
                    WHERE comment_id = ? AND author_id = ?
                    LIMIT 1
                `;

                const reaction_result = await DB_connect.make_request(reaction_query, [commentId, userId]);
                const reaction_row = reaction_result[0][0];

                if(reaction_row) 
                {
                    liked = reaction_row.type === 'like';
                    disliked = reaction_row.type === 'dislike';
                }
            }

            const likes_count = rows[0]?.likes_count || 0;
            const dislikes_count = rows[0]?.dislikes_count || 0;

            return {
                liked,
                disliked,
                likes_count,
                dislikes_count,
                total: rows[0]?.total || likes_count + dislikes_count,
                count: likes_count
            };
        } 
        catch(error) 
        {
            throw new Error(`Error getting comment likes stats: ${error.message}`);
        }
    }

    static async get_comment_likes(commentId) 
    {
        try 
        {
            const query = `
                SELECT l.*, u.login as author_login, u.full_name as author_name
                FROM likes l
                JOIN users u ON l.author_id = u.id
                WHERE l.comment_id = ?
                ORDER BY l.publish_date DESC
            `;
            
            const result = await DB_connect.make_request(query, [commentId]);
            const rows = result[0];
            
            return rows.map(row => new Like(row));
        } 
        catch(error) 
        {
            throw new Error(`Error getting comment likes: ${error.message}`);
        }
    }

    static async find_user_post_like(userId, postId) 
    {
        try 
        {
            const query = 'SELECT * FROM likes WHERE author_id = ? AND post_id = ?';
            const result = await DB_connect.make_request(query, [userId, postId]);
            const rows = result[0];
            
            return rows.length > 0 ? new Like(rows[0]) : null;
        } 
        catch(error) 
        {
            throw new Error(`Error finding user post like: ${error.message}`);
        }
    }

    static async find_user_comment_like(userId, commentId) 
    {
        try 
        {
            const query = 'SELECT * FROM likes WHERE author_id = ? AND comment_id = ?';
            const result = await DB_connect.make_request(query, [userId, commentId]);
            const rows = result[0];
            
            return rows.length > 0 ? new Like(rows[0]) : null;
        } 
        catch(error) 
        {
            throw new Error(`Error finding user comment like: ${error.message}`);
        }
    }

    belongs_to_user(userId) 
    {
        return this.author_id === userId;
    }

    // Get post likes with user's like status
    static async get_post_likes(post_id, user_id = null) 
    {
        try 
        {
            return await Like.get_post_likes_stats(post_id, user_id);
        } 
        catch(error) 
        {
            throw new Error(`Error getting post likes: ${error.message}`);
        }
    }
}

export default Like;