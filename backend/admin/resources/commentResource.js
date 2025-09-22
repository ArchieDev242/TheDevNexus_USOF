import dbConnect from '../../utils/dbConnect.js';

const comment_resource = {
    resource: 
    {
        id: 'comments',
        properties: 
        {
            id: { type: 'number', isId: true },
            content: { type: 'textarea', isRequired: true },
            author_id: { type: 'reference', reference: 'users' },
            post_id: { type: 'reference', reference: 'posts' },
            status: 
            { 
                type: 'string',
                availableValues: [
                    { value: 'active', label: 'Активний' },
                    { value: 'inactive', label: 'Неактивний' }
                ]
            },
            created_at: { type: 'datetime', isVisible: { edit: false } }
        }
    },
    options: 
    {
        navigation: 
        {
            name: 'Коментарі',
            icon: 'MessageSquare'
        },
        titleProperty: 'content',
        listProperties: ['id', 'content', 'author_id', 'post_id', 'status', 'created_at'],
        showProperties: ['id', 'content', 'author_id', 'post_id', 'status', 'created_at'],
        editProperties: ['status'],
        filterProperties: ['author_id', 'post_id', 'status'],
        actions: 
        {
            list: 
            {
                handler: async (request, response, context) => {
                    try 
                    {
                        const { page = 1, perPage = 10 } = request.query;
                        const offset = (page - 1) * perPage;
                        
                        const count_query = 'SELECT COUNT(*) as total FROM comments';
                        const count_result = await dbConnect.query(count_query);
                        const total = count_result[0].total;
                        
                        const query = `
                            SELECT c.*, u.full_name as author_name, p.title as post_title 
                            FROM comments c 
                            LEFT JOIN users u ON c.author_id = u.id 
                            LEFT JOIN posts p ON c.post_id = p.id 
                            ORDER BY c.created_at DESC 
                            LIMIT ? OFFSET ?
                        `;
                        const comments = await dbConnect.query(query, [parseInt(perPage), offset]);
                        
                        return {
                            records: comments,
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
                        console.error('Error fetching comments:', error);
                        throw error;
                    }
                }
            },
            show: 
            {
                handler: async (request, response, context) => {
                    const { recordId: record_id } = request.params;
                    
                    const query = `
                        SELECT c.*, u.full_name as author_name, p.title as post_title 
                        FROM comments c 
                        LEFT JOIN users u ON c.author_id = u.id 
                        LEFT JOIN posts p ON c.post_id = p.id 
                        WHERE c.id = ?
                    `;
                    
                    const comments = await dbConnect.query(query, [record_id]);
                    return { record: comments[0] || null };
                }
            },
            edit: 
            {
                handler: async (request, response, context) => {
                    const { recordId: record_id } = request.params;
                    const payload = request.payload;
                    
                    const query = 'UPDATE comments SET status = ? WHERE id = ?';
                    await dbConnect.query(query, [payload.status, record_id]);
                    
                    const updated_query = 'SELECT * FROM comments WHERE id = ?';
                    const updated = await dbConnect.query(updated_query, [record_id]);
                    
                    return { record: updated[0] };
                }
            },
            delete: 
            {
                handler: async (request, response, context) => {
                    const { recordId: record_id } = request.params;
                    const query = 'DELETE FROM comments WHERE id = ?';
                    await dbConnect.query(query, [record_id]);
                    return { record: null };
                }
            }
        }
    }
};

export default comment_resource;
