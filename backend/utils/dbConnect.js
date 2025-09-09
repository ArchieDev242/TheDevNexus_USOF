import mysql from 'mysql2/promise';
import config from '../config.json' with { type: 'json' };

class dbConnect {

    static async makeRequest(sql, values = null) 
    {
        try 
        {
            const connection = await this.connectToDataBase();
            const [result] = await connection.execute(sql, values);
            await connection.end();

            return [result];
        } catch(err) 
        {
            throw err;
        }
    }

    static async connectToDataBase() 
    {
        const connection = await mysql.createConnection({
            host: config.database.host,
            user: config.database.user,
            password: config.database.password,
            database: config.database.database
        });
        
        return connection;
    }
}

export default dbConnect;