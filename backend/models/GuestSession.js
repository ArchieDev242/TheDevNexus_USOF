import DB_connect from '../utils/dbConnect.js';

class GuestSession 
{
    constructor(sessionData) 
    {
        this.id = sessionData?.id;
        this.session_token = sessionData?.session_token;
        this.ip_address = sessionData?.ip_address;
        this.user_agent = sessionData?.user_agent;
        this.created_at = sessionData?.created_at;
        this.last_activity = sessionData?.last_activity;
    }

    async create() 
    {
        try 
        {
            const query = `
                INSERT INTO guest_sessions (session_token, ip_address, user_agent)
                VALUES (?, ?, ?)
            `;
            
            const result = await DB_connect.make_request(query, [
                this.session_token,
                this.ip_address,
                this.user_agent
            ]);
            
            this.id = result[0].insertId;
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error creating guest session: ${error.message}`);
        }
    }

    static async find_by_token(token) 
    {
        try 
        {
            const query = 'SELECT * FROM guest_sessions WHERE session_token = ?';
            const result = await DB_connect.make_request(query, [token]);
            const rows = result[0];
            
            if(rows.length === 0) return null;
            
            return new GuestSession(rows[0]);
        } 
        catch(error) 
        {
            throw new Error(`Error finding guest session by token: ${error.message}`);
        }
    }

    static async find_by_id(id) 
    {
        try 
        {
            const query = 'SELECT * FROM guest_sessions WHERE id = ?';
            const result = await DB_connect.make_request(query, [id]);
            const rows = result[0];
            
            if(rows.length === 0) return null;
            
            return new GuestSession(rows[0]);
        } 
        catch(error) 
        {
            throw new Error(`Error finding guest session by ID: ${error.message}`);
        }
    }

    async update_activity() 
    {
        try 
        {
            const query = 'UPDATE guest_sessions SET last_activity = CURRENT_TIMESTAMP WHERE id = ?';
            await DB_connect.make_request(query, [this.id]);
            
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error updating guest session activity: ${error.message}`);
        }
    }

    async delete() 
    {
        try 
        {
            const query = 'DELETE FROM guest_sessions WHERE id = ?';
            await DB_connect.make_request(query, [this.id]);
            
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error deleting guest session: ${error.message}`);
        }
    }

    static async cleanup_old_sessions(hours = 24) 
    {
        try 
        {
            const query = `
                DELETE FROM guest_sessions 
                WHERE last_activity < DATE_SUB(NOW(), INTERVAL ? HOUR)
            `;
            
            const result = await DB_connect.make_request(query, [hours]);
            const rows = result[0];
            return result[0].affectedRows;
        } 
        catch(error) 
        {
            throw new Error(`Error cleaning up old guest sessions: ${error.message}`);
        }
    }

    static async get_active_sessions_count() 
    {
        try 
        {
            const query = `
                SELECT COUNT(*) as count 
                FROM guest_sessions 
                WHERE last_activity > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `;
            
            const result = await DB_connect.make_request(query);
            const rows = result[0];
            return rows[0].count;
        } 
        catch(error) 
        {
            throw new Error(`Error getting active sessions count: ${error.message}`);
        }
    }

    static generate_token() 
    {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15) + 
               Date.now().toString(36);
    }

    static async create_new_session(ipAddress, userAgent) 
    {
        try 
        {
            const token = this.generate_token();
            
            const session = new GuestSession({
                session_token: token,
                ip_address: ipAddress,
                user_agent: userAgent
            });
            
            await session.create();
            return session;
        } 
        catch(error) 
        {
            throw new Error(`Error creating new guest session: ${error.message}`);
        }
    }

    is_expired(hours = 24) 
    {
        if(!this.last_activity) return true;
        
        const expireTime = new Date(this.last_activity);
        expireTime.setHours(expireTime.getHours() + hours);
        
        return new Date() > expireTime;
    }
}

export default GuestSession;
