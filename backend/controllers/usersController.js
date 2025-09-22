import User from '../models/User.js';
import ErrorHandler from '../middleware/errorHandler.js';
import FileUpload from '../middleware/fileUpload.js';

class UsersController 
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
            
            const public_users = users.map(user => ({
                id: user.id,
                login: user.login,
                full_name: user.full_name,
                profile_picture: user.profile_picture,
                rating: user.rating,
                created_at: user.created_at
            }));

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
    
    // GET /api/users/:user_id - get specified user data
    static async get_public_profile(req, res) 
    {
        try 
        {
            const { user_id } = req.params;
            const user = await User.find_by_id(user_id);
            
            if(!user) throw ErrorHandler.not_found_error('User');
            
            const public_data = {
                id: user.id,
                login: user.login,
                full_name: user.full_name,
                profile_picture: user.profile_picture,
                rating: user.rating,
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
    // AUTHORIZED USERS
    // ===============================

    // GET /api/users/profile - get own profile
    static async get_profile(req, res) 
    {
        try 
        {
            const user = await User.find_by_id(req.user.id);
            
            if(!user) throw ErrorHandler.not_found_error('User');
            
            const profile_data = {
                id: user.id,
                login: user.login,
                full_name: user.full_name,
                email: user.email,
                profile_picture: user.profile_picture,
                rating: user.rating,
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

    // PATCH /api/users/avatar - upload user avatar
    static async upload_avatar(req, res) 
    {
        try 
        {
            if(!req.file) throw ErrorHandler.validationError(['Avatar file is required']);

            const user = await User.find_by_id(req.user.id);
            if(!user) throw ErrorHandler.not_found_error('User');

            // delete old avatar if it's not default
            if(user.profile_picture && user.profile_picture !== 'default_avatar.png') 
                {
                FileUpload.delete_file(`public/uploads/avatars/${user.profile_picture}`);
            }

            // update user with new avatar
            const avatar_url = FileUpload.get_file_url(req, req.file.filename, 'avatars');
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

    // PATCH /api/users/:user_id - update user data
    static async update_profile(req, res) 
    {
        try 
        {
            const { user_id } = req.params;
            const { full_name, email } = req.body;

            const user = await User.find_by_id(user_id);
            if(!user) throw ErrorHandler.not_found_error('User');

            // check if email is already taken by another user
            if(email && email !== user.email) 
                {
                const user_exists = await User.find_by_email(email);
                
                if(user_exists && user_exists.id !== user.id) 
                    {
                    throw ErrorHandler.validationError(['Email is already taken']);
                }
            }

            // update user data
            await user.update_profile({ full_name, email });

            res.json({
                status: 'success',
                message: 'Profile updated successfully'
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // DELETE /api/users/:user_id - delete user
    static async delete_account(req, res) 
    {
        try 
        {
            const { user_id } = req.params;
            
            const user = await User.find_by_id(user_id);
            if(!user) throw ErrorHandler.not_found_error('User');

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

    // POST /api/users - create a new user (admin only)
    static async admin_create(req, res) 
    {
        try 
        {
            const { login, password, password_confirmation, email, full_name, role = 'user' } = req.body;

            // check if user already exists
            const user_exists_by_login = await User.find_by_login(login);
            if(user_exists_by_login) throw ErrorHandler.validationError(['Login is already taken']);

            const user_exists_by_email = await User.find_by_email(email);
            if(user_exists_by_email) throw ErrorHandler.validationError(['Email is already taken']);

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

    // GET /api/users/admin/all - get all users for admin
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
            
            if(!user) throw ErrorHandler.not_found_error('User');

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

            if(!['user', 'admin'].includes(role)) throw ErrorHandler.validationError(['Invalid role']);

            const user = await User.find_by_id(id);
            if(!user) throw ErrorHandler.not_found_error('User');

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
            if(!user) throw ErrorHandler.not_found_error('User');

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

    // ===============================
    // ALIAS METHODS
    // ===============================
    
    static async adminGetAll(req, res) 
    {
        return await UsersController.admin_get_all(req, res);
    }

    static async adminGetById(req, res) 
    {
        return await UsersController.admin_get_by_id(req, res);
    }

    static async adminUpdateRole(req, res) 
    {
        return await UsersController.admin_update_role(req, res);
    }

    static async adminDelete(req, res) 
    {
        return await UsersController.admin_delete(req, res);
    }
}

export default UsersController;
