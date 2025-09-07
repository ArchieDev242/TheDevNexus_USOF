const mysql = require('mysql2/promise');
const config = require('../config.json');

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
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');
const Category = require('./Category');
const Permission = require('./Permission');
const GuestSession = require('./GuestSession');

module.exports = {
    User,
    Post,
    Comment,
    Like,
    Category,
    Permission,
    GuestSession
};