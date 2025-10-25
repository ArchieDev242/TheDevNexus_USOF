import DB_connect from '../utils/dbConnect.js';

let status_enum_patched = false;

class Report 
{
    static async create(reporter_id, reported_type, reported_id, reason) {
        try 
        {
            const query = `
                INSERT INTO reports (reporter_id, reported_type, reported_id, reason, status)
                VALUES (?, ?, ?, ?, 'pending')
            `;
            
            const [result] = await DB_connect.make_request(query, [reporter_id, reported_type, reported_id, reason]);
            
            return {
                id: result.insertId,
                reporter_id,
                reported_type,
                reported_id,
                reason,
                status: 'pending',
                created_at: new Date()
            };
        } catch(error) 
        {
            throw error;
        }
    }

    // report by ID with full details
    static async find_by_id(report_id) 
    {
        try 
        {
            const query = `
                SELECT 
                    r.*,
                    u.login AS reporter_name,
                    u.profile_picture AS reporter_avatar
                FROM reports r
                LEFT JOIN users u ON r.reporter_id = u.id
                WHERE r.id = ?
            `;
            
            const [results] = await DB_connect.make_request(query, [report_id]);
            return results[0] || null;
        } catch(error) 
        {
            throw error;
        }
    }

    // get all reports (admin only)
    static async get_all(filter = {}, limit = 20, offset = 0) 
    {
        try 
        {
            let query = `
                SELECT 
                    r.*,
                    u.login AS reporter_name,
                    u.profile_picture AS reporter_avatar,
                    CASE 
                        WHEN r.reported_type = 'post' THEN p.title
                        WHEN r.reported_type = 'comment' THEN c.content
                        WHEN r.reported_type = 'user' THEN u2.login
                        ELSE 'Unknown'
                    END AS reported_content,
                    CASE
                        WHEN r.reported_type = 'post' THEN p.author_id
                        WHEN r.reported_type = 'comment' THEN c.author_id
                        WHEN r.reported_type = 'user' THEN r.reported_id
                        ELSE NULL
                    END AS reported_author_id
                FROM reports r
                LEFT JOIN users u ON r.reporter_id = u.id
                LEFT JOIN posts p ON r.reported_type = 'post' AND r.reported_id = p.id
                LEFT JOIN comments c ON r.reported_type = 'comment' AND r.reported_id = c.id
                LEFT JOIN users u2 ON r.reported_type = 'user' AND r.reported_id = u2.id
                WHERE 1=1
            `;

            const values = [];

            if(filter.status) 
                {
                query += ` AND r.status = ?`;
                values.push(filter.status);
            }

            if(filter.reported_type) 
            {
                query += ` AND r.reported_type = ?`;
                values.push(filter.reported_type);
            }

            query += ` ORDER BY r.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

            const [results] = await DB_connect.make_request(query, values);
            return results || [];
        } catch(error) 
        {
            throw error;
        }
    }

    //  report count by status
    static async get_count(status = null) 
    {
        try 
        {
            let query = `SELECT COUNT(*) as count FROM reports`;
            const values = [];

            if(status) 
                {
                query += ` WHERE status = ?`;
                values.push(status);
            }

            const [results] = await DB_connect.make_request(query, values);
            return results[0]?.count || 0;
        } catch(error) 
        {
            throw error;
        }
    }

    static async update_status(report_id, status, admin_notes = null) 
    {
        if(status === 'rejected')
            {
            await Report.ensure_rejected_status_enum();
        }

        const query = `
                UPDATE reports
                SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

        try 
        {
            const [result] = await DB_connect.make_request(query, [status, admin_notes, report_id]);
            return result.affectedRows > 0;
        } catch(error) 
        {
            const needs_enum_update = status === 'rejected' && (error.code === 'WARN_DATA_TRUNCATED' || error.errno === 1265 || error.sqlState === '01000');

            if(needs_enum_update) 
                {
                status_enum_patched = false;
                await Report.ensure_rejected_status_enum(true);
                const [retryResult] = await DB_connect.make_request(query, [status, admin_notes, report_id]);
                return retryResult.affectedRows > 0;
            }

            throw error;
        }
    }

    static async ensure_rejected_status_enum(force = false) 
    {
        if(status_enum_patched && !force) return;

        const has_rejected = await Report.status_enum_includes_rejected();
        if(has_rejected)
            {
            status_enum_patched = true;
            return;
        }

        const alter_query = `
            ALTER TABLE reports
            MODIFY COLUMN status ENUM('pending', 'resolved', 'dismissed', 'rejected') DEFAULT 'pending'
        `;

        await DB_connect.make_request(alter_query);

        const confirm = await Report.status_enum_includes_rejected();
        status_enum_patched = confirm;
    }

    static async status_enum_includes_rejected()
    {
        const show_query = `SHOW COLUMNS FROM reports LIKE 'status'`;
        const [rows] = await DB_connect.make_request(show_query);
        const column = rows && rows[0];
        const type = column?.Type || column?.type || '';
        return typeof type === 'string' && type.includes("'rejected'");
    }

    static async check_duplicate(reporter_id, reported_type, reported_id) 
    {
        try 
        {
            const query = `
                SELECT id FROM reports
                WHERE reporter_id = ? 
                AND reported_type = ? 
                AND reported_id = ?
                AND status NOT IN ('dismissed', 'rejected')
                LIMIT 1
            `;

            const [results] = await DB_connect.make_request(query, [reporter_id, reported_type, reported_id]);
            return results.length > 0;
        } catch(error) 
        {
            throw error;
        }
    }

    // delete report
    static async delete(report_id) 
    {
        try 
        {
            const query = `DELETE FROM reports WHERE id = ?`;
            const [result] = await DB_connect.make_request(query, [report_id]);
            return result.affectedRows > 0;
        } catch(error) 
        {
            throw error;
        }
    }

    static async get_by_reported(reported_type, reported_id) 
    {
        try 
        {
            const query = `
                SELECT 
                    r.*,
                    u.login AS reporter_name,
                    u.profile_picture AS reporter_avatar
                FROM reports r
                LEFT JOIN users u ON r.reporter_id = u.id
                WHERE r.reported_type = ? AND r.reported_id = ?
                ORDER BY r.created_at DESC
            `;

            const [results] = await DB_connect.make_request(query, [reported_type, reported_id]);
            return results || [];
        } catch(error) 
        {
            throw error;
        }
    }
}

export default Report;
