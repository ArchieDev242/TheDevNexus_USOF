import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Category from '../models/Category.js';
import SavedPost from '../models/SavedPost.js';
import error_handler from '../middleware/errorHandler.js';
import file_upload from '../middleware/fileUpload.js';
import achievement_service from '../services/AchievementService.js';

class posts_controller 
{
    // ===============================
    // ALL USERS
    // ===============================
    
    // GET /api/posts
    static async get_all_public(req, res) 
    {
        try 
        {
            const {
                page = 1,
                limit = 10,
                sort = 'likes', // likes, date
                categories: categoriesParam = '',
                category: categoryParam = '', // support legacy singular param
                date_from = '',
                date_to = '',
                status = 'active',
                author = ''
            } = req.query;
            
            // Normalize categories from either 'categories' (csv) or 'category' (single)
            const normalizedCategoriesCsv = String(categoriesParam || categoryParam || '').trim();
            const filters = {
                categories: normalizedCategoriesCsv ? normalizedCategoriesCsv.split(',').filter(Boolean) : [],
                date_from,
                date_to
            };

            if(author) filters.author = author;
            
            if(req.user?.role === 'admin') 
                {
                if(status === 'all') 
                    {
                    filters.status = null;
                } else 
                    {
                    filters.status = status;
                }
            } else 
                {
                filters.status = 'active';
            }
            
            const posts = await Post.get_all_with_filters(page, limit, sort, filters);
            
            res.json({
                status: 'success',
                data: posts,
                pagination: 
                {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // GET /api/posts/:post_id
    static async get_by_id(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const post = await Post.find_by_id(post_id);
            
            if(!post) throw error_handler.not_found_error('Post');
            
            // can user see this post?
            if(post.status !== 'active' && (!req.user || (req.user.role !== 'admin' && post.author_id !== req.user.id))) 
                {
                throw error_handler.forbidden_error('Post not available');
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
    
    // GET /api/posts/:post_id/comments
    static async get_post_comments(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const user_id = req.user?.id || null;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw error_handler.not_found_error('Post'); 
            
            const comments = await Comment.get_by_post(post_id, page, limit, user_id);
            
            res.json({
                status: 'success',
                data: comments,
                pagination: 
                {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // GET /api/posts/:post_id/categories
    static async get_post_categories(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw error_handler.not_found_error('Post');
            
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
    
    // GET /api/posts/:post_id/like
    static async get_post_likes(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const user_id = req.user?.id;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw error_handler.not_found_error('Post');
            
            const likes = await Like.get_post_likes(post_id, user_id);
            
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
    
    // POST /api/posts/
    static async create(req, res) 
    {
        try 
        {
            const { title, content, categories, author_id: provided_author_id, code_snippets } = req.body;
            
            let author_id;

            if(provided_author_id && req.user.role === 'admin') author_id = provided_author_id;
            else author_id = req.user.id;

            let processed_content = content;
            
            // create post
            const post_data = {
                author_id,
                title,
                content: processed_content,
                status: 'active'
            };
            
            const post = new Post(post_data);
            const result = await post.create();
            
            console.log('Post created with result:', result);
            console.log('Post ID after create:', post.id);
            console.log('Categories to add:', categories);
            
            if(categories && Array.isArray(categories) && categories.length > 0) 
                {
                console.log('Adding categories to post...');

                await post.add_categories(categories);
            }
            
            if(req.files && req.files.length > 0) 
                {
                const image_urls = req.files.map(file => 
                    file_upload.get_file_url(req, file.filename, 'posts')
                );

                console.log('Image URLs:', image_urls);
            }
            
            try 
            {
                const achievements = await achievement_service.check_achievements_after_post(
                    author_id, 
                    post.id, 
                    processed_content
                );
                console.log('Achievements checked for post creation:', achievements.length, 'earned');
            } catch(achievement_error) 
            {
                console.error('❌ Error checking achievements:', achievement_error);
            }

            res.status(201).json({
                status: 'success',
                message: 'Post created successfully',
                data: 
                {
                    id: post.id,
                    title,
                    content
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // POST /api/posts/:post_id/comments
    static async create_comment(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const { content, parent_id } = req.body;
            const author_id = req.user.id;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw error_handler.not_found_error('Post');
            
            if(post.status !== 'active') throw error_handler.forbidden_error('Cannot comment on inactive post');
            
            if(parent_id) 
            {
                const parent_comment = await Comment.find_by_id(parent_id);
                if(!parent_comment) throw error_handler.not_found_error('Parent comment');
            }
            
            const comment_data = {
                author_id,
                post_id,
                content,
                parent_comment_id: parent_id || null
            };
            
            console.log('Creating comment with data:', comment_data);
            
            const comment = new Comment(comment_data);
            const result = await comment.create();
            
            try 
            {
                const achievements = await achievement_service.check_achievements_after_comment(author_id);
                console.log('Achievements checked for comment creation:', achievements.length, 'earned');
            } catch(achievement_error) 
            {
                console.error('❌ Error checking achievements:', achievement_error);
            }
            
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
    
    // POST /api/posts/:post_id/like
    static async like_post(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const { type = 'like' } = req.body; // like or dislike
            const author_id = req.user.id;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw error_handler.not_found_error('Post');
            
            const like_exist = await Like.find_user_post_like(author_id, post_id);
            
            if(like_exist) 
                {
                if(like_exist.type === type) 
                    {
                    throw error_handler.validation_error(['You already ' + type + 'd this post']);
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
            
            try 
            {
                const achievements = await achievement_service.check_achievements_after_like(
                    post_id, 
                    post.author_id, 
                    type
                );
                console.log('Achievements checked for like action:', achievements.length, 'earned');
            } catch(achievement_error) 
            {
                console.error('❌ Error checking achievements:', achievement_error);
            }

            const stats = await Like.get_post_likes(post_id, author_id);

            res.json({
                status: 'success',
                message: `Post ${type}d successfully`,
                data: stats
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // PATCH /api/posts/:post_id
    static async update(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const { title, content, categories, status } = req.body;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw error_handler.not_found_error('Post');
            
            if(req.user.role !== 'admin' && post.author_id !== req.user.id) 
                {
                throw error_handler.forbidden_error('You can only edit your own posts');
            }
            
            const update_data = { title, content };
            
            if(status && req.user.role === 'admin') update_data.status = status;
            
            // update post
            await post.update(update_data);
            
            if(categories && Array.isArray(categories)) await Post.update_categories(post_id, categories);
            
            if(req.files && req.files.length > 0) await Post.add_images(post_id, req.files.map(f => f.filename));
            
            const updated_post = await Post.get_full_post_data(post_id);
            
            res.json({
                status: 'success',
                message: 'Post updated successfully',
                data: updated_post
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // DELETE /api/posts/:post_id
    static async delete(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw error_handler.not_found_error('Post');
            
            if(req.user.role !== 'admin' && post.author_id !== req.user.id) 
                {
                throw error_handler.forbidden_error('You can only delete your own posts');
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
    
    // DELETE /api/posts/:post_id/like
    static async unlike_post(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const author_id = req.user.id;
            
            const like = await Like.find_user_post_like(author_id, post_id);
            if(!like) throw error_handler.not_found_error('Like');
            
            await like.delete();
            const stats = await Like.get_post_likes(post_id, author_id);
            
            res.json({
                status: 'success',
                message: 'Like removed successfully',
                data: stats
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // ===============================
    // ADMIN
    // ===============================
    
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
            
            if(!['active', 'inactive'].includes(status)) throw error_handler.validation_error(['Invalid status']);
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw error_handler.not_found_error('Post');
            
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

    static async adminGetAll(req, res) 
    {
        try 
        {
            const { page = 1, limit = 20, status = '' } = req.query;
            const limit_num = parseInt(limit);
            const page_num = parseInt(page);
            const offset = (page_num - 1) * limit_num;
            
            const posts = await Post.find_all(limit_num, offset);
            
            let filtered_posts = posts;
            if(status) filtered_posts = posts.filter(post => post.status === status);

            res.json({
                status: 'success',
                data: filtered_posts,
                pagination: 
                {
                    page: page_num,
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
            
            if(!['active', 'inactive'].includes(status)) throw error_handler.validationError(['Invalid status']);
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw error_handler.notFoundError('Post');
            
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

    // GET /api/posts/all/comments
    static async get_all_comments(req, res) 
    {
        try 
        {
            const { 
                page = 1, 
                limit = 20, 
                status = 'active' 
            } = req.query;
            
            const comments = await Comment.get_all_with_details(page, limit, status);
            
            res.json({
                status: 'success',
                data: comments,
                pagination: 
                {
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
            const notes = req.body?.notes || null;
            const user_id = req.user.id;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw error_handler.not_found_error('Post');
            
            const save_existing = await SavedPost.find_by_user_and_post(user_id, post_id);
            
            if(save_existing) 
            {
                return res.json({
                    status: 'success',
                    message: 'Post already saved',
                    data: 
                    {
                        id: save_existing.id,
                        post_id: post_id,
                        notes: save_existing.notes
                    }
                });
            }
            
            const saved_post = new SavedPost({
                user_id: user_id,
                post_id: post_id,
                notes: notes
            });
            
            await saved_post.save();
            
            res.status(201).json({
                status: 'success',
                message: 'Post saved successfully',
                data: {
                    id: saved_post.id,
                    post_id: post_id,
                    notes: notes
                }
            });
        } catch (error) 
        {
            console.error('Error in save_post:', error);
            throw error;
        }
    }

    // DELETE /api/posts/:post_id/save
    static async unsave_post(req, res) 
    {
        try 
        {
            const { post_id } = req.params;
            const user_id = req.user.id;
            
            const saved_post = await SavedPost.find_by_user_and_post(user_id, post_id);
            if(!saved_post) throw error_handler.not_found_error('Saved post');
            
            await saved_post.unsave();
            
            res.json({
                status: 'success',
                message: 'Post unsaved successfully'
            });
        } catch (error) 
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
            
            const isSaved = await SavedPost.is_saved_by_user(user_id, post_id);
            
            res.json({
                status: 'success',
                data: { is_saved: isSaved }
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // POST /api/posts/execute-code
    static async execute_code(req, res) 
    {
        res.status(501).json({
            status: 'error',
            message: 'Code execution service not yet implemented - services need ES6 conversion'
        });
    }

    // POST /api/posts/highlight-code
    static async highlight_code(req, res) 
    {
        res.status(501).json({
            status: 'error',
            message: 'Code highlighting service not yet implemented - services need ES6 conversion'
        });
    }

    // POST /api/posts/validate-code
    static async validate_code(req, res) 
    {
        res.status(501).json({
            status: 'error',
            message: 'Code validation service not yet implemented - services need ES6 conversion'
        });
    }
}

export default posts_controller;
