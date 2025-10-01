import mysql from 'mysql2/promise';
import config from '../config.js';

class DB_connect 
{

    static async make_request(sql, values = null) 
    {
        try 
        {
            const connection = await this.connect_to_db();
            let params;
            if(Array.isArray(values)) 
                {
                params = values;
            } else if(values === null || values === undefined) 
                {
                params = [];
            } else if(typeof values === 'object') 
                {
                params = values;
            } else 
                {
                params = [values];
            }
            const [rows, fields] = await connection.execute(sql, params);
            await connection.end();

            return [rows, fields];
        } catch(err) 
        {
            console.error('DB query error:', { sql, values, error: err.message });
            throw err;
        }
    }

    static async connect_to_db() 
    {
        const connection = await mysql.createConnection({
            host: config.database.host,
            user: config.database.user,
            password: config.database.password,
            database: config.database.database
        });
        
        return connection;
    }

    static async connect() 
    {
        try 
        {
            const connection = await this.connect_to_db();
            await connection.ping();
            await connection.end();
            return true;
        } catch(error) 
        {
            console.error('Database connection failed:', error);
            throw error;
        }
    }
}

export default DB_connect;