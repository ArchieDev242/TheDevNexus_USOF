import dbConnect from '../../utils/dbConnect.js';

const category_resource = {
    resource: 
    {
        id: 'categories',
        properties: 
        {
            id: { type: 'number', isId: true },
            title: { type: 'string', isRequired: true },
            description: { type: 'textarea' },
            created_at: { type: 'datetime', isVisible: { edit: false } },
            updated_at: { type: 'datetime', isVisible: { edit: false } }
        }
    },
    options: 
    {
        navigation: 
        {
            name: 'Категорії',
            icon: 'Folder'
        },
        titleProperty: 'title',
        listProperties: ['id', 'title', 'description', 'created_at'],
        showProperties: ['id', 'title', 'description', 'created_at', 'updated_at'],
        editProperties: ['title', 'description'],
        filterProperties: ['title'],
        actions: 
        {
            list: 
            {
                handler: async (request, response, context) => {
                    try 
                    {
                        const { page = 1, perPage = 10 } = request.query;
                        const offset = (page - 1) * perPage;
                        
                        const count_query = 'SELECT COUNT(*) as total FROM categories';
                        const count_result = await dbConnect.query(count_query);
                        const total = count_result[0].total;
                        
                        const query = 'SELECT * FROM categories ORDER BY created_at DESC LIMIT ? OFFSET ?';
                        const categories = await dbConnect.query(query, [parseInt(perPage), offset]);
                        
                        return {
                            records: categories,
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
                        console.error('Error fetching categories:', error);
                        throw error;
                    }
                }
            },
            show: 
            {
                handler: async (request, response, context) => {
                    const { recordId: record_id } = request.params;
                    const query = 'SELECT * FROM categories WHERE id = ?';
                    const categories = await dbConnect.query(query, [record_id]);
                    return { record: categories[0] || null };
                }
            },
            edit: 
            {
                handler: async (request, response, context) => {
                    const { recordId: record_id } = request.params;
                    const payload = request.payload;
                    
                    const fields = Object.keys(payload).join(' = ?, ') + ' = ?';
                    const values = [...Object.values(payload), record_id];
                    
                    const query = `UPDATE categories SET ${fields}, updated_at = NOW() WHERE id = ?`;
                    await dbConnect.query(query, values);
                    
                    const updated_query = 'SELECT * FROM categories WHERE id = ?';
                    const updated = await dbConnect.query(updated_query, [record_id]);
                    
                    return { record: updated[0] };
                }
            },
            new: 
            {
                handler: async (request, response, context) => {
                    const payload = request.payload;
                    
                    const fields = Object.keys(payload).join(', ');
                    const placeholders = Object.keys(payload).map(() => '?').join(', ');
                    const values = Object.values(payload);
                    
                    const query = `INSERT INTO categories (${fields}, created_at, updated_at) VALUES (${placeholders}, NOW(), NOW())`;
                    const result = await dbConnect.query(query, values);
                    
                    const new_query = 'SELECT * FROM categories WHERE id = ?';
                    const new_category = await dbConnect.query(new_query, [result.insertId]);
                    
                    return { record: new_category[0] };
                }
            },
            delete: {
                handler: async (request, response, context) => {
                    const { recordId: record_id } = request.params;
                    const query = 'DELETE FROM categories WHERE id = ?';
                    await dbConnect.query(query, [record_id]);
                    return { record: null };
                }
            }
        }
    }
};

export default category_resource;
