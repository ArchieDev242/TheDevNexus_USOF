import DB_connect from '../utils/dbConnect.js';
import Permission from './Permission.js';
import { normalize_avatar } from '../utils/avatarUtils.js';

class Comment 
{
    constructor(commentData) 
    {
        this.id = commentData?.id;
        this.post_id = commentData?.post_id;
        this.author_id = commentData?.author_id;
        this.parent_comment_id = commentData?.parent_comment_id || null;
        this.content = commentData?.content;
        this.status = commentData?.status || 'active';
        this.publish_date = commentData?.publish_date;
    }

    async create() 
    {
        try 
        {
            const has_parent_column = await Comment.ensure_parent_comment_column();

            let result;

            if(has_parent_column)
            {
                try
                {
                    result = await DB_connect.make_request(`
                        INSERT INTO comments (post_id, author_id, parent_comment_id, content, status)
                        VALUES (?, ?, ?, ?, ?)
                    `, [
                        this.post_id,
                        this.author_id,
                        this.parent_comment_id || null,
                        this.content,
                        this.status
                    ]);
                } catch(error)
                {
                    if(/Unknown column 'parent_comment_id'/i.test(error.message))
                    {
                        Comment.parent_column_checked = true;
                        Comment.has_parent_comment_column = false;
                        if(this.parent_comment_id)
                        {
                            throw new Error('Replies are not supported: missing parent_comment_id column');
                        }

                        result = await DB_connect.make_request(`
                            INSERT INTO comments (post_id, author_id, content, status)
                            VALUES (?, ?, ?, ?)
                        `, [
                            this.post_id,
                            this.author_id,
                            this.content,
                            this.status
                        ]);
                    } else
                    {
                        throw error;
                    }
                }
            } else 
            {
                if(this.parent_comment_id)
                {
                    throw new Error('Replies are not supported: missing parent_comment_id column');
                }

                result = await DB_connect.make_request(`
                    INSERT INTO comments (post_id, author_id, content, status)
                    VALUES (?, ?, ?, ?)
                `, [
                    this.post_id,
                    this.author_id,
                    this.content,
                    this.status
                ]);
            }
            
            this.id = result[0].insertId;
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error creating comment: ${error.message}`);
        }
    }

    static async can_view(user) 
    {
        try 
        {
            return await Permission.check_user_permission(user, Permission.PERMISSIONS.READ_COMMENTS);
        } 
        catch(error) 
        {
            throw new Error(`Error checking view permission: ${error.message}`);
        }
    }

    static async can_create(user) 
    {
        try 
        {
            if(!user) return false;
            
            return await Permission.check_user_permission(user, Permission.PERMISSIONS.CREATE_COMMENTS);
        } 
        catch(error) 
        {
            throw new Error(`Error checking create permission: ${error.message}`);
        }
    }

    async can_edit(user) 
    {
        try 
        {
            if(!user) return false;
            
            const is_owner = this.author_id === user.id;
            const can_edit_own = await Permission.check_user_permission(user, Permission.PERMISSIONS.EDIT_OWN_COMMENTS);
            const can_edit_any = await Permission.check_user_permission(user, Permission.PERMISSIONS.EDIT_ANY_COMMENTS);
            
            return (is_owner && can_edit_own) || can_edit_any;
        } 
        catch(error) 
        {
            throw new Error(`Error checking edit permission: ${error.message}`);
        }
    }

    async can_delete(user) 
    {
        try 
        {
            if(!user) return false;
            
            const is_owner = this.author_id === user.id;
            const can_delete_own = await Permission.check_user_permission(user, Permission.PERMISSIONS.DELETE_OWN_COMMENTS);
            const can_delete_any = await Permission.check_user_permission(user, Permission.PERMISSIONS.DELETE_ANY_COMMENTS);
            
            return (is_owner && can_delete_own) || can_delete_any;
        } 
        catch(error) 
        {
            throw new Error(`Error checking delete permission: ${error.message}`);
        }
    }

    async can_like(user) 
    {
        try 
        {
            if(!user) return false;
            return await Permission.check_user_permission(user, Permission.PERMISSIONS.LIKE_COMMENTS);
        } 
        catch(error) 
        {
            throw new Error(`Error checking like permission: ${error.message}`);
        }
    }

    static async find_by_id(id) 
    {
        try 
        {
            const query = `
                SELECT c.*, u.login as author_login, u.full_name as author_name
                FROM comments c
                JOIN users u ON c.author_id = u.id
                WHERE c.id = ?
            `;
            
            const result = await DB_connect.make_request(query, [id]);
            const rows = result[0];
            
            if(rows.length === 0) return null;
            
            const comment = new Comment(rows[0]);
            comment.author_login = rows[0].author_login;
            comment.author_name = rows[0].author_name;
            
            return comment;
        } 
        catch(error) 
        {
            throw new Error(`Error finding comment by ID: ${error.message}`);
        }
    }

    static async find_by_post_id(postId, userId = null) 
    {
        try 
        {
            const query = `
                SELECT 
                    c.*, 
                    u.login as author_login, 
                    u.full_name as author_name, 
                    u.profile_picture as author_avatar,
                    (
                        SELECT COUNT(*) 
                        FROM likes l 
                        WHERE l.comment_id = c.id AND l.type = 'like'
                    ) as likes_count,
                    (
                        SELECT COUNT(*) 
                        FROM likes l 
                        WHERE l.comment_id = c.id AND l.type = 'dislike'
                    ) as dislikes_count,
                    EXISTS(
                        SELECT 1 
                        FROM likes l 
                        WHERE l.comment_id = c.id AND l.author_id = ? AND l.type = 'like'
                    ) as liked_by_user,
                    EXISTS(
                        SELECT 1 
                        FROM likes l 
                        WHERE l.comment_id = c.id AND l.author_id = ? AND l.type = 'dislike'
                    ) as disliked_by_user
                FROM comments c
                JOIN users u ON c.author_id = u.id
                WHERE c.post_id = ? AND c.status = 'active'
                ORDER BY c.publish_date ASC
            `;
            
            const userParam = userId || 0;
            const result = await DB_connect.make_request(query, [userParam, userParam, postId]);
            const rows = result[0];
            
            return rows.map(row => {
                const comment = new Comment(row);
                comment.author_login = row.author_login;
                comment.author_name = row.author_name;
                comment.author_avatar = normalize_avatar(row.author_avatar);
                comment.likes_count = Number(row.likes_count || 0);
                comment.dislikes_count = Number(row.dislikes_count || 0);
                const liked_by_user = typeof row.liked_by_user === 'boolean' ? row.liked_by_user : Boolean(row.liked_by_user);
                const disliked_by_user = typeof row.disliked_by_user === 'boolean' ? row.disliked_by_user : Boolean(row.disliked_by_user);
                comment.user_reaction = liked_by_user ? 'like' : (disliked_by_user ? 'dislike' : null);
                return comment;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error finding comments by post ID: ${error.message}`);
        }
    }

    static async find_all() 
    {
        try 
        {
            const query = `
                SELECT c.*, u.login as author_login, u.full_name as author_name, p.title as post_title
                FROM comments c
                JOIN users u ON c.author_id = u.id
                JOIN posts p ON c.post_id = p.id
                ORDER BY c.publish_date DESC
            `;
            
            const result = await DB_connect.make_request(query);
            const rows = result[0];
            
            return rows.map(row => {
                const comment = new Comment(row);
                comment.author_login = row.author_login;
                comment.author_name = row.author_name;
                comment.post_title = row.post_title;
                return comment;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error finding all comments: ${error.message}`);
        }
    }

    static async find_by_author(authorId) 
    {
        try 
        {
            const query = `
                SELECT c.*, u.login as author_login, u.full_name as author_name, p.title as post_title
                FROM comments c
                JOIN users u ON c.author_id = u.id
                JOIN posts p ON c.post_id = p.id
                WHERE c.author_id = ?
                ORDER BY c.publish_date DESC
            `;
            
            const result = await DB_connect.make_request(query, [authorId]);
            const rows = result[0];
            
            return rows.map(row => {
                const comment = new Comment(row);
                comment.author_login = row.author_login;
                comment.author_name = row.author_name;
                comment.post_title = row.post_title;
                return comment;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error finding comments by author: ${error.message}`);
        }
    }

    async update(updateData) 
    {
        try 
        {
            const fields = [];
            const values = [];
            
            Object.keys(updateData).forEach(key => {
                if(updateData[key] !== undefined && key !== 'id') 
                {
                    fields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });
            
            if(fields.length === 0) throw new Error('No fields to update');
            
            values.push(this.id);
            
            const query = `UPDATE comments SET ${fields.join(', ')} WHERE id = ?`;
            await DB_connect.make_request(query, values);
            
            Object.assign(this, updateData);
            
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error updating comment: ${error.message}`);
        }
    }

    async delete() 
    {
        try 
        {
            const query = 'DELETE FROM comments WHERE id = ?';
            await DB_connect.make_request(query, [this.id]);
            
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error deleting comment: ${error.message}`);
        }
    }

    async get_likes_count() 
    {
        try 
        {
            const query = `
                SELECT 
                    SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) as likes,
                    SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END) as dislikes
                FROM likes 
                WHERE comment_id = ?
            `;
            
            const result = await DB_connect.make_request(query, [this.id]);
            const rows = result[0];
            
            return {
                likes: rows[0]?.likes || 0,
                dislikes: rows[0]?.dislikes || 0
            };
        } 
        catch(error) 
        {
            throw new Error(`Error getting comment likes count: ${error.message}`);
        }
    }

    async change_status(status) 
    {
        try 
        {
            if(!['active', 'inactive'].includes(status)) throw new Error('Invalid status. Must be "active" or "inactive"');
            
            await this.update({ status });
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error changing comment status: ${error.message}`);
        }
    }

    async activate() 
    {
        return await this.change_status('active');
    }

    async deactivate() 
    {
        return await this.change_status('inactive');
    }

    belongs_to_user(userId) 
    {
        return this.author_id === userId;
    }

    static async find_by_post_id_with_likes(postId) 
    {
        try 
        {
            const query = `
                SELECT c.*, u.login as author_login, u.full_name as author_name,
                       COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) as likes,
                       COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0) as dislikes
                FROM comments c
                JOIN users u ON c.author_id = u.id
                LEFT JOIN likes l ON c.id = l.comment_id
                WHERE c.post_id = ? AND c.status = 'active'
                GROUP BY c.id
                ORDER BY c.publish_date ASC
            `;
            
            const result = await DB_connect.make_request(query, [postId]);
            const rows = result[0];
            
            return rows.map(row => {
                const comment = new Comment(row);
                comment.author_login = row.author_login;
                comment.author_name = row.author_name;
                comment.likes = row.likes;
                comment.dislikes = row.dislikes;
                return comment;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error finding comments with likes: ${error.message}`);
        }
    }

    async update_status(status) 
    {
        try 
        {
            const query = `UPDATE comments SET status = ? WHERE id = ?`;
            await DB_connect.make_request(query, [status, this.id]);
            this.status = status;
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error updating comment status: ${error.message}`);
        }
    }

    static async get_all_with_details(page = 1, limit = 20, status = 'active') 
    {
        try 
        {
            const offset = (page - 1) * limit;
            
            const query = `
                SELECT 
                    c.*,
                    u.login as author_login,
                    u.full_name as author_name,
                    p.title as post_title,
                    p.id as post_id
                FROM comments c
                JOIN users u ON c.author_id = u.id
                JOIN posts p ON c.post_id = p.id
                WHERE c.status = ?
                ORDER BY c.publish_date DESC
                LIMIT ${parseInt(limit)} OFFSET ${offset}
            `;
            
            const result = await DB_connect.make_request(query, [status]);
            const rows = result[0];
            
            return rows.map(row => ({
                id: row.id,
                content: row.content,
                status: row.status,
                publish_date: row.publish_date,
                author: {
                    id: row.author_id,
                    login: row.author_login,
                    full_name: row.author_name
                },
                post: {
                    id: row.post_id,
                    title: row.post_title
                }
            }));
        } 
        catch(error) 
        {
            throw new Error(`Error getting all comments with details: ${error.message}`);
        }
    }

    static async get_full_comment_data(comment_id) 
    {
        try 
        {
            const query = `
                SELECT 
                    c.id,
                    c.post_id,
                    c.author_id,
                    c.content,
                    c.status,
                    c.publish_date,
                    c.created_at,
                    c.updated_at,
                    u.login as author_login,
                    u.full_name as author_name,
                    p.title as post_title,
                    COALESCE(likes.like_count, 0) as like_count,
                    COALESCE(dislikes.dislike_count, 0) as dislike_count
                FROM comments c
                LEFT JOIN users u ON c.author_id = u.id
                LEFT JOIN posts p ON c.post_id = p.id
                LEFT JOIN (
                    SELECT comment_id, COUNT(*) as like_count 
                    FROM likes 
                    WHERE type = 'like' AND comment_id IS NOT NULL 
                    GROUP BY comment_id
                ) likes ON c.id = likes.comment_id
                LEFT JOIN (
                    SELECT comment_id, COUNT(*) as dislike_count 
                    FROM likes 
                    WHERE type = 'dislike' AND comment_id IS NOT NULL 
                    GROUP BY comment_id
                ) dislikes ON c.id = dislikes.comment_id
                WHERE c.id = ?
            `;
            
            const result = await DB_connect.make_request(query, [comment_id]);
            const rows = result[0];
            
            if(rows.length === 0) return null;
            
            const comment = rows[0];
            return {
                id: comment.id,
                post_id: comment.post_id,
                author_id: comment.author_id,
                content: comment.content,
                status: comment.status,
                publish_date: comment.publish_date,
                created_at: comment.created_at,
                updated_at: comment.updated_at,
                author: 
                {
                    id: comment.author_id,
                    login: comment.author_login,
                    full_name: comment.author_name
                },
                post: 
                {
                    id: comment.post_id,
                    title: comment.post_title
                },
                likes: 
                {
                    like_count: comment.like_count,
                    dislike_count: comment.dislike_count
                }
            };
        } 
        catch(error) 
        {
            throw new Error(`Error getting full comment data: ${error.message}`);
        }
    }

    // Alias method for controller compatibility
    static async get_by_post(post_id, page = 1, limit = 20, userId = null) 
    {
        return await Comment.find_by_post_id(post_id, userId);
    }

    static async ensure_parent_comment_column()
    {
        if(Comment.parent_column_checked)
        {
            return Comment.has_parent_comment_column;
        }

        try
        {
            const result = await DB_connect.make_request("SHOW COLUMNS FROM comments LIKE 'parent_comment_id'");
            const rows = result[0];
            Comment.has_parent_comment_column = rows.length > 0;
        } catch(error)
        {
            console.error('Failed to verify parent_comment_id column:', error.message);
            Comment.has_parent_comment_column = false;
        }

        Comment.parent_column_checked = true;

        return Comment.has_parent_comment_column;
    }
}

Comment.parent_column_checked = false;
Comment.has_parent_comment_column = null;

export default Comment;
