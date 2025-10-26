import React, { useEffect, useState } from 'react';
import { FiBell, FiX, FiTrash2 } from 'react-icons/fi';
import '../style/notification-dropdown.css';

const NotificationDropdown = ({ isOpen, onClose, onUnreadChange }) => {
    const [notifications, set_notifications] = useState([]);
    const [loading, set_loading] = useState(false);
    const [unread_count, set_unread_count] = useState(0);

    useEffect(() => {
        if(isOpen) fetch_notifications();
    }, [isOpen]);

    const fetch_notifications = async () => {
        try 
        {
            set_loading(true);
            const res = await fetch('/api/notifications?limit=10', {
                credentials: 'include'
            });
            if(res.ok) 
                {
                const data = await res.json();

                if(data.status === 'success') 
                    {
                    const notifications = data.data?.notifications || [];
                    const unread = data.data?.unread_count || 0;
                    set_notifications(notifications);
                    set_unread_count(unread);
                    if(typeof onUnreadChange === 'function') onUnreadChange(unread);
                } else 
                    {
                    set_notifications([]);
                    set_unread_count(0);
                    if(typeof onUnreadChange === 'function') onUnreadChange(0);
                }
            } else 
                {
                set_notifications([]);
                set_unread_count(0);
                if(typeof onUnreadChange === 'function') onUnreadChange(0);
            }
        } catch(error) 
        {
            console.error('Error fetching notifications:', error);
            set_notifications([]);
            set_unread_count(0);
            if(typeof onUnreadChange === 'function') onUnreadChange(0);
        } finally 
        {
            set_loading(false);
        }
    };

    const handle_mark_as_read = async (notificationId) => {
        try 
        {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                credentials: 'include'
            });
            fetch_notifications();
        } catch(error) 
        {
            console.error('Error marking notification as read:', error);
        }
    };

    const handle_delete = async (notificationId) => {
        try 
        {
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            fetch_notifications();
        } catch(error) 
        {
            console.error('Error deleting notification:', error);
        }
    };

    const get_notification_icon = (notification) => {
        if(notification.notification_icon) 
            {
            return (
                <img 
                    src = {notification.notification_icon}
                    alt = {notification.title || 'Notification icon'}
                />
            );
        }

        switch(notification.type) 
        {
            case 'system':
                return '🏆';
            case 'comment':
                return '💬';
            case 'like':
                return '❤️';
            case 'reply':
                return '↩️';
            case 'report':
                return '🚨';
            default:
                return '📢';
        }
    };

    if(!isOpen) return null;

    return (
        <div className = "notification-dropdown-overlay" onClick = {onClose}>
            <div className = "notification-dropdown" onClick = {e => e.stopPropagation()}>
                <div className = "notification-header">
                    <h3>Сповіщення {unread_count > 0 && <span className = "unread-badge">{unread_count}</span>}</h3>
                    <button className = "close-btn" onClick = {onClose}>
                        <FiX />
                    </button>
                </div>

                <div className = "notification-list">
                    {loading ? (
                        <div className = "notification-loading">Завантаження...</div>
                    ) : notifications.length === 0 ? (
                        <div className = "notification-empty">
                            <FiBell size = {32} />
                            <p>Немає сповіщень</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div
                                key = {notification.id}
                                className = {`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                            >
                                <div className = "notification-icon">
                                    {get_notification_icon(notification)}
                                </div>
                                <div className = "notification-content">
                                    <h4>{notification.title}</h4>
                                    <p>{notification.message}</p>
                                    <span className = "notification-time">
                                        {new Date(notification.created_at).toLocaleDateString('uk-UA')}
                                    </span>
                                </div>
                                <div className = "notification-actions">
                                    {!notification.is_read && (
                                        <button
                                            className = "action-btn"
                                            onClick = {() => handle_mark_as_read(notification.id)}
                                            title = "Позначити як прочитано"
                                        >
                                            ✓
                                        </button>
                                    )}
                                    <button
                                        className = "action-btn delete"
                                        onClick = {() => handle_delete(notification.id)}
                                        title = "Видалити"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationDropdown;