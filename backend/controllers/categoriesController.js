import Category from '../models/Category.js';
import Post from '../models/Post.js';
import ErrorHandler from '../middleware/errorHandler.js';

class CategoriesController 
{
    // ===============================
    // ALL USERS
    // ===============================
    
    // GET /api/categories
    static async get_all(req, res) 
    {
        try 
        {
            const categories = await Category.get_all_with_stats();
            
            res.json({
                status: 'success',
                data: categories
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // GET /api/categories/:category_id
    static async get_by_id(req, res) 
    {
        try 
        {
            const { category_id } = req.params;
            const category = await Category.find_by_id(category_id);
            
            if(!category) throw ErrorHandler.not_found_error('Category');
            
            const category_data = await Category.get_with_stats(category_id);
            
            res.json({
                status: 'success',
                data: category_data
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // GET /api/categories/:category_id/posts
    static async get_posts_by_category(req, res) 
    {
        try 
        {
            const { category_id } = req.params;
            const { page = 1, limit = 10, sort = 'date' } = req.query;
            
            const category = await Category.find_by_id(category_id);
            if(!category) throw ErrorHandler.not_found_error('Category');
            
            const posts = await Post.get_by_category(category_id, page, limit, sort);
            
            res.json({
                status: 'success',
                data: posts,
                pagination: 
                {
                    page: parseInt(page),
                    limit: parseInt(limit)
                },
                category: 
                {
                    id: category.id,
                    title: category.title,
                    description: category.description
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // ===============================
    // ADMIN
    // ===============================
    
    // POST /api/categories
    static async admin_create(req, res) 
    {
        try 
        {
            const { title, description } = req.body;
            
            const existing_category = await Category.find_by_title(title);
            if(existing_category) throw ErrorHandler.validation_error(['Category with this title already exists']);
            
            const category_data = {
                title,
                description
            };
            
            const category = new Category(category_data);
            const result = await category.create();
            
            res.status(201).json({
                status: 'success',
                message: 'Category created successfully',
                data: 
                {
                    id: result.insertId,
                    title,
                    description
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // PATCH /api/categories/:category_id
    static async admin_update(req, res) 
    {
        try 
        {
            const { category_id } = req.params;
            const { title, description } = req.body;
            
            const category = await Category.find_by_id(category_id);
            if(!category) throw ErrorHandler.not_found_error('Category');
            
            if(title && title !== category.title) 
                {
                const category_exists = await Category.find_by_title(title);
                
                if(category_exists && category_exists.id !== category.id) 
                    {
                    throw ErrorHandler.validation_error(['Category with this title already exists']);
                }
            }
            
            await category.update({ title, description });
            
            res.json({
                status: 'success',
                message: 'Category updated successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // DELETE /api/categories/:category_id
    static async admin_delete(req, res) 
    {
        try 
        {
            const { category_id } = req.params;
            
            const category = await Category.find_by_id(category_id);
            if(!category) throw ErrorHandler.not_found_error('Category');
            
            const posts_count = await Category.get_posts_count(category_id);
            if(posts_count > 0) throw ErrorHandler.validation_error(['Cannot delete category that has posts. Please reassign posts first.']);
            
            await category.delete();
            
            res.json({
                status: 'success',
                message: 'Category deleted successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // GET /api/categories/admin/stats
    static async admin_get_stats(req, res) 
    {
        try 
        {
            const stats = await Category.get_admin_stats();
            
            res.json({
                status: 'success',
                data: stats
            });
        } catch(error) 
        {
            throw error;
        }
    }
}

export default CategoriesController;
