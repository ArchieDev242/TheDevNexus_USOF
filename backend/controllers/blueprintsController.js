import DB_connect from '../utils/dbConnect.js';
import error_handler from '../middleware/errorHandler.js';

class blueprints_controller 
{
    static async ensure_library_table()
    {
        await DB_connect.make_request(`
            CREATE TABLE IF NOT EXISTS blueprint_library(
                id INT PRIMARY KEY AUTO_INCREMENT,
                blueprint_id VARCHAR(255) NOT NULL UNIQUE,
                blueprint_title VARCHAR(255) NOT NULL,
                blueprint_author VARCHAR(255),
                blueprint_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
    }

    // GET /api/blueprints/search
    static async search(req, res)
    {
        try 
        {
            await blueprints_controller.ensure_library_table();
            const { query = '', limit = 10 } = req.query;
            
            const normalized_query = String(query || '').trim();

            if(!normalized_query)
            {
                return res.json({
                    status: 'success',
                    data: []
                });
            }

            const search_term = `%${normalized_query}%`;
            let parsed_limit = Number.parseInt(limit, 10);

            if(!Number.isFinite(parsed_limit) || parsed_limit <= 0)
            {
                parsed_limit = 10;
            }
            parsed_limit = Math.min(parsed_limit, 20);

            const query_string = `
                SELECT DISTINCT blueprint_id as id, blueprint_title as title, blueprint_author as author, blueprint_url as url
                FROM blueprint_library
                WHERE blueprint_title LIKE ? OR blueprint_author LIKE ?
                ORDER BY created_at DESC
                LIMIT ?`;

            const result = await DB_connect.make_request(
                query_string,
                [search_term, search_term, parsed_limit]
            );

            const rows = result[0] || [];
            res.json({
                status: 'success',
                data: rows
            });
        } 
        catch(error) 
        {
            throw error;
        }
    }

    // POST /api/blueprints
    static async create(req, res)
    {
        try 
        {
            await blueprints_controller.ensure_library_table();
            const { title, author, url, post_id } = req.body;
            const user_id = req.user?.id;

            if(!title || !title.trim())
            {
                throw error_handler.validation_error('Blueprint title is required');
            }

            const parsed_post_id = Number.parseInt(post_id, 10);
            const attach_to_post = Number.isInteger(parsed_post_id) && parsed_post_id > 0;

            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substr(2, 5);
            const blueprint_id = `${timestamp}${random}`;

            const author_value = (author && String(author).trim()) || req.user?.login || (user_id ? `user:${user_id}` : null);
            const url_value = url && String(url).trim() ? String(url).trim() : null;

            await DB_connect.make_request(
                `INSERT INTO blueprint_library (blueprint_id, blueprint_title, blueprint_author, blueprint_url)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                    blueprint_title = VALUES(blueprint_title),
                    blueprint_author = VALUES(blueprint_author),
                    blueprint_url = VALUES(blueprint_url)`,
                [blueprint_id, title.trim(), author_value, url_value]
            );

            if(attach_to_post)
            {
                await DB_connect.make_request(
                    `INSERT INTO post_blueprints (post_id, blueprint_id, blueprint_title, blueprint_author, blueprint_url)
                     VALUES (?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE 
                        blueprint_title = VALUES(blueprint_title),
                        blueprint_author = VALUES(blueprint_author),
                        blueprint_url = VALUES(blueprint_url)`,
                    [parsed_post_id, blueprint_id, title.trim(), author_value, url_value]
                );
            }

            res.status(201).json({
                status: 'success',
                message: 'Blueprint created successfully',
                data: {
                    id: blueprint_id,
                    title: title.trim(),
                    author: author_value,
                    url: url_value
                }
            });
        }
        catch(error)
        {
            throw error;
        }
    }

    // GET /api/blueprints/:blueprint_id
    static async get_by_id(req, res)
    {
        try 
        {
            const { blueprint_id } = req.params;

            const result = await DB_connect.make_request(
                `SELECT * FROM post_blueprints WHERE blueprint_id = ? LIMIT 1`,
                [blueprint_id]
            );

            const rows = result[0];
            if(!rows || rows.length === 0) throw error_handler.not_found_error('Blueprint'); 

            const blueprint = rows[0];
            res.json({
                status: 'success',
                data: {
                    id: blueprint.blueprint_id,
                    title: blueprint.blueprint_title,
                    author: blueprint.blueprint_author,
                    url: blueprint.blueprint_url,
                    created_at: blueprint.created_at
                }
            });
        }
        catch(error)
        {
            throw error;
        }
    }

    // DELETE /api/blueprints/:blueprint_id
    static async delete_blueprint(req, res)
    {
        try 
        {
            const { blueprint_id } = req.params;
            const user_id = req.user?.id;

            const result = await DB_connect.make_request(
                `SELECT * FROM post_blueprints WHERE blueprint_id = ? LIMIT 1`,
                [blueprint_id]
            );

            const rows = result[0];
            if(!rows || rows.length === 0) throw error_handler.not_found_error('Blueprint');

            if(req.user?.role !== 'admin' && rows[0].blueprint_author !== user_id) throw error_handler.forbidden_error('You cannot delete this blueprint');

            await DB_connect.make_request(
                `DELETE FROM post_blueprints WHERE blueprint_id = ?`,
                [blueprint_id]
            );

            res.json({
                status: 'success',
                message: 'Blueprint deleted successfully'
            });
        }
        catch(error)
        {
            throw error;
        }
    }

    // GET /api/blueprints/popular
    static async get_popular(req, res)
    {
        try 
        {
            const { limit = 10 } = req.query;

            const result = await DB_connect.make_request(
                `SELECT blueprint_id as id, blueprint_title as title, blueprint_author as author, blueprint_url as url, COUNT(*) as usage_count
                 FROM post_blueprints
                 WHERE blueprint_id IS NOT NULL
                 GROUP BY blueprint_id
                 ORDER BY usage_count DESC
                 LIMIT ?`,
                [parseInt(limit)]
            );

            const rows = result[0] || [];
            res.json({
                status: 'success',
                data: rows
            });
        }
        catch(error)
        {
            throw error;
        }
    }
}

export default blueprints_controller;
