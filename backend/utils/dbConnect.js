import mysql from 'mysql2/promise';
import config from '../config.js';

class dbConnect 
{

    static async make_request(sql, values = null) 
    {
        try 
        {
            const connection = await this.connect_to_db();
            const [result] = await connection.execute(sql, values);
            await connection.end();

            return [result];
        } catch(err) 
        {
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
        try {
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

export default dbConnect;