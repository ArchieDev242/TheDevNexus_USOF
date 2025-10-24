import DB_connect from '../utils/dbConnect.js';
import Permission from './Permission.js';

class Category 
{
    constructor(categoryData) 
    {
        this.id = categoryData?.id;
        this.title = categoryData?.title;
        this.description = categoryData?.description;
        this.created_at = categoryData?.created_at;
    }

    async create() 
    {
        try 
        {
            const query = `
                INSERT INTO categories (title, description)
                VALUES (?, ?)
            `;
            
            const result = await DB_connect.make_request(query, [
                this.title,
                this.description
            ]);
            
            this.id = result[0].insertId;
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error creating category: ${error.message}`);
        }
    }

    static async find_by_id(id) 
    {
        try 
        {
            const query = 'SELECT * FROM categories WHERE id = ?';
            const result = await DB_connect.make_request(query, [id]);
            const rows = result[0];
            
            if(rows.length === 0) return null;
            
            return new Category(rows[0]);
        } 
        catch(error) 
        {
            throw new Error(`Error finding category by ID: ${error.message}`);
        }
    }

    static async find_all() 
    {
        try 
        {
            const query = 'SELECT * FROM categories ORDER BY title ASC';
            const result = await DB_connect.make_request(query);
            const rows = result[0];
            
            return rows.map(row => new Category(row));
        } 
        catch(error) 
        {
            throw new Error(`Error finding all categories: ${error.message}`);
        }
    }

    static async find_by_title(title) 
    {
        try 
        {
            const query = 'SELECT * FROM categories WHERE title = ?';
            const result = await DB_connect.make_request(query, [title]);
            const rows = result[0];
            
            if(rows.length === 0) return null;
            
            return new Category(rows[0]);
        } 
        catch(error) 
        {
            throw new Error(`Error finding category by title: ${error.message}`);
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
            
            const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
            await DB_connect.make_request(query, values);
            
            Object.assign(this, updateData);
            
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error updating category: ${error.message}`);
        }
    }

    async delete() 
    {
        try 
        {
            const query = 'DELETE FROM categories WHERE id = ?';
            await DB_connect.make_request(query, [this.id]);
            
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error deleting category: ${error.message}`);
        }
    }

    static async get_posts_count(category_id) 
    {
        try 
        {
            const query = `
                SELECT COUNT(*) as count 
                FROM post_categories pc
                JOIN posts p ON pc.post_id = p.id
                WHERE pc.category_id = ? AND p.status = 'active'
            `;
            
            const result = await DB_connect.make_request(query, [category_id]);
            const rows = result[0];
            return rows[0].count;
        } 
        catch(error) 
        {
            throw new Error(`Error getting posts count for category: ${error.message}`);
        }
    }

    static async get_categories_with_posts_count() 
    {
        try 
        {
            const query = `
                SELECT c.*, COUNT(pc.post_id) as posts_count
                FROM categories c
                LEFT JOIN post_categories pc ON c.id = pc.category_id
                LEFT JOIN posts p ON pc.post_id = p.id AND p.status = 'active'
                GROUP BY c.id
                ORDER BY c.title ASC
            `;
            
            const result = await DB_connect.make_request(query);
            const rows = result[0];
            
            return rows.map(row => {
                const category = new Category(row);
                category.posts_count = row.posts_count;
                return category;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error getting categories with posts count: ${error.message}`);
        }
    }

    static async get_all_with_stats() 
    {
        try 
        {
            const query = `
                SELECT c.*, 
                       COUNT(DISTINCT p.id) as posts_count,
                       COUNT(DISTINCT com.id) as comments_count,
                       COALESCE(SUM(DISTINCT likes.likes_count), 0) as total_likes
                FROM categories c
                LEFT JOIN post_categories pc ON c.id = pc.category_id
                LEFT JOIN posts p ON pc.post_id = p.id AND p.status = 'active'
                LEFT JOIN comments com ON p.id = com.post_id AND com.status = 'active'
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as likes_count
                    FROM likes 
                    WHERE type = 'like'
                    GROUP BY post_id
                ) likes ON p.id = likes.post_id
                GROUP BY c.id, c.title, c.description, c.created_at
                ORDER BY c.title ASC
            `;
            
            const result = await DB_connect.make_request(query);
            const rows = result[0];
            
            return rows.map(row => {
                const category = new Category(row);
                category.posts_count = parseInt(row.posts_count) || 0;
                category.comments_count = parseInt(row.comments_count) || 0;
                category.total_likes = parseInt(row.total_likes) || 0;
                return category;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error getting categories with stats: ${error.message}`);
        }
    }

    static async get_with_stats(id) 
    {
        try 
        {
            const query = `
                SELECT c.*, 
                       COUNT(DISTINCT p.id) as posts_count,
                       COUNT(DISTINCT com.id) as comments_count,
                       COALESCE(SUM(DISTINCT likes.likes_count), 0) as total_likes
                FROM categories c
                LEFT JOIN post_categories pc ON c.id = pc.category_id
                LEFT JOIN posts p ON pc.post_id = p.id AND p.status = 'active'
                LEFT JOIN comments com ON p.id = com.post_id AND com.status = 'active'
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as likes_count
                    FROM likes 
                    WHERE type = 'like'
                    GROUP BY post_id
                ) likes ON p.id = likes.post_id
                WHERE c.id = ?
                GROUP BY c.id, c.title, c.description, c.created_at
            `;
            
            const result = await DB_connect.make_request(query, [id]);
            const rows = result[0];
            
            if(rows.length === 0) return null;
            
            const row = rows[0];
            const category = new Category(row);
            category.posts_count = parseInt(row.posts_count) || 0;
            category.comments_count = parseInt(row.comments_count) || 0;
            category.total_likes = parseInt(row.total_likes) || 0;
            
            return category;
        } 
        catch(error) 
        {
            throw new Error(`Error getting category with stats: ${error.message}`);
        }
    }

    static async get_total_active_posts() {
        try {
            const query = `SELECT COUNT(*) as total FROM posts WHERE status = 'active'`;
            const result = await DB_connect.make_request(query);
            const rows = result[0];
            return rows[0]?.total || 0;
        } catch(error) {
            throw new Error(`Error getting total active posts: ${error.message}`);
        }
    }

    static async can_view(user) 
    {
        try 
        {
            return await Permission.check_user_permission(user, Permission.PERMISSIONS.READ_CATEGORIES);
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

            return await Permission.check_user_permission(user, Permission.PERMISSIONS.CREATE_CATEGORIES);
        } 
        catch(error) 
        {
            throw new Error(`Error checking create permission: ${error.message}`);
        }
    }

    static async can_edit(user) 
    {
        try 
        {
            if(!user) return false;

            return await Permission.check_user_permission(user, Permission.PERMISSIONS.EDIT_CATEGORIES);
        } 
        catch(error) 
        {
            throw new Error(`Error checking edit permission: ${error.message}`);
        }
    }

    static async can_delete(user) 
    {
        try 
        {
            if(!user) return false;
            
            return await Permission.check_user_permission(user, Permission.PERMISSIONS.DELETE_CATEGORIES);
        } 
        catch(error) 
        {
            throw new Error(`Error checking delete permission: ${error.message}`);
        }
    }

    static async search(searchTerm) 
    {
        try 
        {
            const query = `
                SELECT * FROM categories 
                WHERE title LIKE ? OR description LIKE ?
                ORDER BY title ASC
            `;
            
            const search_pattern = `%${searchTerm}%`;
            const result = await DB_connect.make_request(query, [search_pattern, search_pattern]);
            const rows = result[0];
            
            return rows.map(row => new Category(row));
        } 
        catch(error) 
        {
            throw new Error(`Error searching categories: ${error.message}`);
        }
    }

    // Отримати статистику для адмін панелі
    static async get_admin_stats() 
    {
        try 
        {
            const query = `
                SELECT 
                    COUNT(*) as total_categories,
                    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_this_week,
                    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_this_month
                FROM categories
            `;
            
            const result = await DB_connect.make_request(query);
            const rows = result[0];
            const stats = rows[0];
            
            return {
                total_categories: parseInt(stats.total_categories),
                new_this_week: parseInt(stats.new_this_week), 
                new_this_month: parseInt(stats.new_this_month)
            };
        } 
        catch(error) 
        {
            throw new Error(`Error getting admin stats: ${error.message}`);
        }
    }
}

export default Category;
