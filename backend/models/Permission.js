import DB_connect from '../utils/dbConnect.js';

class Permission 
{
    constructor(permissionData) 
    {
        this.id = permissionData?.id;
        this.role_type = permissionData?.role_type;
        this.permission = permissionData?.permission;
    }

    static async get_permissions_for_role(roleType) 
    {
        try 
        {
            const query = 'SELECT permission FROM role_permissions WHERE role_type = ?';
            const result = await DB_connect.make_request(query, [roleType]);
            const rows = result[0];
            
            return rows.map(row => row.permission);
        } 
        catch(error) 
        {
            throw new Error(`Error getting permissions for role: ${error.message}`);
        }
    }

    static async has_permission(roleType, permission) 
    {
        try 
        {
            const query = 'SELECT COUNT(*) as count FROM role_permissions WHERE role_type = ? AND permission = ?';
            const result = await DB_connect.make_request(query, [roleType, permission]);
            const rows = result[0];
            
            return rows[0].count > 0;
        } 
        catch(error) 
        {
            throw new Error(`Error checking permission: ${error.message}`);
        }
    }

    static async check_user_permission(user, permission) 
    {
        try 
        {
            const role_type = user ? user.role : 'guest';
            return await this.has_permission(role_type, permission);
        } 
        catch(error) 
        {
            throw new Error(`Error checking user permission: ${error.message}`);
        }
    }

    static async add_permission(roleType, permission) 
    {
        try 
        {
            const query = 'INSERT INTO role_permissions (role_type, permission) VALUES (?, ?)';
            await DB_connect.make_request(query, [roleType, permission]);
            
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error adding permission: ${error.message}`);
        }
    }

    static async remove_permission(roleType, permission) 
    {
        try 
        {
            const query = 'DELETE FROM role_permissions WHERE role_type = ? AND permission = ?';
            await DB_connect.make_request(query, [roleType, permission]);
            
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error removing permission: ${error.message}`);
        }
    }

    static async get_all_permissions() 
    {
        try 
        {
            const query = 'SELECT * FROM role_permissions ORDER BY role_type, permission';
            const result = await DB_connect.make_request(query);
            const rows = result[0];
            
            return rows.map(row => new Permission(row));
        } 
        catch(error) 
        {
            throw new Error(`Error getting all permissions: ${error.message}`);
        }
    }

    static async get_permissions_by_role() 
    {
        try 
        {
            const permissions = await this.get_all_permissions();
            const grouped = {};
            
            permissions.forEach(perm => {
                if(!grouped[perm.role_type]) grouped[perm.role_type] = [];

                grouped[perm.role_type].push(perm.permission);
            });
            
            return grouped;
        } 
        catch(error) 
        {
            throw new Error(`Error grouping permissions by role: ${error.message}`);
        }
    }

    static get PERMISSIONS() 
    {
        return {
            READ_POSTS: 'read_posts',
            READ_COMMENTS: 'read_comments',
            READ_CATEGORIES: 'read_categories',
            VIEW_USER_PROFILES: 'view_user_profiles',
            
            CREATE_POSTS: 'create_posts',
            CREATE_COMMENTS: 'create_comments',
            CREATE_CATEGORIES: 'create_categories',
            
            EDIT_OWN_POSTS: 'edit_own_posts',
            EDIT_OWN_COMMENTS: 'edit_own_comments',
            
            EDIT_ANY_POSTS: 'edit_any_posts',
            EDIT_ANY_COMMENTS: 'edit_any_comments',
            EDIT_CATEGORIES: 'edit_categories',
            
            DELETE_OWN_POSTS: 'delete_own_posts',
            DELETE_OWN_COMMENTS: 'delete_own_comments',
            
            DELETE_ANY_POSTS: 'delete_any_posts',
            DELETE_ANY_COMMENTS: 'delete_any_comments',
            DELETE_CATEGORIES: 'delete_categories',
            
            LIKE_POSTS: 'like_posts',
            LIKE_COMMENTS: 'like_comments',
            
            UPLOAD_AVATAR: 'upload_avatar',
            MANAGE_USERS: 'manage_users',
            CHANGE_USER_ROLES: 'change_user_roles',
            VIEW_ANALYTICS: 'view_analytics'
        };
    }

    static get ROLES() 
    {
        return {
            GUEST: 'guest',
            USER: 'user',
            ADMIN: 'admin'
        };
    }
}

export default Permission;
