import DB_connect from '../utils/dbConnect.js';
import MailService from './MailService.js';
import User from '../models/User.js';

class notification_service 
{
    static NOTIFICATION_TYPES = {
        COMMENT_ADDED: 'comment_added',
        POST_LIKED: 'post_liked',
        COMMENT_LIKED: 'comment_liked',
        POST_SHARED: 'post_shared',
        USER_FOLLOWED: 'user_followed',
        SYSTEM_ANNOUNCEMENT: 'system_announcement'
    };

    static async create_notification(data) 
    {
        try 
        {
            const {
                userId,
                type,
                title,
                message,
                relatedEntityType = null, // 'post', 'comment', 'user', 'achievement'
                relatedEntityId = null,
                actionUserId = null
            } = data;

            const query = `
                INSERT INTO notifications 
                (user_id, type, title, message, related_type, related_id, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            `;

            const result = await DB_connect.make_request(query, [
                userId, type, title, message, 
                relatedEntityType, relatedEntityId
            ]);

            return {
                success: true,
                notificationId: result[0].insertId
            };
        } 
        catch(error) 
        {
            console.error('Failed to create notification:', error.message);
            return { success: false, error: error.message };
        }
    }

    static async get_user_notifications(userId, options = {}) 
    {
        try 
        {
            const { 
                limit = 20, 
                offset = 0, 
                unreadOnly = false 
            } = options;

            let query = `
                SELECT 
                    n.*,
                    u.login as action_user_login,
                    u.full_name as action_user_name
                FROM notifications n
                LEFT JOIN users u ON n.action_user_id = u.id
                WHERE n.user_id = ?
            `;

            const params = [userId];

            if(unreadOnly) query += ' AND n.is_read = FALSE';

            query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const result = await DB_connect.make_request(query, params);
            const notifications = result[0];

            return {
                success: true,
                notifications: notifications,
                totalCount: notifications.length
            };
        } 
        catch(error) 
        {
            return { success: false, error: error.message };
        }
    }

    static async mark_as_read(notificationIds) 
    {
        try 
        {
            if(!Array.isArray(notificationIds)) notificationIds = [notificationIds];

            const placeholders = notificationIds.map(() => '?').join(',');
            const query = `UPDATE notifications SET is_read = TRUE WHERE id IN (${placeholders})`;

            await DB_connect.make_request(query, notificationIds);

            return { success: true };
        } 
        catch(error) 
        {
            return { success: false, error: error.message };
        }
    }

    static async cleanup_old_notifications(daysOld = 30) 
    {
        try 
        {
            const query = `
                DELETE FROM notifications 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
            `;

            const result = await DB_connect.make_request(query, [daysOld]);

            return {
                success: true,
                deletedCount: result[0].affectedRows
            };
        } 
        catch(error) 
        {
            return { success: false, error: error.message };
        }
    }

    static async notify_new_comment(postAuthorId, commenterInfo, postInfo, commentContent) 
    {
        if(postAuthorId === commenterInfo.id) return;

        const title = 'Новий коментар до вашого поста';
        const message = `${commenterInfo.full_name} прокоментував ваш пост "${postInfo.title}"`;

        const notification = await this.create_notification({
            userId: postAuthorId,
            type: this.NOTIFICATION_TYPES.COMMENT_ADDED,
            title: title,
            message: message,
            relatedEntityType: 'post',
            relatedEntityId: postInfo.id,
            actionUserId: commenterInfo.id
        });

        if(postInfo.authorEmail && postInfo.emailNotifications) 
            {
            await MailService.sendNewCommentNotification(
                postInfo.authorEmail,
                postInfo.authorName,
                commenterInfo.full_name,
                postInfo.title,
                commentContent
            );
        }

        return notification;
    }

    static async notify_post_liked(postAuthorId, likerInfo, postInfo) 
    {
        if(postAuthorId === likerInfo.id) return;

        const title = 'Ваш пост сподобався!';
        const message = `${likerInfo.full_name} поставив лайк вашому посту "${postInfo.title}"`;

        const notification = await this.create_notification({
            userId: postAuthorId,
            type: this.NOTIFICATION_TYPES.POST_LIKED,
            title: title,
            message: message,
            relatedEntityType: 'post',
            relatedEntityId: postInfo.id,
            actionUserId: likerInfo.id
        });

        if(postInfo.authorEmail && postInfo.emailNotifications) 
            {
            await MailService.sendPostLikedNotification(
                postInfo.authorEmail,
                postInfo.authorName,
                likerInfo.full_name,
                postInfo.title
            );
        }

        return notification;
    }

    static async notify_comment_liked(commentAuthorId, likerInfo, commentInfo) 
    {
        if(commentAuthorId === likerInfo.id) return;

        const title = 'Ваш коментар сподобався!';
        const message = `${likerInfo.full_name} поставив лайк вашому коментарю`;

        return await this.create_notification({
            userId: commentAuthorId,
            type: this.NOTIFICATION_TYPES.COMMENT_LIKED,
            title: title,
            message: message,
            relatedEntityType: 'comment',
            relatedEntityId: commentInfo.id,
            actionUserId: likerInfo.id
        });
    }

    static async send_sys_announcement(title, message, targetRole = null) 
    {
        try 
        {
            let query = 'SELECT id FROM users WHERE status = "active"';
            const params = [];

            if(targetRole) 
                {
                query += ' AND role = ?';
                params.push(targetRole);
            }

            const result = await DB_connect.make_request(query, params);
            const users = result[0];

            const notifications = [];
            for(const user of users) 
                {
                const notification = await this.create_notification({
                    userId: user.id,
                    type: this.NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
                    title: title,
                    message: message
                });
                notifications.push(notification);
            }

            return {
                success: true,
                sentCount: notifications.length
            };
        } 
        catch(error) 
        {
            return { success: false, error: error.message };
        }
    }

    static async get_unread_count(userId) 
    {
        try 
        {
            const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE';
            const result = await DB_connect.make_request(query, [userId]);
            
            return {
                success: true,
                count: result[0][0].count
            };
        } 
        catch(error) 
        {
            return { success: false, error: error.message, count: 0 };
        }
    }

    static async notify_admins_about_report({ reportId, reportedType, reportedId, reason, reporter }) 
    {
        try 
        {
            const admins = await User.find_by_role('admin');
            if(!admins || admins.length === 0) return;

            const reporter_display = reporter?.full_name || reporter?.login || `User #${reporter?.id ?? ''}`;
            const title = 'Новий репорт на модерацію';
            const message = `${reporter_display} пожалівся на ${reportedType} #${reportedId}. Причина: ${reason}`;

            await Promise.all(
                admins
                    .filter(admin => admin.id !== reporter?.id)
                    .map(admin => this.create_notification({
                        userId: admin.id,
                        type: 'report',
                        title,
                        message,
                        relatedEntityType: 'report',
                        relatedEntityId: reportId
                    }))
            );
        } catch(error) 
        {
            console.error('Failed to notify admins about report:', error.message);
        }
    }
}

export default notification_service;
