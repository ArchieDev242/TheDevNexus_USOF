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
                this.post_id,
                this.comment_id,
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

    static async get_post_likes_stats(postId) 
    {
        try 
        {
            const query = `
                SELECT 
                    SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) as likes,
                    SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END) as dislikes,
                    COUNT(*) as total
                FROM likes 
                WHERE post_id = ?
            `;
            
            const result = await DB_connect.make_request(query, [postId]);
            const rows = result[0];
            
            return {
                likes: rows[0]?.likes || 0,
                dislikes: rows[0]?.dislikes || 0,
                total: rows[0]?.total || 0
            };
        } 
        catch(error) 
        {
            throw new Error(`Error getting post likes stats: ${error.message}`);
        }
    }

    static async get_comment_likes_stats(commentId) 
    {
        try 
        {
            const query = `
                SELECT 
                    SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) as likes,
                    SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END) as dislikes,
                    COUNT(*) as total
                FROM likes 
                WHERE comment_id = ?
            `;
            
            const result = await DB_connect.make_request(query, [commentId]);
            const rows = result[0];
            
            return {
                likes: rows[0]?.likes || 0,
                dislikes: rows[0]?.dislikes || 0,
                total: rows[0]?.total || 0
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
}

export default Like;