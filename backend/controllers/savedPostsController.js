import SavedPost from '../models/SavedPost.js';
import Post from '../models/Post.js';
import ErrorHandler from '../middleware/errorHandler.js';
import dbConnect from '../utils/dbConnect.js';

class SavedPostsController 
{
    // GET /api/users/saved-posts
    static async get_user_saved_posts(req, res) 
    {
        try 
        {
            const { page = 1, limit = 20 } = req.query;
            const userId = req.user.id;
            
            const savedPosts = await SavedPost.get_user_saved_posts(userId, page, limit);
            
            res.json({
                status: 'success',
                data: savedPosts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // POST /api/posts/:post_id/save
    static async save_post(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const { notes } = req.body;
            const userId = req.user.id;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw ErrorHandler.not_found_error('Post');
            
            const save_existing = await SavedPost.find_by_user_and_post(userId, post_id);
            if(save_existing) throw ErrorHandler.validation_error(['Post is already saved']);
            
            const saved_post = new SavedPost({
                user_id: userId,
                post_id: post_id,
                notes: notes || null
            });
            
            await saved_post.save();
            
            res.status(201).json({
                status: 'success',
                message: 'Post saved successfully',
                data: 
                {
                    id: saved_post.id,
                    post_id: post_id,
                    notes: notes
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // DELETE /api/posts/:post_id/save
    static async unsave_post(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const userId = req.user.id;
            
            const saved_post = await SavedPost.find_by_user_and_post(userId, post_id);
            if(!saved_post) throw ErrorHandler.not_found_error('Saved post');
            
            await saved_post.unsave();
            
            res.json({
                status: 'success',
                message: 'Post unsaved successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // PATCH /api/saved-posts/:saved_post_id
    static async update_saved_post_notes(req, res) 
    {
        try 
        {
            const { saved_post_id } = req.params;
            const { notes } = req.body;
            const user_id = req.user.id;
            
            const query = 'SELECT * FROM saved_posts WHERE id = ? AND user_id = ?';
            const result = await dbConnect.make_request(query, [saved_post_id, user_id]);
            const rows = result[0];
            
            if(rows.length === 0) throw ErrorHandler.not_found_error('Saved post');
            
            const saved_post = new SavedPost(rows[0]);
            await saved_post.update_notes(notes);
            
            res.json({
                status: 'success',
                message: 'Saved post notes updated successfully',
                data: 
                {
                    id: saved_post.id,
                    notes: saved_post.notes
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // GET /api/posts/:post_id/save-status
    static async get_save_status(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const user_id = req.user?.id;
            
            if(!user_id) 
                {
                return res.json({
                    status: 'success',
                    data: { is_saved: false }
                });
            }
            
            const is_saved = await SavedPost.is_saved_by_user(user_id, post_id);
            
            res.json({
                status: 'success',
                data: { is_saved: is_saved }
            });
        } catch(error) 
        {
            throw error;
        }
    }
}

export default SavedPostsController;
