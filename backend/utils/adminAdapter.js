import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Category from '../models/Category.js';

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
            
            const [rows] = await this.model.makeRequest(query, params);
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
            
            const [rows] = await this.model.makeRequest(query, params);
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
            switch(this.modelName) 
            {
                case 'User': return await User.create_user(payload);
                case 'Post': return await Post.create_post(payload);
                case 'Comment': return await Comment.create_comment(payload);
                case 'Category': return await Category.create_category(payload);
                case 'Like': return await Like.create_like(payload);
                default: throw new Error(`Create method not implemented for ${this.modelName}`);
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
            const fields = Object.keys(payload).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(payload), id];
            
            const query = `UPDATE ${this.get_table_name()} SET ${fields} WHERE id = ?`;
            await this.model.makeRequest(query, values);
            
            return await this.find_one(id);
        } catch(error) 
        {
            console.error(`Error updating ${this.modelName}:`, error);
            throw error;
        }
    }

    async delete(id) 
    {
        try 
        {
            const query = `DELETE FROM ${this.get_table_name()} WHERE id = ?`;
            await this.model.makeRequest(query, [id]);
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
