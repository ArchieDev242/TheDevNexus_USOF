import Notification from '../models/Notification.js';
import { send_response, send_error } from '../utils/responseHandler.js';

class notifications_controller 
{
    static async get_notifications(req, res) 
    {
        try 
        {
            const user_id = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            const notifications = await Notification.get_notifications_with_details(user_id, limit, offset);
            const unread_count = await Notification.get_unread_count(user_id);

            return send_response(res, 200, 'Notifications retrieved successfully', {
                notifications,
                unread_count,
                pagination: 
                {
                    page,
                    limit,
                    has_more: notifications.length === limit
                }
            });
        } catch(error) 
        {
            return send_error(res, 500, 'Error retrieving notifications', error.message);
        }
    }

    static async get_unread_notifications(req, res) 
    {
        try 
        {
            const user_id = req.user.id;
            const notifications = await Notification.get_unread_notifications(user_id);
            const unread_count = notifications.length;

            return send_response(res, 200, 'Unread notifications retrieved successfully', {
                notifications,
                unread_count
            });
        } catch(error) 
        {
            return send_error(res, 500, 'Error retrieving unread notifications', error.message);
        }
    }

    static async get_unread_count(req, res) 
    {
        try 
        {
            const user_id = req.user.id;
            const unread_count = await Notification.get_unread_count(user_id);

            return send_response(res, 200, 'Unread count retrieved successfully', {
                unread_count
            });
        } catch(error) 
        {
            return send_error(res, 500, 'Error retrieving unread count', error.message);
        }
    }

    static async mark_notification_read(req, res) 
    {
        try 
        {
            const notification_id = req.params.id;
            const user_id = req.user.id;

            const notification = await Notification.find_by_id(notification_id);
            if(!notification) return send_error(res, 404, 'Notification not found');

            if(notification.user_id !== user_id) return send_error(res, 403, 'Access denied');

            await notification.mark_as_read();
            const unread_count = await Notification.get_unread_count(user_id);

            return send_response(res, 200, 'Notification marked as read', {
                notification,
                unread_count
            });
        } catch(error) 
        {
            return send_error(res, 500, 'Error marking notification as read', error.message);
        }
    }

    static async mark_all_read(req, res) 
    {
        try 
        {
            const user_id = req.user.id;
            const affected_rows = await Notification.mark_all_as_read(user_id);

            return send_response(res, 200, 'All notifications marked as read', {
                marked_count: affected_rows
            });
        } catch(error) 
        {
            return send_error(res, 500, 'Error marking all notifications as read', error.message);
        }
    }

    static async delete_notification(req, res) 
    {
        try 
        {
            const notification_id = req.params.id;
            const user_id = req.user.id;

            const notification = await Notification.find_by_id(notification_id);
            if(!notification) return send_error(res, 404, 'Notification not found');

            if(notification.user_id !== user_id) return send_error(res, 403, 'Access denied');

            await notification.delete();
            const unread_count = await Notification.get_unread_count(user_id);

            return send_response(res, 200, 'Notification deleted successfully', {
                unread_count
            });
        } catch(error) 
        {
            return send_error(res, 500, 'Error deleting notification', error.message);
        }
    }

    static async delete_read_notifications(req, res) 
    {
        try 
        {
            const user_id = req.user.id;
            
            const notifications = await Notification.get_user_notifications(user_id, 1000, 0);
            const read_notifications = notifications.filter(n => n.is_read);
            
            let deleted_count = 0;
            for(const notification of read_notifications) 
                {
                await notification.delete();
                deleted_count++;
            }

            const unread_count = await Notification.get_unread_count(user_id);

            return send_response(res, 200, 'Read notifications deleted successfully', {
                deleted_count,
                unread_count
            });
        } catch(error) 
        {
            return send_error(res, 500, 'Error deleting read notifications', error.message);
        }
    }

    static async cleanup_old_notifications(req, res) 
    {
        try 
        {
            if(req.user.role !== 'admin') return send_error(res, 403, 'Admin access required');

            const deleted_count = await Notification.cleanup_old_notifications();

            return send_response(res, 200, 'Old notifications cleaned up successfully', {
                deleted_count
            });
        } catch(error) 
        {
            return send_error(res, 500, 'Error cleaning up old notifications', error.message);
        }
    }
}

export default notifications_controller;
