import dbConnect from '../../utils/dbConnect.js';

const post_resource = {
    resource: 
    {
        id: 'posts',
        properties: 
        {
            id: { type: 'number', isId: true },
            title: { type: 'string', isRequired: true },
            content: { type: 'richtext' },
            author_id: { type: 'reference', reference: 'users' },
            category_id: { type: 'reference', reference: 'categories' },
            status: 
            { 
                type: 'string',
                availableValues: [
                    { value: 'active', label: 'Активний' },
                    { value: 'inactive', label: 'Неактивний' }
                ]
            },
            created_at: { type: 'datetime', isVisible: { edit: false } },
            updated_at: { type: 'datetime', isVisible: { edit: false } }
        }
    },
    options: 
    {
        navigation: 
        {
            name: 'Пости',
            icon: 'FileText'
        },
        titleProperty: 'title',
        listProperties: ['id', 'title', 'author_id', 'category_id', 'status', 'created_at'],
        showProperties: ['id', 'title', 'content', 'author_id', 'category_id', 'status', 'created_at', 'updated_at'],
        editProperties: ['title', 'content', 'category_id', 'status'],
        filterProperties: ['title', 'author_id', 'category_id', 'status'],
        actions: 
        {
            list: 
            {
                handler: async (request, response, context) => {
                    try 
                    {
                        const { page = 1, perPage = 10 } = request.query;
                        const offset = (page - 1) * perPage;
                        
                        const count_query = 'SELECT COUNT(*) as total FROM posts';
                        const count_result = await dbConnect.query(count_query);
                        const total = count_result[0].total;
                        
                        const query = `
                            SELECT p.*, u.full_name as author_name, c.title as category_name 
                            FROM posts p 
                            LEFT JOIN users u ON p.author_id = u.id 
                            LEFT JOIN categories c ON p.category_id = c.id 
                            ORDER BY p.created_at DESC 
                            LIMIT ? OFFSET ?
                        `;
                        const posts = await dbConnect.query(query, [parseInt(perPage), offset]);
                        
                        return {
                            records: posts,
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
                        console.error('Error fetching posts:', error);
                        throw error;
                    }
                }
            },
            show: 
            {
                handler: async (request, response, context) => {
                    const { recordId: record_id } = request.params;
                    
                    const query = `
                        SELECT p.*, u.full_name as author_name, c.title as category_name 
                        FROM posts p 
                        LEFT JOIN users u ON p.author_id = u.id 
                        LEFT JOIN categories c ON p.category_id = c.id 
                        WHERE p.id = ?
                    `;

                    const posts = await dbConnect.query(query, [record_id]);
                    return { record: posts[0] || null };
                }
            },
            edit: 
            {
                handler: async (request, response, context) => {
                    const { recordId: record_id } = request.params;
                    const payload = request.payload;
                    
                    const fields = Object.keys(payload).join(' = ?, ') + ' = ?';
                    const values = [...Object.values(payload), record_id];
                    
                    const query = `UPDATE posts SET ${fields}, updated_at = NOW() WHERE id = ?`;
                    await dbConnect.query(query, values);
                    
                    const updated_query = 'SELECT * FROM posts WHERE id = ?';
                    const updated = await dbConnect.query(updated_query, [record_id]);
                    
                    return { record: updated[0] };
                }
            },
            delete: 
            {
                handler: async (request, response, context) => {
                    const { recordId } = request.params;
                    const query = 'DELETE FROM posts WHERE id = ?';
                    await dbConnect.query(query, [recordId]);
                    return { record: null };
                }
            }
        }
    }
};

export default post_resource;
