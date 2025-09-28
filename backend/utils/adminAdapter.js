import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Category from '../models/Category.js';
import dbConnect from './dbConnect.js';

class AdminAdapter 
{
    constructor(model) 
    {
        this.model = model;
        this.modelName = model.name;
    }

    async find(filter = {}, { limit = 20, offset = 0, sort = {} } = {}) 
    {
        try 
        {
            let query = `SELECT * FROM ${this.get_table_name()}`;
            const params = [];
            
            // filters
            if(Object.keys(filter).length > 0) 
                {
                const conditions = Object.entries(filter).map(([key, value]) => {
                    params.push(value);
                    return `${key} = ?`;
                });
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            
            // sorting
            if(Object.keys(sort).length > 0) 
                {
                const sort_conds = Object.entries(sort).map(([key, direction]) => {
                    return `${key} ${direction === 'desc' ? 'DESC' : 'ASC'}`;
                });
                query += ` ORDER BY ${sort_conds.join(', ')}`;
            }
            
            // limit and offset
            query += ` LIMIT ? OFFSET ?`;
            params.push(limit, offset);
            
            const [rows] = await dbConnect.make_request(query, params);
            return rows;
        } catch(error) 
        {
            console.error(`Error finding ${this.modelName}:`, error);
            return [];
        }
    }

    async find_one(id) 
    {
        try 
        {
            switch(this.modelName) 
            {
                case 'User': return await User.find_by_id(id);
                case 'Post': return await Post.find_by_id(id);
                case 'Comment': return await Comment.find_by_id(id);
                case 'Category': return await Category.find_by_id(id);
                case 'Like': return await Like.find_by_id(id);
                default: return null;
            }
        } catch(error) 
        {
            console.error(`Error finding ${this.modelName} by id:`, error);
            return null;
        }
    }

    async count(filter = {}) 
    {
        try 
        {
            let query = `SELECT COUNT(*) as count FROM ${this.get_table_name()}`;
            const params = [];
            
            if(Object.keys(filter).length > 0) 
                {
                const conditions = Object.entries(filter).map(([key, value]) => {
                    params.push(value);
                    return `${key} = ?`;
                });
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            
            const [rows] = await dbConnect.make_request(query, params);
            return rows[0]?.count || 0;
        } catch(error) 
        {
            console.error(`Error counting ${this.modelName}:`, error);
            return 0;
        }
    }

    async create(payload) 
    {
        try 
        {
            console.log(`Creating ${this.modelName} with payload:`, payload);
            
            switch(this.modelName) 
            {
                case 'User': 
                    const user = new User(payload);
                    const userResult = await user.create();
                    return userResult.user;
                    
                case 'Category':
                    if (!Category.create_category) {
                        // Fallback до прямого SQL запиту
                        const query = `INSERT INTO categories (title, description) VALUES (?, ?)`;
                        const [categoryResult] = await dbConnect.make_request(query, [payload.title, payload.description]);
                        return await Category.find_by_id(categoryResult.insertId);
                    }
                    return await Category.create_category(payload);
                    
                default: 
                    // Загальний метод створення для інших моделей
                    const fields = Object.keys(payload);
                    const values = Object.values(payload);
                    const placeholders = fields.map(() => '?').join(', ');
                    
                    const insertQuery = `INSERT INTO ${this.get_table_name()} (${fields.join(', ')}) VALUES (${placeholders})`;
                    const [insertResult] = await dbConnect.make_request(insertQuery, values);
                    
                    return await this.find_one(insertResult.insertId);
            }
        } catch(error) 
        {
            console.error(`Error creating ${this.modelName}:`, error);
            throw error;
        }
    }

    async update(id, payload) 
    {
        try 
        {
            // Видаляємо системні поля, які не можна оновлювати напряму
            const { created_at, updated_at, ...updateData } = payload;
            
            if (Object.keys(updateData).length === 0) {
                console.log('No fields to update');
                return await this.find_one(id);
            }

            // Спеціальна обробка для користувачів
            if (this.modelName === 'User') {
                const user = await User.find_by_id(id);
                if (!user) throw new Error('User not found');
                
                // Хешуємо пароль, якщо він оновлюється
                if (updateData.password) {
                    const bcrypt = await import('bcrypt');
                    updateData.password = await bcrypt.hash(updateData.password, 10);
                }
                
                const result = await user.update(updateData);
                console.log('User updated successfully:', result.id);
                return result;
            }
            
            // Загальне оновлення для інших моделей
            const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(updateData), id];
            
            const query = `UPDATE ${this.get_table_name()} SET ${fields} WHERE id = ?`;
            const result = await dbConnect.make_request(query, values);
            
            console.log(`${this.modelName} updated successfully:`, result);
            return await this.find_one(id);
        } catch(error) 
        {
            console.error(`Error updating ${this.modelName}:`, error.message);
            throw error;
        }
    }

    async delete(id) 
    {
        try 
        {
            const query = `DELETE FROM ${this.get_table_name()} WHERE id = ?`;
            await dbConnect.make_request(query, [id]);
            return true;
        } catch(error) 
        {
            console.error(`Error deleting ${this.modelName}:`, error);
            throw error;
        }
    }

    get_table_name() 
    {
        switch(this.modelName) 
        {
            case 'User': return 'users';
            case 'Post': return 'posts';
            case 'Comment': return 'comments';
            case 'Category': return 'categories';
            case 'Like': return 'likes';
            default: return this.modelName.toLowerCase() + 's';
        }
    }
}

export default AdminAdapter;
