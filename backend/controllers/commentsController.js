import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Post from '../models/Post.js';
import error_handler from '../middleware/errorHandler.js';

class comments_controller 
{
    // ===============================
    // ALL USERS
    // ===============================
    
    // GET /api/comments/post/:postId
    static async get_by_post(req, res) 
    {
        try 
        {
            const { postId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            
            const post = await Post.find_by_id(postId);
            if(!post) throw error_handler.not_found_error('Post');
            
            const user_id = req.user?.id || null;
            const comments = await Comment.get_by_post(postId, page, limit, user_id);
            
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
    
    // GET /api/comments/:id
    static async get_by_id(req, res) 
    {
        try 
        {
            const { id } = req.params;
            const comment = await Comment.find_by_id(id);
            
            if(!comment) throw error_handler.not_found_error('Comment');
            
            const comment_data = await Comment.get_full_comment_data(id);
            
            res.json({
                status: 'success',
                data: comment_data
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // GET /api/comments/:comment_id/like
    static async get_comment_likes(req, res) 
    {
        try 
        {
            const { id } = req.params;
            
            const comment = await Comment.find_by_id(id);
            if(!comment) throw error_handler.not_found_error('Comment');
            
            const likes = await Like.get_comment_likes(id);
            
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
    
    // POST /api/comments
    static async create(req, res) 
    {
        try 
        {
            const { content, post_id } = req.body;
            const author_id = req.user.id;
            
            const post = await Post.find_by_id(post_id);
            if(!post) throw error_handler.not_found_error('Post');
            
            if(post.status !== 'active') 
                {
                throw error_handler.forbidden_error('Cannot comment on inactive post');
            }
            
            const comment_data = {
                author_id,
                post_id,
                content
            };
            
            const comment = new Comment(comment_data);
            const created_comment = await comment.create();
            
            res.status(201).json({
                status: 'success',
                message: 'Comment created successfully',
                data: 
                {
                    id: created_comment.id,
                    content,
                    post_id
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // POST /api/comments/:comment_id/reply
    static async create_reply(req, res) 
    {
        try 
        {
            const { id: comment_id } = req.params;
            const { content } = req.body;
            const author_id = req.user.id;
            
            const parent_comment = await Comment.find_by_id(comment_id);
            if(!parent_comment) throw error_handler.not_found_error('Comment');
            
            if(parent_comment.status !== 'active') 
                {
                throw error_handler.forbidden_error('Cannot reply to inactive comment');
            }
            
            const post = await Post.find_by_id(parent_comment.post_id);
            
            if(!post || post.status !== 'active') 
                {
                throw error_handler.forbidden_error('Cannot reply to comment on inactive post');
            }
            
            const comment_data = {
                author_id,
                post_id: parent_comment.post_id,
                parent_comment_id: comment_id,
                content
            };
            
            const comment = new Comment(comment_data);
            const created_comment = await comment.create();
            
            res.status(201).json({
                status: 'success',
                message: 'Reply created successfully',
                data: 
                {
                    id: created_comment.id,
                    content,
                    parent_comment_id: comment_id
                }
            });
        } catch (error) 
        {
            throw error;
        }
    }
    
    // PUT /api/comments/:id
    static async update(req, res) 
    {
        try 
        {
            const { id } = req.params;
            const { content } = req.body;
            
            const comment = await Comment.find_by_id(id);
            if(!comment) throw error_handler.not_found_error('Comment');
            
            if(req.user.role !== 'admin' && comment.author_id !== req.user.id) 
                {
                throw error_handler.forbidden_error('You can only edit your own comments');
            }
            
            await comment.update({ content });
            
            res.json({
                status: 'success',
                message: 'Comment updated successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // DELETE /api/comments/:id
    static async delete(req, res) 
    {
        try 
        {
            const { id } = req.params;
            
            const comment = await Comment.find_by_id(id);
            if(!comment) throw error_handler.not_found_error('Comment');

            if(req.user.role !== 'admin' && comment.author_id !== req.user.id) 
            {
                throw error_handler.forbidden_error('You can only delete your own comments');
            }
            
            await comment.delete();
            
            res.json({
                status: 'success',
                message: 'Comment deleted successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // POST /api/comments/:comment_id/like
    static async like_comment(req, res) 
    {
        try 
        {
            const { id } = req.params;
            const { type = 'like' } = req.body; // like or dislike
            const author_id = req.user.id;
            
            const comment = await Comment.find_by_id(id);
            if(!comment) throw error_handler.not_found_error('Comment');
            
            const like_exists = await Like.find_user_comment_like(author_id, id);
            
            if(like_exists) 
                {
                if(like_exists.type === type) 
                    {
                    throw error_handler.validation_error(['You already ' + type + 'd this comment']);
                } else 
                    {
                    await like_exists.update_type(type);
                }
            } else 
                {
                const like_data = {
                    author_id,
                    comment_id: id,
                    type
                };
                
                const like = new Like(like_data);
                await like.create();
            }
            
            const stats = await Like.get_comment_likes_stats(id, author_id);

            res.json({
                status: 'success',
                message: `Comment ${type}d successfully`,
                data: stats
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // DELETE /api/comments/:comment_id/like - delete a like under a comment
    static async unlike_comment(req, res) 
    {
        try 
        {
            const { id } = req.params;
            const author_id = req.user.id;
            
            const like = await Like.find_user_comment_like(author_id, id);
            if(!like) throw error_handler.not_found_error('Like');
            
            await like.delete();
            const stats = await Like.get_comment_likes_stats(id, author_id);
            
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
    
    // GET /api/comments/admin/all
    static async admin_get_all(req, res) 
    {
        try 
        {
            const { page = 1, limit = 20, status = '' } = req.query;
            const comments = await Comment.admin_get_all(page, limit, status);
            
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
    
    // GET /api/comments/admin/moderate
    static async admin_get_moderate(req, res) 
    {
        try 
        {
            const { page = 1, limit = 20 } = req.query;
            const comments = await Comment.get_pending_moderation(page, limit);
            
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
    
    // PUT /api/comments/admin/:id/approve
    static async admin_approve(req, res) 
    {
        try 
        {
            const { id } = req.params;
            
            const comment = await Comment.find_by_id(id);
            if(!comment) throw error_handler.not_found_error('Comment');
            
            await comment.update_status('active');
            
            res.json({
                status: 'success',
                message: 'Comment approved successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // PUT /api/comments/admin/:id/reject
    static async admin_reject(req, res) 
    {
        try 
        {
            const { id } = req.params;
            
            const comment = await Comment.find_by_id(id);
            if(!comment) throw error_handler.not_found_error('Comment');
            
            await comment.update_status('inactive');
            
            res.json({
                status: 'success',
                message: 'Comment rejected successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // DELETE /api/comments/admin/:id
    static async admin_delete(req, res) 
    {
        try 
        {
            const { id } = req.params;
            
            const comment = await Comment.find_by_id(id);
            if(!comment) throw error_handler.not_found_error('Comment');
            
            await comment.delete();
            
            res.json({
                status: 'success',
                message: 'Comment deleted successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    static async adminGetAll(req, res) 
    {
        return await comments_controller.admin_get_all(req, res);
    }

    static async adminApprove(req, res) 
    {
        return await comments_controller.admin_approve(req, res);
    }

    static async adminReject(req, res) 
    {
        return await comments_controller.admin_reject(req, res);
    }

    static async adminDelete(req, res) 
    {
        return await comments_controller.admin_delete(req, res);
    }
}

export default comments_controller;
