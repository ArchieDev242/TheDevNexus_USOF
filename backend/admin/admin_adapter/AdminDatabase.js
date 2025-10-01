import { BaseDatabase as base_database } from 'adminjs';
import DB_connect from '../../utils/dbConnect.js';
import AdminResource from './AdminResource.js';

class admin_database extends base_database 
{
    constructor(models = {}) 
    {
        super(models);
        this.models = models;
        this.resourceMap = {};
        Object.entries(models).forEach(([name, model]) => {
            this.resourceMap[name] = new AdminResource(model);
        });
    }

    static is_adapter_for(database) 
    {
        return !!(database && typeof database === 'object' && database.models);
    }

    resources() 
    {
        return Object.values(this.resourceMap);
    }

    resource(name) 
    {
        return this.resourceMap[name];
    }

    async is_connected() 
    {
        try 
        {
            await DB_connect.make_request('SELECT 1');
            return true;
        } catch(error) 
        {
            console.error('Database connection test failed:', error);
            return false;
        }
    }
}

export default admin_database;
