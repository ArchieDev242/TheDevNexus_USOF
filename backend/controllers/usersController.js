import User from '../models/User.js';
import SavedPost from '../models/SavedPost.js';
import UserReputation from '../models/UserReputation.js';
import error_handler from '../middleware/errorHandler.js';
import file_upload from '../middleware/fileUpload.js';
import { normalize_avatar, DEFAULT_AVATAR } from '../utils/avatarUtils.js';
import DB_connect from '../utils/dbConnect.js';

const build_user_response = (user, includeSensitive = false) => {
    if(!user) return null;

    const base_response = {
        id: user.id,
        login: user.login,
        full_name: user.full_name,
        avatar: normalize_avatar(user.profile_picture),
        profile_picture: normalize_avatar(user.profile_picture),
        rating: user.rating,
        reputation_score: user.reputation_score,
        is_toxic: user.is_toxic,
        role: user.role,
        email_verified: user.email_verified,
        created_at: user.created_at
    };

    if(includeSensitive)
        {
        return {
            ...base_response,
            email: user.email,
            bio: user.bio,
            website: user.website,
            twitter: user.twitter,
            github: user.github,
            linkedin: user.linkedin,
            itch: user.itch,
            gamebanana: user.gamebanana,
            gamejolt: user.gamejolt,
            twitch: user.twitch,
            engines: user.engines || [],
            updated_at: user.updated_at
        };
    }

    return base_response;
};

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
                    return build_user_response(user, true);
                }

                return build_user_response(user);
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
                return res.json({
                    status: 'success',
                    data: build_user_response(user, true)
                });
            }

            res.json({
                status: 'success',
                data: build_user_response(user)
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
            
            res.json({
                status: 'success',
                data: build_user_response(user, true)
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

            const fs = await import('fs');
            const file_buff = fs.readFileSync(req.file.path);
            const base64_str = `data:${req.file.mimetype};base64,${file_buff.toString('base64')}`;

            await user.update_avatar(base64_str);

            fs.unlinkSync(req.file.path);

            res.json({
                status: 'success',
                message: 'Avatar uploaded successfully',
                data: 
                {
                    avatar: base64_str
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // DELETE /api/users/avatar
    static async delete_avatar(req, res) 
    {
        try 
        {
            const user = await User.find_by_id(req.user.id);
            if(!user) throw error_handler.not_found_error('User');

            await user.update_avatar(null);

            res.json({
                status: 'success',
                message: 'Avatar deleted successfully',
                data: 
                {
                    avatar: null
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
            const { login, full_name, email, role, email_verified, password, bio, website, twitter, github, linkedin, itch, gamebanana, gamejolt, twitch, engines } = req.body;

            console.log('Update profile request body:', { login, full_name, email, bio, website, twitter, github, linkedin, itch, gamebanana, gamejolt, twitch, engines });

            const user = await User.find_by_id(user_id);
            if(!user) throw error_handler.not_found_error('User');

            const update_data = {};
            
            if(login !== undefined) update_data.login = login;
            if(full_name !== undefined) update_data.full_name = full_name;
            if(email !== undefined) update_data.email = email;
            if(role !== undefined) update_data.role = role;
            if(email_verified !== undefined) update_data.email_verified = email_verified;
            if(bio !== undefined) update_data.bio = bio;
            if(website !== undefined) update_data.website = website;
            if(twitter !== undefined) update_data.twitter = twitter;
            if(github !== undefined) update_data.github = github;
            if(linkedin !== undefined) update_data.linkedin = linkedin;
            if(itch !== undefined) update_data.itch = itch;
            if(gamebanana !== undefined) update_data.gamebanana = gamebanana;
            if(gamejolt !== undefined) update_data.gamejolt = gamejolt;
            if(twitch !== undefined) update_data.twitch = twitch;
            
            if(engines !== undefined) update_data.engines = JSON.stringify(Array.isArray(engines) ? engines : []);
            
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

            res.json({
                status: 'success',
                message: 'User updated successfully',
                data: build_user_response(updated_user, true)
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
            const formatted_users = paginated_users.map(user => build_user_response(user, true));

            res.json({
                status: 'success',
                data: formatted_users,
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
                data: build_user_response(user, true)
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

    // GET /api/users/me - get current authenticated user
    static async get_current_user(req, res) 
    {
        try 
        {
            if(!req.user) 
            {
                return res.status(401).json({
                    status: 'error',
                    message: 'Not authenticated'
                });
            }

            res.json({
                status: 'success',
                data: build_user_response(req.user, true)
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // GET /api/users/:user_id/posts - get user's posts
    static async get_user_posts(req, res) 
    {
        try 
        {
            const { user_id } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const limit_int = parseInt(limit);
            const offset = (parseInt(page) - 1) * limit_int;

            const user = await User.find_by_id(user_id);
            if(!user) throw error_handler.not_found_error('User');

            const query = `
                SELECT 
                    p.id,
                    p.author_id,
                    p.title,
                    p.content,
                    p.status,
                    p.created_at,
                    p.updated_at,
                    u.login as author_login,
                    u.full_name as author_name,
                    u.profile_picture as author_avatar,
                    COALESCE(l.likes_count, 0) as likes_count,
                    COALESCE(d.dislikes_count, 0) as dislikes_count,
                    COALESCE(c.comments_count, 0) as comments_count,
                    COALESCE(v.views_count, 0) as view_count,
                    COALESCE(cat.categories, '') as categories
                FROM posts p
                LEFT JOIN users u ON p.author_id = u.id
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as likes_count
                    FROM likes
                    WHERE type = 'like'
                    GROUP BY post_id
                ) l ON p.id = l.post_id
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as dislikes_count
                    FROM likes
                    WHERE type = 'dislike'
                    GROUP BY post_id
                ) d ON p.id = d.post_id
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as comments_count
                    FROM comments
                    GROUP BY post_id
                ) c ON p.id = c.post_id
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as views_count
                    FROM post_views
                    GROUP BY post_id
                ) v ON p.id = v.post_id
                LEFT JOIN (
                    SELECT post_id, GROUP_CONCAT(DISTINCT cat.title) as categories
                    FROM post_categories pc
                    LEFT JOIN categories cat ON pc.category_id = cat.id
                    GROUP BY post_id
                ) cat ON p.id = cat.post_id
                WHERE p.author_id = ? AND p.status = 'active'
                ORDER BY p.created_at DESC
                LIMIT ${limit_int} OFFSET ${offset}
            `;

            const result = await DB_connect.make_request(query, [user_id]);
            const posts = result[0].map(post => ({
                ...post,
                author_avatar: normalize_avatar(post.author_avatar),
                categories: post.categories ? post.categories.split(',') : []
            }));

            const count_query = 'SELECT COUNT(*) as total FROM posts WHERE author_id = ? AND status = "active"';
            const count_result = await DB_connect.make_request(count_query, [user_id]);
            const total = count_result[0][0].total;

            res.json({
                status: 'success',
                data: posts,
                pagination: 
                {
                    page: parseInt(page),
                    limit: limit_int,
                    total: total,
                    total_pages: Math.ceil(total / limit_int)
                }
            });
        } catch(error) 
        {
            throw error;
        }
    }

    // GET /api/users/:user_id/achievements - get user's achievements
    static async get_user_achievements(req, res) 
    {
        try 
        {
            // Get user_id from params (/:user_id/achievements) or from authenticated user (/me/achievements)
            const user_id = req.params.user_id || req.user.id;

            const user = await User.find_by_id(user_id);
            if(!user) throw error_handler.not_found_error('User');

            const query = `
                SELECT 
                    a.*,
                    ua.earned_at,
                    ua.progress
                FROM user_achievements ua
                JOIN achievements a ON ua.achievement_id = a.id
                WHERE ua.user_id = ?
                ORDER BY ua.earned_at DESC
            `;

            const result = await DB_connect.make_request(query, [user_id]);

            res.json({
                status: 'success',
                data: result[0]
            });
        } catch(error) 
        {
            throw error;
        }
    }
}

export default users_controller;
