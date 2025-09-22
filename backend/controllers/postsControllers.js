import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Category from '../models/Category.js';
import ErrorHandler from '../middleware/errorHandler.js';
import FileUpload from '../middleware/fileUpload.js';

class PostsController 
{
    // ===============================
    // ALL USERS
    // ===============================
    
    // GET /api/posts - get all posts (with sorting and filtering)
    static async get_all_public(req, res) 
    {
        try 
        {
            const { 
                page = 1, 
                limit = 10, 
                sort = 'likes', // likes, date
                categories = '', 
                date_from = '', 
                date_to = '',
                status = 'active'
            } = req.query;
            
            const filters = {
                categories: categories ? categories.split(',') : [],
                date_from,
                date_to,
                status: req.user?.role === 'admin' ? status : 'active' // only admin can see all statuses
            };
            
            const posts = await Post.get_all_with_filters(page, limit, sort, filters);
            
            res.json({
                status: 'success',
                data: posts,
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
    
    // GET /api/posts/:post_id - get specified post data
    static async get_by_id(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const post = await Post.find_by_id(post_id);
            
            if(!post) throw ErrorHandler.not_found_error('Post');
            
            // can user see this post?
            if(post.status !== 'active' && (!req.user || (req.user.role !== 'admin' && post.author_id !== req.user.id))) 
                {
                throw ErrorHandler.forbidden_error('Post not available');
            }
            
            const post_data = await Post.get_full_post_data(post_id);
            
            res.json({
                status: 'success',
                data: post_data
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // GET /api/posts/:post_id/comments - get all comments for the specified post
    static async get_post_comments(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const { page = 1, limit = 20 } = req.query;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw ErrorHandler.not_found_error('Post'); 
            
            const comments = await Comment.get_by_post(post_id, page, limit);
            
            res.json({
                status: 'success',
                data: comments,
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
    
    // GET /api/posts/:post_id/categories - get all categories associated with the specified post
    static async get_post_categories(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw ErrorHandler.not_found_error('Post');
            
            const categories = await Post.get_post_categories(post_id);
            
            res.json({
                status: 'success',
                data: categories
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // GET /api/posts/:post_id/like - get all likes under the specified post
    static async get_post_likes(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw ErrorHandler.not_found_error('Post');
            
            const likes = await Like.get_post_likes(post_id);
            
            res.json({
                status: 'success',
                data: likes
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // ===============================
    // AUTHORIZED USERS
    // ===============================
    
    // POST /api/posts/ - create a new post
    static async create(req, res) 
    {
        try 
        {
            const { title, content, categories } = req.body;
            const author_id = req.user.id;
            
            // create post
            const post_data = {
                author_id,
                title,
                content,
                status: 'active'
            };
            
            const post = new Post(post_data);
            const result = await post.create();
            const post_id = result.insertId;
            
            if(categories && Array.isArray(categories)) await Post.add_categories(post_id, categories);
            
            if(req.files && req.files.length > 0) 
                {
                const image_urls = req.files.map(file => 
                    FileUpload.get_file_url(req, file.filename, 'posts')
                );
                await Post.add_images(post_id, req.files.map(f => f.filename));
            }
            
            res.status(201).json({
                status: 'success',
                message: 'Post created successfully',
                data: 
                {
                    id: post_id,
                    title,
                    content
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // POST /api/posts/:post_id/comments - create a new comment
    static async create_comment(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const { content } = req.body;
            const author_id = req.user.id;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw ErrorHandler.not_found_error('Post');
            
            if(post.status !== 'active') throw ErrorHandler.forbidden_error('Cannot comment on inactive post');
            
            const comment_data = {
                author_id,
                post_id,
                content
            };
            
            const comment = new Comment(comment_data);
            const result = await comment.create();
            
            res.status(201).json({
                status: 'success',
                message: 'Comment created successfully',
                data: {
                    id: result.insertId,
                    content
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // POST /api/posts/:post_id/like - create a new like under a post
    static async like_post(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const { type = 'like' } = req.body; // like or dislike
            const author_id = req.user.id;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw ErrorHandler.not_found_error('Post');
            
            // Check if user already liked/disliked this post
            const like_exist = await Like.find_user_post_like(author_id, post_id);
            
            if(like_exist) 
                {
                if(like_exist.type === type) 
                    {
                    throw ErrorHandler.validation_error(['You already ' + type + 'd this post']);
                } else 
                    {
                    await like_exist.update_type(type);
                }
            } else 
                {
                // new like
                const like_data = {
                    author_id,
                    post_id,
                    type
                };
                
                const like = new Like(like_data);
                await like.create();
            }
            
            res.json({
                status: 'success',
                message: `Post ${type}d successfully`
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // PATCH /api/posts/:post_id - update the specified post (creator only)
    static async update(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const { title, content, categories } = req.body;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw ErrorHandler.not_found_error('Post');
            
            if(req.user.role !== 'admin' && post.author_id !== req.user.id) 
                {
                throw ErrorHandler.forbidden_error('You can only edit your own posts');
            }
            
            // update post
            await post.update({ title, content });
            
            if(categories && Array.isArray(categories)) await Post.update_categories(post_id, categories);
            
            if(req.files && req.files.length > 0) await Post.add_images(post_id, req.files.map(f => f.filename));
            
            res.json({
                status: 'success',
                message: 'Post updated successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // DELETE /api/posts/:post_id - delete a post
    static async delete(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw ErrorHandler.not_found_error('Post');
            
            if(req.user.role !== 'admin' && post.author_id !== req.user.id) 
                {
                throw ErrorHandler.forbidden_error('You can only delete your own posts');
            }
            
            await post.delete();
            
            res.json({
                status: 'success',
                message: 'Post deleted successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // DELETE /api/posts/:post_id/like - delete a like under a post
    static async unlike_post(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const author_id = req.user.id;
            
            const like = await Like.find_user_post_like(author_id, post_id);
            if(!like) throw ErrorHandler.not_found_error('Like');
            
            await like.delete();
            
            res.json({
                status: 'success',
                message: 'Like removed successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // ===============================
    // ADMIN
    // ===============================
    
    // Additional admin methods can be added here
    static async admin_get_all(req, res) 
    {
        try 
        {
            const { page = 1, limit = 20, status = '' } = req.query;
            const posts = await Post.admin_get_all(page, limit, status);
            
            res.json({
                status: 'success',
                data: posts,
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
    
    static async admin_update_status(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const { status } = req.body;
            
            if(!['active', 'inactive'].includes(status)) throw ErrorHandler.validation_error(['Invalid status']);
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw ErrorHandler.not_found_error('Post');
            
            await post.update_status(status);
            
            res.json({
                status: 'success',
                message: 'Post status updated successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // ===============================
    // ADMIN
    // ===============================

    static async adminGetAll(req, res) 
    {
        try 
        {
            const { page = 1, limit = 20, status = '' } = req.query;
            const limit_num = parseInt(limit);
            const pageNum = parseInt(page);
            const offset = (pageNum - 1) * limit_num;
            
            const posts = await Post.find_all(limit_num, offset);
            
            let filtered_posts = posts;
            if(status) filtered_posts = posts.filter(post => post.status === status);

            res.json({
                status: 'success',
                data: filtered_posts,
                pagination: {
                    page: pageNum,
                    limit: limit_num,
                    total: filtered_posts.length
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }

    static async adminUpdateStatus(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const { status } = req.body;
            
            if(!['active', 'inactive'].includes(status)) throw ErrorHandler.validationError(['Invalid status']);
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw ErrorHandler.notFoundError('Post');
            
            await post.update_status(status);
            
            res.json({
                status: 'success',
                message: 'Post status updated successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }
}

export default PostsController;
