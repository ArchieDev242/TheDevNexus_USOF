const database = require('./database');
const Permission = require('./Permission');

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
            
            const result = await database.query(query, [
                this.title,
                this.description
            ]);
            
            this.id = result.insertId;
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
            const rows = await database.query(query, [id]);
            
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
            const rows = await database.query(query);
            
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
            const rows = await database.query(query, [title]);
            
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
            await database.query(query, values);
            
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
            await database.query(query, [this.id]);
            
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error deleting category: ${error.message}`);
        }
    }

    async get_posts_count() 
    {
        try 
        {
            const query = `
                SELECT COUNT(*) as count 
                FROM post_categories pc
                JOIN posts p ON pc.post_id = p.id
                WHERE pc.category_id = ? AND p.status = 'active'
            `;
            
            const rows = await database.query(query, [this.id]);
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
            
            const rows = await database.query(query);
            
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
            
            const searchPattern = `%${searchTerm}%`;
            const rows = await database.query(query, [searchPattern, searchPattern]);
            
            return rows.map(row => new Category(row));
        } 
        catch(error) 
        {
            throw new Error(`Error searching categories: ${error.message}`);
        }
    }
}

module.exports = Category;
