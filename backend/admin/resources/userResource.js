import dbConnect from '../../utils/dbConnect.js';
import bcrypt from 'bcrypt';

const user_resource = {
    resource: 
    {
        id: 'users',
       
        properties: 
        {
            id: { type: 'number', isId: true },
            login: { type: 'string', isRequired: true },
            password: { type: 'password', isVisible: { show: false, list: false } },
            full_name: { type: 'string', isRequired: true },
            email: { type: 'string', isRequired: true },
            profile_picture: { type: 'string' },
            rating: { type: 'number' },
            role: {

                type: 'string',
                availableValues: [
                    { value: 'user', label: 'Користувач' },
                    { value: 'admin', label: 'Адміністратор' }
                ]
            },
            email_verified: { type: 'boolean' },
            created_at: { type: 'datetime', isVisible: { edit: false } },
            updated_at: { type: 'datetime', isVisible: { edit: false } }
        }
    },
    options: 
    {
        navigation: 
        {
            name: 'Користувачі',
            icon: 'User'
        },
        titleProperty: 'full_name',
        listProperties: ['id', 'login', 'full_name', 'email', 'role', 'rating', 'created_at'],
        showProperties: ['id', 'login', 'full_name', 'email', 'profile_picture', 'rating', 'role', 'email_verified', 'created_at', 'updated_at'],
        editProperties: ['login', 'password', 'full_name', 'email', 'profile_picture', 'role', 'email_verified'],
        filterProperties: ['login', 'full_name', 'email', 'role'],
        actions: 
        {
            list: 
            {
                handler: async (request, response, context) => {
                    try 
                    {
                        const { page = 1, perPage = 10 } = request.query;
                        const offset = (page - 1) * perPage;
                        
                        const count_query = 'SELECT COUNT(*) as total FROM users';
                        const count_result = await dbConnect.query(count_query);
                        const total = count_result[0].total;
                        
                        const query = 'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?';
                        const users = await dbConnect.query(query, [parseInt(perPage), offset]);
                        
                        return {
                            records: users,
                            meta: 
                            {
                                total,
                                perPage: parseInt(perPage),
                                page: parseInt(page),
                                direction: 'desc',
                                sortBy: 'created_at'
                            }
                        };
                    } catch(error) 
                    {
                        console.error('Error fetching users:', error);
                        throw error;
                    }
                }
            },
            show: 
            {
                handler: async (request, response, context) => {
                    const { recordId: record_id } = request.params;
                    const query = 'SELECT * FROM users WHERE id = ?';
                    const users = await dbConnect.query(query, [record_id]);
                    return { record: users[0] || null };
                }
            },
            edit: 
            {
                handler: async (request, response, context) => {
                    const { recordId: record_id } = request.params;
                    const payload = request.payload;
                    
                    if(payload.password) payload.password = await bcrypt.hash(payload.password, 12);
                    
                    const fields = Object.keys(payload).join(' = ?, ') + ' = ?';
                    const values = [...Object.values(payload), record_id];
                    
                    const query = `UPDATE users SET ${fields}, updated_at = NOW() WHERE id = ?`;
                    await dbConnect.query(query, values);
                    
                    const updated_query = 'SELECT * FROM users WHERE id = ?';
                    const updated = await dbConnect.query(updated_query, [record_id]);
                    
                    return { record: updated[0] };
                }
            },
            new: 
            {
                handler: async (request, response, context) => {
                    const payload = request.payload;
                    
                    if(payload.password) payload.password = await bcrypt.hash(payload.password, 12);
                    
                    const fields = Object.keys(payload).join(', ');
                    const placeholders = Object.keys(payload).map(() => '?').join(', ');
                    const values = Object.values(payload);
                    
                    const query = `INSERT INTO users (${fields}, created_at, updated_at) VALUES (${placeholders}, NOW(), NOW())`;
                    const result = await dbConnect.query(query, values);
                    
                    const new_query = 'SELECT * FROM users WHERE id = ?';
                    const new_user = await dbConnect.query(new_query, [result.insertId]);
                    
                    return { record: new_user[0] };
                }
            },
            delete: 
            {
                handler: async (request, response, context) => {
                    const { recordId: record_id } = request.params;
                    const query = 'DELETE FROM users WHERE id = ?';
                    await dbConnect.query(query, [record_id]);
                    return { record: null };
                }
            }
        }
    }
};

export default user_resource;
