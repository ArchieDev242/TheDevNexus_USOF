import DB_connect from '../utils/dbConnect.js';
import Permission from './Permission.js';
import { normalize_avatar } from '../utils/avatarUtils.js';

class Post 
{
    constructor(postData) 
    {
        this.id = postData?.id;
        this.author_id = postData?.author_id;
        this.title = postData?.title;
        this.content = postData?.content;
        this.status = postData?.status || 'active';
        this.is_closed = postData?.is_closed || false;
        this.closed_at = postData?.closed_at || null;
        this.closed_reason = postData?.closed_reason || null;
        this.publish_date = postData?.publish_date;
        this.updated_at = postData?.updated_at;
    }

    async create() 
    {
        try 
        {
            const query = `
                INSERT INTO posts (author_id, title, content, status)
                VALUES (?, ?, ?, ?)
            `;
            
            const result = await DB_connect.make_request(query, [
                this.author_id,
                this.title,
                this.content,
                this.status
            ]);
            
            this.id = result[0].insertId;
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error creating post: ${error.message}`);
        }
    }

    static async can_view(user) 
    {
        try 
        {
            return await Permission.check_user_permission(user, Permission.PERMISSIONS.READ_POSTS);
        } 
        catch(error) 
        {
            throw new Error(`Error checking view permission: ${error.message}`);
        }
    }

    static async can_create(user) 
    {
        try 
        {
            if(!user) return false;
            
            return await Permission.check_user_permission(user, Permission.PERMISSIONS.CREATE_POSTS);
        } 
        catch(error) 
        {
            throw new Error(`Error checking create permission: ${error.message}`);
        }
    }

    async can_edit(user) 
    {
        try 
        {
            if(!user) return false;
            
            const isOwner = this.author_id === user.id;
            const canEditOwn = await Permission.check_user_permission(user, Permission.PERMISSIONS.EDIT_OWN_POSTS);
            const canEditAny = await Permission.check_user_permission(user, Permission.PERMISSIONS.EDIT_ANY_POSTS);
            
            return (isOwner && canEditOwn) || canEditAny;
        } 
        catch(error) 
        {
            throw new Error(`Error checking edit permission: ${error.message}`);
        }
    }

    async can_delete(user) 
    {
        try 
        {
            if(!user) return false;
            
            const isOwner = this.author_id === user.id;
            const canDeleteOwn = await Permission.check_user_permission(user, Permission.PERMISSIONS.DELETE_OWN_POSTS);
            const canDeleteAny = await Permission.check_user_permission(user, Permission.PERMISSIONS.DELETE_ANY_POSTS);
            
            return (isOwner && canDeleteOwn) || canDeleteAny;
        } 
        catch(error) 
        {
            throw new Error(`Error checking delete permission: ${error.message}`);
        }
    }

    async can_like(user) 
    {
        try 
        {
            if(!user) return false;
            return await Permission.check_user_permission(user, Permission.PERMISSIONS.LIKE_POSTS);
        } 
        catch(error) 
        {
            throw new Error(`Error checking like permission: ${error.message}`);
        }
    }

    belongs_to_user(userId) 
    {
        return this.author_id === userId;
    }

    static async find_by_id(id) 
    {
        try 
        {
            const query = `
                SELECT p.*, u.login as author_login, u.full_name as author_name, u.profile_picture as author_avatar
                FROM posts p
                JOIN users u ON p.author_id = u.id
                WHERE p.id = ?
            `;
            
            const result = await DB_connect.make_request(query, [id]);
            const rows = result[0];
            
            if(rows.length === 0) return null;
            
            const post = new Post(rows[0]);
            post.author_login = rows[0].author_login;
            post.author_name = rows[0].author_name;
            post.author_avatar = normalize_avatar(rows[0].author_avatar);
            
            return post;
        } 
        catch(error) 
        {
            throw new Error(`Error finding post by ID: ${error.message}`);
        }
    }

    static async find_all_active(limit = 20, offset = 0) 
    {
        try 
        {
            const query = `
                SELECT p.*, u.login as author_login, u.full_name as author_name, u.profile_picture as author_avatar
                FROM posts p
                JOIN users u ON p.author_id = u.id
                WHERE p.status = 'active'
                ORDER BY p.publish_date DESC
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `;
            
            const result = await DB_connect.make_request(query);
            const rows = result[0];
            
            return rows.map(row => {
                const post = new Post(row);
                post.author_login = row.author_login;
                post.author_name = row.author_name;
                post.author_avatar = normalize_avatar(row.author_avatar);
                return post;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error finding active posts: ${error.message}`);
        }
    }

    static async find_all(limit = 20, offset = 0) 
    {
        try 
        {
            const query = `
                SELECT p.*, u.login as author_login, u.full_name as author_name, u.profile_picture as author_avatar
                FROM posts p
                JOIN users u ON p.author_id = u.id
                ORDER BY p.publish_date DESC
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `;
            
            const result = await DB_connect.make_request(query);
            const rows = result[0];
            
            return rows.map(row => {
                const post = new Post(row);
                post.author_login = row.author_login;
                post.author_name = row.author_name;
                post.author_avatar = normalize_avatar(row.author_avatar);
                return post;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error finding all posts: ${error.message}`);
        }
    }

    static async find_by_author(authorId, includeInactive = false) 
    {
        try 
        {
            let query = `
                SELECT p.*, u.login as author_login, u.full_name as author_name
                FROM posts p
                JOIN users u ON p.author_id = u.id
                WHERE p.author_id = ?
            `;
            
            if(!includeInactive) query += " AND p.status = 'active'";
            
            query += " ORDER BY p.publish_date DESC";
            
            const result = await DB_connect.make_request(query, [authorId]);
            const rows = result[0];
            
            return rows.map(row => {
                const post = new Post(row);
                post.author_login = row.author_login;
                post.author_name = row.author_name;
                return post;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error finding posts by author: ${error.message}`);
        }
    }

    static async find_by_category(categoryId, limit = 20, offset = 0) 
    {
        try 
        {
            const query = `
                SELECT p.*, u.login as author_login, u.full_name as author_name
                FROM posts p
                JOIN users u ON p.author_id = u.id
                JOIN post_categories pc ON p.id = pc.post_id
                WHERE pc.category_id = ? AND p.status = 'active'
                ORDER BY p.publish_date DESC
                LIMIT ? OFFSET ?
            `;
            
            const result = await DB_connect.make_request(query, [categoryId, limit, offset]);
            const rows = result[0];
            
            return rows.map(row => {
                const post = new Post(row);
                post.author_login = row.author_login;
                post.author_name = row.author_name;
                return post;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error finding posts by category: ${error.message}`);
        }
    }

    async update(updateData) 
    {
        try 
        {
            const fields = [];
            const values = [];
            
            Object.keys(updateData).forEach(key => {
                if(updateData[key] !== undefined && key !== 'id') 
                {
                    fields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });
            
            if(fields.length === 0) throw new Error('No fields to update');
            
            values.push(this.id);
            
            const query = `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`;
            await DB_connect.make_request(query, values);
            
            Object.assign(this, updateData);
            
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error updating post: ${error.message}`);
        }
    }

    async delete() 
    {
        try 
        {
            const query = 'DELETE FROM posts WHERE id = ?';
            await DB_connect.make_request(query, [this.id]);
            
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error deleting post: ${error.message}`);
        }
    }

    async add_categories(categoryIds) 
    {
        try 
        {
            console.log('add_categories called with post.id:', this.id);
            console.log('add_categories called with categoryIds:', categoryIds);
            
            if(!this.id) throw new Error('Post ID is not set');
            
            await DB_connect.make_request('DELETE FROM post_categories WHERE post_id = ?', [this.id]);
            
            if(categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) 
            {
                const valid_category_ids = categoryIds
                    .filter(id => id !== undefined && id !== null && id !== '')
                    .map(id => parseInt(id))
                    .filter(id => !isNaN(id));
                
                console.log('Valid category IDs:', valid_category_ids);
                
                if(valid_category_ids.length > 0) 
                    {
                    const values = valid_category_ids.map(categoryId => [this.id, categoryId]);
                    const placeholders = values.map(() => '(?, ?)').join(', ');
                    const flat_values = values.flat();
                    
                    console.log('SQL values:', flat_values);
                    
                    const query = `INSERT INTO post_categories (post_id, category_id) VALUES ${placeholders}`;
                    await DB_connect.make_request(query, flat_values);
                }
            }
            
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error adding categories to post: ${error.message}`);
        }
    }

    async add_blueprints(blueprints) 
    {
        try 
        {
            console.log('add_blueprints called with post.id:', this.id);
            console.log('add_blueprints called with blueprints:', blueprints);
            
            if(!this.id) throw new Error('Post ID is not set');
            
            if(blueprints && Array.isArray(blueprints) && blueprints.length > 0) 
            {
                const values = blueprints
                    .filter(bp => bp && bp.id)
                    .map(bp => [
                        this.id,
                        bp.id,
                        bp.title || '',
                        bp.author || null,
                        bp.url || null
                    ]);
                
                if(values.length > 0) 
                {
                    const placeholders = values.map(() => '(?, ?, ?, ?, ?)').join(', ');
                    const flat_values = values.flat();
                    
                    const query = `
                        INSERT INTO post_blueprints 
                        (post_id, blueprint_id, blueprint_title, blueprint_author, blueprint_url) 
                        VALUES ${placeholders}
                        ON DUPLICATE KEY UPDATE 
                        blueprint_title = VALUES(blueprint_title),
                        blueprint_author = VALUES(blueprint_author),
                        blueprint_url = VALUES(blueprint_url)
                    `;
                    await DB_connect.make_request(query, flat_values);

                    const unique_blueprints = [];
                    const seen_ids = new Set();

                    for(const [, blueprintId, title, author, url] of values)
                    {
                        if(!seen_ids.has(blueprintId))
                        {
                            seen_ids.add(blueprintId);
                            unique_blueprints.push([blueprintId, title, author, url]);
                        }
                    }

                    if(unique_blueprints.length > 0)
                    {
                        const library_placeholders = unique_blueprints.map(() => '(?, ?, ?, ?)').join(', ');
                        const library_values = unique_blueprints.flat();

                        const library_query = `
                            INSERT INTO blueprint_library (blueprint_id, blueprint_title, blueprint_author, blueprint_url)
                            VALUES ${library_placeholders}
                            ON DUPLICATE KEY UPDATE 
                                blueprint_title = VALUES(blueprint_title),
                                blueprint_author = VALUES(blueprint_author),
                                blueprint_url = VALUES(blueprint_url)
                        `;
                        await DB_connect.make_request(library_query, library_values);
                    }
                    console.log('Blueprints added successfully');
                }
            }
            
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error adding blueprints to post: ${error.message}`);
        }
    }

    async get_blueprints() 
    {
        try 
        {
            const query = `
                SELECT id, blueprint_id, blueprint_title, blueprint_author, blueprint_url, created_at
                FROM post_blueprints
                WHERE post_id = ?
                ORDER BY created_at DESC
            `;
            
            const result = await DB_connect.make_request(query, [this.id]);
            return result || [];
        } 
        catch(error) 
        {
            throw new Error(`Error getting blueprints: ${error.message}`);
        }
    }

    async get_categories() 
    {
        try 
        {
            const query = `
                SELECT c.*
                FROM categories c
                JOIN post_categories pc ON c.id = pc.category_id
                WHERE pc.post_id = ?
                ORDER BY c.title ASC
            `;
            
            const result = await DB_connect.make_request(query, [this.id]);
            const rows = result[0];
            return rows;
        } 
        catch(error) 
        {
            throw new Error(`Error getting post categories: ${error.message}`);
        }
    }

    async get_likes_count() 
    {
        try 
        {
            const query = `
                SELECT 
                    SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) as likes,
                    SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END) as dislikes
                FROM likes 
                WHERE post_id = ?
            `;
            
            const result = await DB_connect.make_request(query, [this.id]);
            const rows = result[0];
            
            return {
                likes: rows[0]?.likes || 0,
                dislikes: rows[0]?.dislikes || 0
            };
        } 
        catch(error) 
        {
            throw new Error(`Error getting post likes count: ${error.message}`);
        }
    }

    static async find_all_sorted_by_likes(limit = 20, offset = 0) 
    {
        try 
        {
            const query = `
                SELECT p.*, u.login as author_login, u.full_name as author_name, u.profile_picture as author_avatar,
                       COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) - 
                       COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0) as like_score
                FROM posts p
                JOIN users u ON p.author_id = u.id
                LEFT JOIN likes l ON p.id = l.post_id
                WHERE p.status = 'active'
                GROUP BY p.id
                ORDER BY like_score DESC, p.publish_date DESC
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `;
            
            const result = await DB_connect.make_request(query);
            const rows = result[0];
            
            return rows.map(row => {
                const post = new Post(row);
                post.author_login = row.author_login;
                post.author_name = row.author_name;
                post.author_avatar = normalize_avatar(row.author_avatar);
                post.like_score = row.like_score;
                return post;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error finding posts sorted by likes: ${error.message}`);
        }
    }

    static async find_by_date_range(startDate, endDate, limit = 20, offset = 0) 
    {
        try 
        {
            const query = `
                SELECT p.*, u.login as author_login, u.full_name as author_name
                FROM posts p
                JOIN users u ON p.author_id = u.id
                WHERE p.status = 'active' 
                AND p.publish_date BETWEEN ? AND ?
                ORDER BY p.publish_date DESC
                LIMIT ? OFFSET ?
            `;
            
            const result = await DB_connect.make_request(query, [startDate, endDate, limit, offset]);
            const rows = result[0];
            
            return rows.map(row => {
                const post = new Post(row);
                post.author_login = row.author_login;
                post.author_name = row.author_name;
                return post;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error finding posts by date range: ${error.message}`);
        }
    }

    static async get_all_with_filters(page = 1, limit = 10, sort = 'likes', filters = {}) 
    {
        try 
        {
            const offset = (page - 1) * limit;
            
            let count_query = `
                SELECT COUNT(DISTINCT p.id) as total
                FROM posts p
                JOIN users u ON p.author_id = u.id
                LEFT JOIN post_categories pc ON p.id = pc.post_id
                LEFT JOIN categories c ON pc.category_id = c.id
            `;
            
            let query = `
                SELECT 
                    p.id,
                    p.author_id,
                    p.title,
                    p.content,
                    p.status,
                    p.is_closed,
                    p.closed_at,
                    p.closed_reason,
                    p.publish_date,
                    p.created_at,
                    p.updated_at,
                    u.login as author_login,
                    u.full_name as author_name,
                    u.profile_picture as author_avatar,
                    GROUP_CONCAT(DISTINCT c.title SEPARATOR ',') as categories,
                    GROUP_CONCAT(DISTINCT c.title LIMIT 1) as category_title,
                    COALESCE(likes_data.likes_count, 0) as likes_count,
                    COALESCE(likes_data.dislikes_count, 0) as dislikes_count,
                    COALESCE(likes_data.likes_count, 0) - COALESCE(likes_data.dislikes_count, 0) as like_score,
                    COALESCE(comments_data.comments_count, 0) as comments_count,
                    COALESCE(views_data.view_count, 0) as view_count
                FROM posts p
                JOIN users u ON p.author_id = u.id
                LEFT JOIN post_categories pc ON p.id = pc.post_id
                LEFT JOIN categories c ON pc.category_id = c.id
                LEFT JOIN (
                    SELECT post_id,
                           SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) as likes_count,
                           SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END) as dislikes_count
                    FROM likes
                    WHERE post_id IS NOT NULL
                    GROUP BY post_id
                ) likes_data ON p.id = likes_data.post_id
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as comments_count
                    FROM comments
                    WHERE status = 'active'
                    GROUP BY post_id
                ) comments_data ON p.id = comments_data.post_id
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as view_count
                    FROM post_views
                    GROUP BY post_id
                ) views_data ON p.id = views_data.post_id
            `;
            
            const queryParams = [];
            const whereConditions = [];
            const joins = [];
            
            // status filter
            if(filters.status && filters.status !== null) 
                {
                whereConditions.push('p.status = ?');
                queryParams.push(filters.status);
            }

            // author filter
            if(filters.author) 
                {
                whereConditions.push('p.author_id = ?');
                queryParams.push(filters.author);
            }
            
            // categories filter (JOIN + WHERE clause)
            if(filters.categories && filters.categories.length > 0) {
                joins.push('JOIN post_categories pc ON p.id = pc.post_id');
                const categoryPlaceholders = filters.categories.map(() => '?').join(',');
                whereConditions.push(`pc.category_id IN (${categoryPlaceholders})`);
                queryParams.push(...filters.categories);
            }
            
            //date filter
            if (filters.date_from) 
                {
                whereConditions.push('p.publish_date >= ?');
                queryParams.push(filters.date_from);
            }
            
            if(filters.date_to) 
                {
                whereConditions.push('p.publish_date <= ?');
                queryParams.push(filters.date_to);
            }
            
            if(joins.length > 0) 
                {
                query += ' ' + joins.join(' ') + ' ';
                count_query += ' ' + joins.join(' ') + ' ';
            }

            // WHERE block
            if(whereConditions.length > 0) 
                {
                query += ' WHERE ' + whereConditions.join(' AND ');
                count_query += ' WHERE ' + whereConditions.join(' AND ');
            }
            
            const count_result = await DB_connect.make_request(count_query, queryParams);
            const total = count_result[0][0].total || 0;
            
            query += ' GROUP BY p.id';
            
            // sorting
            if(sort === 'likes') 
                {
                query += ' ORDER BY like_score DESC, p.publish_date DESC';
            } else if(sort === 'date') 
                {
                query += ' ORDER BY p.publish_date DESC';
            } else 
                {
                query += ' ORDER BY p.publish_date DESC';
            }
            
            query += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;
            
            const result = await DB_connect.make_request(query, queryParams);
            const rows = result[0];
            
            const posts = rows.map(row => {
                const post = new Post(row);
                post.author_login = row.author_login;
                post.author_name = row.author_name;
                post.author_avatar = normalize_avatar(row.author_avatar);
                post.category_title = row.category_title;
                post.likes_count = parseInt(row.likes_count) || 0;
                post.dislikes_count = parseInt(row.dislikes_count) || 0;
                post.like_score = parseInt(row.like_score) || 0;
                post.comments_count = parseInt(row.comments_count) || 0;
                post.view_count = parseInt(row.view_count) || 0;
                return post;
            });
            
            return { posts, total };
        } 
        catch(error) 
        {
            throw new Error(`Error getting posts with filters: ${error.message}`);
        }
    }

    static async get_full_post_data(post_id) 
    {
        try 
        {
            const query = `
                SELECT 
                    p.id,
                    p.author_id,
                    p.title,
                    p.content,
                    p.status,
                    p.is_closed,
                    p.closed_at,
                    p.closed_reason,
                    p.publish_date,
                    p.created_at,
                    p.updated_at,
                    u.login as author_login,
                    u.full_name as author_name,
                    u.profile_picture as author_avatar,
                    COALESCE(likes.like_count, 0) as like_count,
                    COALESCE(dislikes.dislike_count, 0) as dislike_count,
                    COALESCE(comments.comment_count, 0) as comment_count,
                    COALESCE(views.view_count, 0) as view_count,
                    GROUP_CONCAT(DISTINCT c.title) as categories
                FROM posts p
                LEFT JOIN users u ON p.author_id = u.id
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as like_count 
                    FROM likes 
                    WHERE type = 'like' AND post_id IS NOT NULL 
                    GROUP BY post_id
                ) likes ON p.id = likes.post_id
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as dislike_count 
                    FROM likes 
                    WHERE type = 'dislike' AND post_id IS NOT NULL 
                    GROUP BY post_id
                ) dislikes ON p.id = dislikes.post_id
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as comment_count 
                    FROM comments 
                    WHERE status = 'active' 
                    GROUP BY post_id
                ) comments ON p.id = comments.post_id
                LEFT JOIN (
                    SELECT post_id, COUNT(*) as view_count
                    FROM post_views
                    GROUP BY post_id
                ) views ON p.id = views.post_id
                LEFT JOIN post_categories pc ON p.id = pc.post_id
                LEFT JOIN categories c ON pc.category_id = c.id
                WHERE p.id = ?
                GROUP BY p.id, p.author_id, p.title, p.content, p.status, p.is_closed, p.closed_at, p.closed_reason, p.publish_date, p.created_at, p.updated_at, u.login, u.full_name, u.profile_picture, likes.like_count, dislikes.dislike_count, comments.comment_count, views.view_count
            `;
            
            const result = await DB_connect.make_request(query, [post_id]);
            const rows = result[0];
            
            if(rows.length === 0) return null;
            
            const post = rows[0];
            
            let blueprints = [];
            const blueprints_query = `
                SELECT id, blueprint_id, blueprint_title, blueprint_author, blueprint_url 
                FROM post_blueprints 
                WHERE post_id = ? 
                ORDER BY created_at DESC
            `;
            try 
            {
                const blueprints_result = await DB_connect.make_request(blueprints_query, [post_id]);
                blueprints = blueprints_result[0] || [];
            } catch(err) 
            {
                console.error('Error getting blueprints:', err);
            }
            
            return {
                id: post.id,
                author_id: post.author_id,
                title: post.title,
                content: post.content,
                status: post.status,
                is_closed: post.is_closed || false,
                closed_at: post.closed_at,
                closed_reason: post.closed_reason,
                publish_date: post.publish_date,
                created_at: post.created_at,
                updated_at: post.updated_at,
                author: 
                {
                    id: post.author_id,
                    login: post.author_login,
                    full_name: post.author_name,
                    profile_picture: normalize_avatar(post.author_avatar)
                },
                likes: 
                {
                    like_count: post.like_count,
                    dislike_count: post.dislike_count
                },
                stats: 
                {
                    comment_count: post.comment_count,
                    view_count: post.view_count,
                    like_score: post.like_count - post.dislike_count
                },
                categories: post.categories ? post.categories.split(',') : [],
                blueprints: blueprints
            };
        } 
        catch(error) 
        {
            throw new Error(`Error getting full post data: ${error.message}`);
        }
    }

    static async get_post_categories(post_id) 
    {
        try 
        {
            const query = `
                SELECT c.*
                FROM categories c
                JOIN post_categories pc ON c.id = pc.category_id
                WHERE pc.post_id = ?
            `;
            
            const result = await DB_connect.make_request(query, [post_id]);
            const rows = result[0];
            return rows;
        } 
        catch(error) 
        {
            throw new Error(`Error getting post categories: ${error.message}`);
        }
    }

    static async record_view(user_id, post_id) 
    {
        try 
        {
            const query = `
                INSERT INTO post_views (user_id, post_id)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE viewed_at = NOW()
            `;
            
            await DB_connect.make_request(query, [user_id, post_id]);
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error recording post view: ${error.message}`);
        }
    }

    // Get view count for a post
    static async get_view_count(post_id) 
    {
        try 
        {
            const query = `
                SELECT COUNT(*) as view_count 
                FROM post_views 
                WHERE post_id = ?
            `;
            
            const result = await DB_connect.make_request(query, [post_id]);
            const rows = result[0];
            
            return rows.length > 0 ? rows[0].view_count : 0;
        } 
        catch(error) 
        {
            throw new Error(`Error getting view count: ${error.message}`);
        }
    }

    // close post
    static async close_post(post_id, reason = 'closed') 
    {
        try 
        {
            const query = `
                UPDATE posts 
                SET is_closed = TRUE, closed_at = NOW(), closed_reason = ?
                WHERE id = ?
            `;
            
            await DB_connect.make_request(query, [reason, post_id]);
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error closing post: ${error.message}`);
        }
    }

    static async reopen_post(post_id) 
    {
        try 
        {
            const query = `
                UPDATE posts 
                SET is_closed = FALSE, closed_at = NULL, closed_reason = NULL
                WHERE id = ?
            `;
            
            await DB_connect.make_request(query, [post_id]);
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error reopening post: ${error.message}`);
        }
    }
}

export default Post;
