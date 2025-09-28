import mysql from 'mysql2/promise';
import config from '../config.js';

class DataBase
{
    constructor()
    {
        this.connection = null;
    }

    async connect() 
    {
        try 
        {
            this.connection = await mysql.createConnection({
                host: config.database.host,
                user: config.database.user,
                password: config.database.password,
                database: config.database.dbName,
                timezone: 'Z'
            });
            
            console.log('Database connected successfully!');
        } 
        catch(error) 
        {
            console.error('Database connection failed:', error.message);
            throw error;
        }
    }

    async query(sql, params = []) 
    {
        try 
        {
            if(!this.connection) 
            {
                await this.connect();
            }
            
            const [rows] = await this.connection.execute(sql, params);
            return rows;
        } 
        catch(error) 
        {
            console.error('Database query error:', error.message);
            throw error;
        }
    }

    async close() 
    {
        if(this.connection) 
        {
            await this.connection.end();
            console.log('Database connection closed');
        }
    }
}

const database = new DataBase();

import User from './User.js';
import Post from './Post.js';
import Comment from './Comment.js';
import Like from './Like.js';
import Category from './Category.js';
import Permission from './Permission.js';
import GuestSession from './GuestSession.js';

export {
    database,
    User,
    Post,
    Comment,
    Like,
    Category,
    Permission,
    GuestSession
};