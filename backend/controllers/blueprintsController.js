import DB_connect from '../utils/dbConnect.js';
import error_handler from '../middleware/errorHandler.js';

class blueprints_controller 
{
    // GET /api/blueprints/search
    static async search(req, res)
    {
        try 
        {
            const { query = '', limit = 10 } = req.query;
            
            if(!query.trim())
            {
                return res.json({
                    status: 'success',
                    data: []
                });
            }

            const search_term = `%${query}%`;
            const result = await DB_connect.make_request(
                `SELECT DISTINCT blueprint_id as id, blueprint_title as title, blueprint_author as author, blueprint_url as url
                 FROM post_blueprints 
                 WHERE blueprint_title LIKE ? OR blueprint_author LIKE ?
                 ORDER BY id DESC
                 LIMIT ?`,
                [search_term, search_term, parseInt(limit)]
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
            const { title, author, url } = req.body;
            const user_id = req.user?.id;

            if(!title || !title.trim())
            {
                throw error_handler.validation_error('Blueprint title is required');
            }

            // Generate unique blueprint ID - simpler format
            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substr(2, 5);
            const blueprint_id = `${timestamp}${random}`;

            const result = await DB_connect.make_request(
                `INSERT INTO post_blueprints (blueprint_id, blueprint_title, blueprint_author, blueprint_url)
                 VALUES (?, ?, ?, ?)`,
                [blueprint_id, title.trim(), author || user_id, url || null]
            );

            res.status(201).json({
                status: 'success',
                message: 'Blueprint created successfully',
                data: {
                    id: blueprint_id,
                    title: title.trim(),
                    author: author || user_id,
                    url: url || null
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
            if(!rows || rows.length === 0)
            {
                throw error_handler.not_found_error('Blueprint');
            }

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

            // Check if user is admin or created this blueprint
            const result = await DB_connect.make_request(
                `SELECT * FROM post_blueprints WHERE blueprint_id = ? LIMIT 1`,
                [blueprint_id]
            );

            const rows = result[0];
            if(!rows || rows.length === 0)
            {
                throw error_handler.not_found_error('Blueprint');
            }

            // Only admin or creator can delete
            if(req.user?.role !== 'admin' && rows[0].blueprint_author !== user_id)
            {
                throw error_handler.forbidden_error('You cannot delete this blueprint');
            }

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
