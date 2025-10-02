import { BaseDatabase as base_database } from 'adminjs';
import DB_connect from '../../utils/dbConnect.js';
import admin_resource from './AdminResource.js';

class admin_database extends base_database 
{
    constructor(models = {}) 
    {
        super();
        this.models = models;
        this.resourceMap = {};
    }

    static isAdapterFor(database) 
    {
        return !!(database && typeof database === 'object' && database.models);
    }

    static is_adapter_for(database) 
    {
        return this.isAdapterFor(database);
    }

    resources() 
    {
        Object.entries(this.models).forEach(([name, model]) => {
            if(!this.resourceMap[name]) 
                {
                this.resourceMap[name] = new admin_resource(model);
            }
        });

        return Object.values(this.resourceMap);
    }

    resource(name) 
    {
        if(!this.resourceMap[name] && this.models[name]) 
            {
            this.resourceMap[name] = new admin_resource(this.models[name]);
        }

        return this.resourceMap[name] || null;
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
