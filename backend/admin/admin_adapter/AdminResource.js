import { BaseRecord, BaseResource as base_resource, BaseProperty as base_property } from 'adminjs';
import DB_connect from '../../utils/dbConnect.js';

const map_type = (type = 'string') => {
    switch(type) 
    {
        case 'number':
        case 'float': return 'number';
        case 'boolean': return 'boolean';
        case 'date':
        case 'datetime': return type;
        case 'richtext': return 'richtext';
        case 'password': return 'password';
        default: return 'string';
    }
};

class admin_property extends base_property 
{
    constructor({ path, primaryKey, options = {}, position }) {
        super({
            path,
            type: map_type(options.type),
            isId: path === primaryKey,
            isSortable: options.isSortable !== false,
            position
        });
        this.options = options;
    }

    is_title() 
    {
        if(typeof this.options.isTitle === 'boolean') return this.options.isTitle;

        return super.is_title();
    }

    is_required() 
    {
        return !!this.options.required;
    }

    available_values() 
    {
        if(!this.options.availableValues) return null;

        return this.options.availableValues.map((option) => ({
            value: option.value,
            label: String(option.label ?? option.value ?? '')
        }));
    }

    reference() 
    {
        return this.options.reference || null;
    }
}

class admin_resource extends base_resource 
{
    constructor(model) 
    {
        super(model.tableName);
        this.model = model;
        this.tableName = model.tableName;
        this.primaryKey = model.primaryKey || 'id';
        this.database = model.database || 'MySQL_NoORM';
        this.propertyMap = new Map();
        this.propertiesList = Object.entries(model.properties || {}).map(([key, options], index) => {
            const property = new admin_property({
                path: key,
                primaryKey: this.primaryKey,
                options,
                position: options?.position ?? index + 1
            });
            this.propertyMap.set(key, property);
            return property;
        });
        
    }

    static isAdapterFor(model) 
    {
        return !!(model && model.tableName && model.properties);
    }

    database_name() 
    {
        return this.database;
    }

    databaseName() 
    {
        return this.database_name();
    }

    database_type() 
    {
        return 'mysql';
    }

    databaseType() 
    {
        return this.database_type();
    }

    name() 
    {
        return this.model.name || this.tableName;
    }

    id() 
    {
        return this.tableName;
    }

    properties() 
    {
        return this.propertiesList;
    }

    property(path) 
    {
        const property = this.propertyMap.get(path);
        return property || null;
    }

    build(params) 
    {
        return new BaseRecord(params, this);
    }

    async count(filter) 
    {
        const { whereClause, params } = this.build_where(filter);
        const query = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
        const [rows] = await DB_connect.make_request(query, params);
        return rows[0]?.total || 0;
    }

    async find(filter = null, options = {}) 
    {
        const { limit = 20, offset = 0, sort = {} } = options;
        const { whereClause, params } = this.build_where(filter);
        const order_clause = this.build_order(sort);

        const sanitized_limit = Number.isFinite(Number(limit)) ? Math.max(0, Number(limit)) : 20;
        const sanitized_offset = Number.isFinite(Number(offset)) ? Math.max(0, Number(offset)) : 0;

        const query = `
            SELECT * FROM ${this.tableName}
            ${whereClause}
            ${order_clause}
            LIMIT ${sanitized_limit} OFFSET ${sanitized_offset}
        `;
        const [rows] = await DB_connect.make_request(query, params);
        return rows.map((row) => this.build(row));
    }

    async find_one(id) 
    {
        const query = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = ? LIMIT 1`;
        const [rows] = await DB_connect.make_request(query, [id]);

        if(!rows.length) return null;

        return this.build(rows[0]);
    }

    async findOne(id) 
    {
        return this.find_one(id);
    }

    async find_many(ids = []) 
    {
        if(!ids.length) return [];

        const placeholders = ids.map(() => '?').join(', ');
        const query = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} IN (${placeholders})`;
        const [rows] = await DB_connect.make_request(query, ids);
        return rows.map((row) => this.build(row));
    }

    async findMany(ids = []) 
    {
        return this.find_many(ids);
    }

    async create(params) 
    {
        const fields = Object.keys(params);
        if(!fields.length) throw new Error('No data provided');

        const values = Object.values(params);
        const placeholders = fields.map(() => '?').join(', ');
        const query = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
        const [result] = await DB_connect.make_request(query, values);
        const insert_id = result.insertId;
        const record = await this.find_one(insert_id);
        return record?.params || { [this.primaryKey]: insert_id, ...params };
    }

    async update(id, params) 
    {
        const payload = { ...params };
        delete payload[this.primaryKey];
        const fields = Object.keys(payload);
        if(!fields.length) 
            {
            const record = await this.find_one(id);
            return record?.params || null;
        }

        const set_clause = fields.map((field) => `${field} = ?`).join(', ');
        const values = [...fields.map((field) => payload[field]), id];
        const query = `UPDATE ${this.tableName} SET ${set_clause} WHERE ${this.primaryKey} = ?`;
        await DB_connect.make_request(query, values);
        const record = await this.find_one(id);
        return record?.params || null;
    }

    async delete(id) 
    {
        const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
        await DB_connect.make_request(query, [id]);
    }

    build_where(filter) 
    {
        if(!filter || !filter.filters) return { whereClause: '', params: [] };

        const clauses = [];
        const params = [];
        Object.values(filter.filters).forEach((filterItem) => {
            const { property, value } = filterItem;
            
            if(value === undefined || value === null || value === '') return;

            if(!property) return;

            const column = property.path();
            const type = property.type();
            const available_values = property.availableValues();

            if(typeof value === 'object' && (type === 'date' || type === 'datetime')) 
                {
                if(value.from) 
                    {
                    clauses.push(`${column} >= ?`);
                    params.push(value.from);
                }

                if(value.to) 
                    {
                    clauses.push(`${column} <= ?`);
                    params.push(value.to);
                }
            } else if(type === 'string' && !available_values) 
                {
                clauses.push(`${column} LIKE ?`);
                params.push(`%${value}%`);
            } else 
                {
                clauses.push(`${column} = ?`);
                params.push(value);
            }
        });

        if(!clauses.length) return { whereClause: '', params: [] };

        return {
            whereClause: `WHERE ${clauses.join(' AND ')}`,
            params
        };
    }

    build_order(sort = {}) 
    {
        if(!sort.sortBy) return `ORDER BY ${this.primaryKey} DESC`;

        const direction = sort.direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        return `ORDER BY ${sort.sortBy} ${direction}`;
    }
}

export default admin_resource;
