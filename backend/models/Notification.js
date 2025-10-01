import DB_connect from '../utils/dbConnect.js';
import { v4 as uuidv4 } from 'uuid';

class Notification 
{
    constructor(data = {}) 
    {
        this.id = data.id || null;
        this.user_id = data.user_id || null;
        this.type = data.type || null; // 'like', 'comment', 'reply', 'follow', 'system'
        this.title = data.title || null;
        this.message = data.message || null;
        this.is_read = data.is_read || false;
        this.related_id = data.related_id || null;
        this.related_type = data.related_type || null; // 'post', 'comment', 'user'
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    async save() 
    {
        try 
        {
            const query = `
                INSERT INTO notifications (user_id, type, title, message, is_read, related_id, related_type)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const [result] = await DB_connect.make_request(query, [
                this.user_id,
                this.type,
                this.title,
                this.message,
                this.is_read || false,
                this.related_id,
                this.related_type
            ]);
            
            this.id = result.insertId;
            return this;
        } catch(error) 
        {
            throw new Error(`Error saving notification: ${error.message}`);
        }
    }

    static async get_user_notifications(user_id, limit = 50, offset = 0) 
    {
        try 
        {
            const query = `
                SELECT * FROM notifications 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            `;
            const [rows] = await DB_connect.make_request(query, [user_id, limit, offset]);
            return rows.map(row => new Notification(row));
        } catch(error) 
        {
            throw new Error(`Error getting user notifications: ${error.message}`);
        }
    }

    static async get_unread_notifications(user_id) {
        try 
        {
            const query = `
                SELECT * FROM notifications 
                WHERE user_id = ? AND is_read = FALSE 
                ORDER BY created_at DESC
            `;
            const [rows] = await DB_connect.make_request(query, [user_id]);
            return rows.map(row => new Notification(row));
        } catch(error) 
        {
            throw new Error(`Error getting unread notifications: ${error.message}`);
        }
    }

    static async get_unread_count(user_id) {
        try 
        {
            const query = `
                SELECT COUNT(*) as count 
                FROM notifications 
                WHERE user_id = ? AND is_read = FALSE
            `;
            const [rows] = await DB_connect.make_request(query, [user_id]);
            return rows[0].count || 0;
        } catch(error) 
        {
            throw new Error(`Error getting unread count: ${error.message}`);
        }
    }

    async mark_as_read() 
    {
        try {
            const query = `
                UPDATE notifications 
                SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `;
            await DB_connect.make_request(query, [this.id]);
            this.is_read = true;
            return this;
        } catch(error) 
        {
            throw new Error(`Error marking notification as read: ${error.message}`);
        }
    }

    static async mark_all_as_read(user_id) 
    {
        try 
        {
            const query = `
                UPDATE notifications 
                SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP 
                WHERE user_id = ? AND is_read = FALSE
            `;
            const [result] = await DB_connect.make_request(query, [user_id]);
            return result.affectedRows;
        } catch(error) 
        {
            throw new Error(`Error marking all notifications as read: ${error.message}`);
        }
    }

    static async find_by_id(id) 
    {
        try 
        {
            const query = `SELECT * FROM notifications WHERE id = ?`;
            const [rows] = await DB_connect.make_request(query, [id]);
            return rows.length > 0 ? new Notification(rows[0]) : null;
        } catch(error) 
        {
            throw new Error(`Error finding notification: ${error.message}`);
        }
    }

    async delete() 
    {
        try 
        {
            const query = `DELETE FROM notifications WHERE id = ?`;
            await DB_connect.make_request(query, [this.id]);
            return true;
        } catch(error) 
        {
            throw new Error(`Error deleting notification: ${error.message}`);
        }
    }

    static async cleanup_old_notifications() 
    {
        try 
        {
            const query = `
                DELETE FROM notifications 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
            `;
            const [result] = await DB_connect.make_request(query);
            return result.affectedRows;
        } catch(error) 
        {
            throw new Error(`Error cleaning up old notifications: ${error.message}`);
        }
    }

    static async get_notifications_with_details(user_id, limit = 50, offset = 0) 
    {
        try 
        {
            const query = `
                SELECT 
                    n.*,
                    CASE 
                        WHEN n.related_type = 'post' THEN p.title 
                        WHEN n.related_type = 'comment' THEN CONCAT('Comment on: ', pc.title)
                        WHEN n.related_type = 'user' THEN u.login
                        ELSE NULL 
                    END as related_title,
                    CASE 
                        WHEN n.related_type = 'user' THEN u.profile_picture
                        ELSE NULL 
                    END as related_avatar
                FROM notifications n
                LEFT JOIN posts p ON n.related_type = 'post' AND n.related_id = p.id
                LEFT JOIN comments c ON n.related_type = 'comment' AND n.related_id = c.id
                LEFT JOIN posts pc ON c.post_id = pc.id
                LEFT JOIN users u ON n.related_type = 'user' AND n.related_id = u.id
                WHERE n.user_id = ?
                ORDER BY n.created_at DESC
                LIMIT ? OFFSET ?
            `;
            const [rows] = await DB_connect.make_request(query, [user_id, limit, offset]);
            return rows;
        } catch(error) 
        {
            throw new Error(`Error getting notifications with details: ${error.message}`);
        }
    }
}

export default Notification;
