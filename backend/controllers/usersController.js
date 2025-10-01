import User from '../models/User.js';
import SavedPost from '../models/SavedPost.js';
import UserReputation from '../models/UserReputation.js';
import error_handler from '../middleware/errorHandler.js';
import file_upload from '../middleware/fileUpload.js';

class users_controller 
{
    // ===============================
    // ALL USERS
    // ===============================
    
    // GET /api/users - get all users
    static async get_all_public(req, res) 
    {
        try 
        {
            const { page = 1, limit = 10, sort = 'rating' } = req.query;
            const users = await User.find_all();
            
            const public_users = users.map(user => {
                if(req.user && req.user.role === 'admin') 
                    {
                    return {
                        id: user.id,
                        login: user.login,
                        full_name: user.full_name,
                        email: user.email,
                        profile_picture: user.profile_picture,
                        rating: user.rating,
                        reputation_score: user.reputation_score,
                        is_toxic: user.is_toxic,
                        role: user.role,
                        email_verified: user.email_verified,
                        created_at: user.created_at
                    };
                } else 
                    {
                    return {
                        id: user.id,
                        login: user.login,
                        full_name: user.full_name,
                        profile_picture: user.profile_picture,
                        rating: user.rating,
                        reputation_score: user.reputation_score,
                        is_toxic: user.is_toxic,
                        created_at: user.created_at
                    };
                }
            });

            if(sort === 'rating') 
                {
                public_users.sort((a, b) => b.rating - a.rating);
            } else if(sort === 'date') 
                {
                public_users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            }

            const start_index = (page - 1) * limit;
            const paginated_users = public_users.slice(start_index, start_index + parseInt(limit));
            
            res.json({
                status: 'success',
                data: paginated_users,
                pagination: 
                {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: public_users.length
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    // GET /api/users/:user_id
    static async get_public_profile(req, res) 
    {
        try 
        {
            const { user_id } = req.params;
            const user = await User.find_by_id(user_id);
            
            if(!user) throw error_handler.not_found_error('User');
            
            if(req.user && req.user.role === 'admin') 
                {
                const admin_data = {
                    id: user.id,
                    login: user.login,
                    full_name: user.full_name,
                    email: user.email,
                    profile_picture: user.profile_picture,
                    rating: user.rating,
                    reputation_score: user.reputation_score,
                    is_toxic: user.is_toxic,
                    role: user.role,
                    email_verified: user.email_verified,
                    created_at: user.created_at,
                    updated_at: user.updated_at
                };
                
                return res.json({
                    status: 'success',
                    data: admin_data
                });
            }
            
            const public_data = {
                id: user.id,
                login: user.login,
                full_name: user.full_name,
                profile_picture: user.profile_picture,
                rating: user.rating,
                reputation_score: user.reputation_score,
                is_toxic: user.is_toxic,
                created_at: user.created_at
            };
            
            res.json({
                status: 'success',
                data: public_data
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // ===============================
    // REP
    // ===============================

    // POST /api/users/:user_id/reputation - rate a user (+rep / -rep)
    static async rate_user(req, res) 
    {
        try 
        {
            const { user_id } = req.params;
            const { value } = req.body;

            const numeric_value = parseInt(value);

            const result = await UserReputation.rate_user(req.user, user_id, numeric_value);
            const updated_user = await User.find_by_id(user_id);

            res.json(
                {
                    status: 'success',
                    data: 
                    {
                        action: result.action,
                        summary: result.summary,
                        reputation: result.entry
                            ? 
                            {
                                id: result.entry.id,
                                giver_id: result.entry.giver_id,
                                receiver_id: result.entry.receiver_id,
                                value: result.entry.value,
                                created_at: result.entry.created_at,
                                updated_at: result.entry.updated_at
                            }
                            : null,
                        user: 
                        {
                            id: updated_user.id,
                            reputation_score: updated_user.reputation_score,
                            is_toxic: updated_user.is_toxic
                        }
                    }
                }
            );
        } 
        catch(error) 
        {
            throw error;
        }
    }

    // GET /api/users/:user_id/reputation
    static async get_reputation(req, res) 
    {
        try 
        {
            const { user_id } = req.params;
            const page = Math.max(parseInt(req.query.page) || 1, 1);
            const limit = Math.min(parseInt(req.query.limit) || 20, 50);
            const offset = (page - 1) * limit;

            const user = await User.find_by_id(user_id);
            if(!user) throw error_handler.not_found_error('User');

            const summary = await UserReputation.get_summary(user.id);
            const history = await UserReputation.list_for_user(user.id, limit, offset);

            res.json(
                {
                    status: 'success',
                    data: 
                    {
                        user_id: user.id,
                        summary: summary,
                        history: history.map(record => (
                            {
                                id: record.id,
                                giver_id: record.giver_id,
                                giver_login: record.giver_login,
                                giver_name: record.giver_name,
                                value: record.value,
                                created_at: record.created_at,
                                updated_at: record.updated_at
                            }
                        )),
                        pagination: 
                        {
                            page: page,
                            limit: limit,
                            total: summary.total
                        }
                    }
                }
            );
        } 
        catch(error) 
        {
            throw error;
        }
    }

    // ===============================
    // AUTHORIZED USERS
    // ===============================

    // GET /api/users/profile
    static async get_profile(req, res) 
    {
        try 
        {
            const user = await User.find_by_id(req.user.id);
            
            if(!user) throw error_handler.not_found_error('User');
            
            const profile_data = {
                id: user.id,
                login: user.login,
                full_name: user.full_name,
                email: user.email,
                profile_picture: user.profile_picture,
                rating: user.rating,
                reputation_score: user.reputation_score,
                is_toxic: user.is_toxic,
                role: user.role,
                email_verified: user.email_verified,
                created_at: user.created_at,
                updated_at: user.updated_at
            };
            
            res.json({
                status: 'success',
                data: profile_data
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // PATCH /api/users/avatar
    static async upload_avatar(req, res) 
    {
        try 
        {
            if(!req.file) throw error_handler.validationError(['Avatar file is required']);

            const user = await User.find_by_id(req.user.id);
            if(!user) throw error_handler.not_found_error('User');

            // delete old avatar if it's not default
            if(user.profile_picture && user.profile_picture !== 'default_avatar.png') 
                {
                file_upload.delete_file(`public/uploads/avatars/${user.profile_picture}`);
            }

            // update user with new avatar
            const avatar_url = file_upload.get_file_url(req, req.file.filename, 'avatars');
            await user.update_avatar(req.file.filename);

            res.json({
                status: 'success',
                message: 'Avatar uploaded successfully',
                data: 
                {
                    profile_picture: req.file.filename,
                    avatar_url: avatar_url
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // PATCH /api/users/:user_id
    static async update_profile(req, res) 
    {
        try 
        {
            const { user_id } = req.params;
            const { login, full_name, email, role, email_verified, password } = req.body;

            const user = await User.find_by_id(user_id);
            if(!user) throw error_handler.not_found_error('User');

            const update_data = {};
            
            if(login !== undefined) update_data.login = login;
            if(full_name !== undefined) update_data.full_name = full_name;
            if(email !== undefined) update_data.email = email;
            if(role !== undefined) update_data.role = role;
            if(email_verified !== undefined) update_data.email_verified = email_verified;
            
            if(password && password.trim() !== '') 
                {
                const bcrypt = await import('bcrypt');
                update_data.password = await bcrypt.default.hash(password, 10);
            }

            if(email && email !== user.email) 
                {
                const user_exists = await User.find_by_email(email);
                
                if(user_exists && user_exists.id !== user.id) 
                    {
                    throw error_handler.validationError(['Email is already taken']);
                }
            }

            if(login && login !== user.login) 
                {
                const user_exists = await User.find_by_login(login);
                
                if(user_exists && user_exists.id !== user.id) 
                    {
                    throw error_handler.validationError(['Login is already taken']);
                }
            }

            const updated_user = await user.update(update_data);

            const response_data = {
                id: updated_user.id,
                login: updated_user.login,
                full_name: updated_user.full_name,
                email: updated_user.email,
                profile_picture: updated_user.profile_picture,
                rating: updated_user.rating,
                reputation_score: updated_user.reputation_score,
                is_toxic: updated_user.is_toxic,
                role: updated_user.role,
                email_verified: updated_user.email_verified,
                created_at: updated_user.created_at,
                updated_at: updated_user.updated_at
            };

            res.json({
                status: 'success',
                message: 'User updated successfully',
                data: response_data
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // DELETE /api/users/:user_id
    static async delete_account(req, res) 
    {
        try 
        {
            const { user_id } = req.params;
            
            const user = await User.find_by_id(user_id);
            if(!user) throw error_handler.not_found_error('User');

            await user.delete();

            res.json({
                status: 'success',
                message: 'Account deleted successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // ===============================
    // ADMIN
    // ===============================

    // POST /api/users
    static async admin_create(req, res) 
    {
        try 
        {
            const { login, password, password_confirmation, email, full_name, role = 'user' } = req.body;

            // check if user already exists
            const user_exists_by_login = await User.find_by_login(login);
            if(user_exists_by_login) throw error_handler.validationError(['Login is already taken']);

            const user_exists_by_email = await User.find_by_email(email);
            if(user_exists_by_email) throw error_handler.validationError(['Email is already taken']);

            const user_data = { login, password, full_name, email, role };
            const user = new User(user_data);
            const result = await user.create();

            res.status(201).json({
                status: 'success',
                message: 'User created successfully',
                data: 
                {
                    id: result.insertId,
                    login,
                    email,
                    full_name,
                    role
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // GET /api/users/admin/all
    static async admin_get_all(req, res) 
    {
        try 
        {
            const { page = 1, limit = 20, search = '', role = '' } = req.query;
            const users = await User.find_all();

            let filtered_users = users;
            if(role) filtered_users = users.filter(user => user.role === role);

            if(search) 
                {
                filtered_users = filtered_users.filter(user => 
                    user.login.toLowerCase().includes(search.toLowerCase()) ||
                    user.email.toLowerCase().includes(search.toLowerCase())
                );
            }

            const start_index = (page - 1) * limit;
            const paginated_users = filtered_users.slice(start_index, start_index + parseInt(limit));

            res.json({
                status: 'success',
                data: paginated_users,
                pagination: 
                {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: filtered_users.length
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }

    static async admin_get_by_id(req, res) 
    {
        try 
        {
            const { id } = req.params;
            const user = await User.find_by_id(id);
            
            if(!user) throw error_handler.not_found_error('User');

            res.json({
                status: 'success',
                data: user
            });
        } catch(error) 
        {
            throw error;
        }
    }

    static async admin_update_role(req, res) 
    {
        try 
        {
            const { id } = req.params;
            const { role } = req.body;

            if(!['user', 'admin'].includes(role)) throw error_handler.validationError(['Invalid role']);

            const user = await User.find_by_id(id);
            if(!user) throw error_handler.not_found_error('User');

            await user.update_role(role);

            res.json({
                status: 'success',
                message: 'User role updated successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }

    static async admin_delete(req, res) 
    {
        try 
        {
            const { id } = req.params;
            
            const user = await User.find_by_id(id);
            if(!user) throw error_handler.not_found_error('User');

            await user.delete();

            res.json({
                status: 'success',
                message: 'User deleted successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }
    
    static async adminGetAll(req, res) 
    {
        return await users_controller.admin_get_all(req, res);
    }

    static async adminGetById(req, res) 
    {
        return await users_controller.admin_get_by_id(req, res);
    }

    static async adminUpdateRole(req, res) 
    {
        return await users_controller.admin_update_role(req, res);
    }

    static async adminDelete(req, res) 
    {
        return await users_controller.admin_delete(req, res);
    }

    // GET /api/users/saved-posts
    static async get_saved_posts(req, res) 
    {
        try 
        {
            const { page = 1, limit = 20 } = req.query;
            const user_id = req.user.id;
            
            const saved_posts = await SavedPost.get_user_saved_posts(user_id, page, limit);
            
            res.json({
                status: 'success',
                data: saved_posts,
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
}

export default users_controller;
