const database = require('./database');
const Permission = require('./Permission');

class Post 
{
    constructor(postData) 
    {
        this.id = postData?.id;
        this.author_id = postData?.author_id;
        this.title = postData?.title;
        this.content = postData?.content;
        this.status = postData?.status || 'active';
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
            
            const result = await database.query(query, [
                this.author_id,
                this.title,
                this.content,
                this.status
            ]);
            
            this.id = result.insertId;
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error creating post: ${error.message}`);
        }
    }

    // Методи для перевірки дозволів
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
            if (!user) return false;
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
            if (!user) return false;
            
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
            if (!user) return false;
            
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
            if (!user) return false;
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
                SELECT p.*, u.login as author_login, u.full_name as author_name
                FROM posts p
                JOIN users u ON p.author_id = u.id
                WHERE p.id = ?
            `;
            
            const rows = await database.query(query, [id]);
            
            if (rows.length === 0) return null;
            
            const post = new Post(rows[0]);
            post.author_login = rows[0].author_login;
            post.author_name = rows[0].author_name;
            
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
                SELECT p.*, u.login as author_login, u.full_name as author_name
                FROM posts p
                JOIN users u ON p.author_id = u.id
                WHERE p.status = 'active'
                ORDER BY p.publish_date DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.query(query, [limit, offset]);
            
            return rows.map(row => {
                const post = new Post(row);
                post.author_login = row.author_login;
                post.author_name = row.author_name;
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
                SELECT p.*, u.login as author_login, u.full_name as author_name
                FROM posts p
                JOIN users u ON p.author_id = u.id
                ORDER BY p.publish_date DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.query(query, [limit, offset]);
            
            return rows.map(row => {
                const post = new Post(row);
                post.author_login = row.author_login;
                post.author_name = row.author_name;
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
            
            const rows = await database.query(query, [authorId]);
            
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
            
            const rows = await database.query(query, [categoryId, limit, offset]);
            
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
            await database.query(query, values);
            
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
            await database.query(query, [this.id]);
            
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
            await database.query('DELETE FROM post_categories WHERE post_id = ?', [this.id]);
            
            if(categoryIds && categoryIds.length > 0) 
            {
                const values = categoryIds.map(categoryId => [this.id, categoryId]);
                const placeholders = values.map(() => '(?, ?)').join(', ');
                const flat_values = values.flat();
                
                const query = `INSERT INTO post_categories (post_id, category_id) VALUES ${placeholders}`;
                await database.query(query, flat_values);
            }
            
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error adding categories to post: ${error.message}`);
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
            `;
            
            const rows = await database.query(query, [this.id]);
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
            
            const rows = await database.query(query, [this.id]);
            
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
                SELECT p.*, u.login as author_login, u.full_name as author_name,
                       COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) - 
                       COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0) as like_score
                FROM posts p
                JOIN users u ON p.author_id = u.id
                LEFT JOIN likes l ON p.id = l.post_id
                WHERE p.status = 'active'
                GROUP BY p.id
                ORDER BY like_score DESC, p.publish_date DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.query(query, [limit, offset]);
            
            return rows.map(row => {
                const post = new Post(row);
                post.author_login = row.author_login;
                post.author_name = row.author_name;
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
            
            const rows = await database.query(query, [startDate, endDate, limit, offset]);
            
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
}

module.exports = Post;
