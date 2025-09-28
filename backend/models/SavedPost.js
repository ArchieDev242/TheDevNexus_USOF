import dbConnect from '../utils/dbConnect.js';

class SavedPost 
{
    constructor(savedPostData) 
    {
        this.id = savedPostData?.id;
        this.user_id = savedPostData?.user_id;
        this.post_id = savedPostData?.post_id;
        this.notes = savedPostData?.notes;
        this.saved_at = savedPostData?.saved_at;
    }

    async save() 
    {
        try 
        {
            const query = `
                INSERT INTO saved_posts (user_id, post_id, notes)
                VALUES (?, ?, ?)
            `;
            
            const result = await dbConnect.make_request(query, [
                this.user_id,
                this.post_id,
                this.notes
            ]);
            
            this.id = result[0].insertId;
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error saving post: ${error.message}`);
        }
    }

    async update_notes(notes) 
    {
        try 
        {
            const query = 'UPDATE saved_posts SET notes = ? WHERE id = ?';
            await dbConnect.make_request(query, [notes, this.id]);
            this.notes = notes;
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error updating saved post notes: ${error.message}`);
        }
    }

    async unsave() 
    {
        try 
        {
            const query = 'DELETE FROM saved_posts WHERE id = ?';
            await dbConnect.make_request(query, [this.id]);
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error unsaving post: ${error.message}`);
        }
    }

    static async find_by_user_and_post(userId, postId) 
    {
        try 
        {
            const query = 'SELECT * FROM saved_posts WHERE user_id = ? AND post_id = ?';
            const result = await dbConnect.make_request(query, [userId, postId]);
            const rows = result[0];
            
            return rows.length > 0 ? new SavedPost(rows[0]) : null;
        } 
        catch(error) 
        {
            throw new Error(`Error finding saved post: ${error.message}`);
        }
    }

    static async get_user_saved_posts(userId, page = 1, limit = 20) 
    {
        try 
        {
            const offset = (page - 1) * limit;
            const query = `
                SELECT 
                    sp.*,
                    p.title, p.content, p.status, p.publish_date,
                    u.login as author_login, u.full_name as author_name,
                    COALESCE(likes.like_count, 0) as like_count,
                    COALESCE(dislikes.dislike_count, 0) as dislike_count,
                    COALESCE(comments.comment_count, 0) as comment_count
                FROM saved_posts sp
                JOIN posts p ON sp.post_id = p.id
                JOIN users u ON p.author_id = u.id
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as like_count 
                    FROM likes 
                    WHERE type = 'like' AND post_id IS NOT NULL 
                    GROUP BY post_id
                ) likes ON p.id = likes.post_id
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as dislike_count 
                    FROM likes 
                    WHERE type = 'dislike' AND post_id IS NOT NULL 
                    GROUP BY post_id
                ) dislikes ON p.id = dislikes.post_id
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as comment_count 
                    FROM comments 
                    WHERE status = 'active' 
                    GROUP BY post_id
                ) comments ON p.id = comments.post_id
                WHERE sp.user_id = ?
                ORDER BY sp.saved_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
            
            const result = await dbConnect.make_request(query, [userId]);
            const rows = result[0];
            
            return rows.map(row => ({
                id: row.id,
                post_id: row.post_id,
                notes: row.notes,
                saved_at: row.saved_at,
                post: {
                    id: row.post_id,
                    title: row.title,
                    content: row.content,
                    status: row.status,
                    publish_date: row.publish_date,
                    author: 
                    {
                        login: row.author_login,
                        full_name: row.author_name
                    },
                    stats: 
                    {
                        like_count: row.like_count || 0,
                        dislike_count: row.dislike_count || 0,
                        comment_count: row.comment_count || 0,
                        like_score: (row.like_count || 0) - (row.dislike_count || 0)
                    }
                }
            }));
        } 
        catch(error) 
        {
            throw new Error(`Error getting user saved posts: ${error.message}`);
        }
    }

    static async is_saved_by_user(userId, postId) 
    {
        try 
        {
            const savedPost = await SavedPost.find_by_user_and_post(userId, postId);
            return savedPost !== null;
        } 
        catch(error) 
        {
            throw new Error(`Error checking if post is saved: ${error.message}`);
        }
    }
}

export default SavedPost;
