export const user_model = {
    tableName: 'users',
    primaryKey: 'id',
    properties: 
    {
        id: { type: 'number', isId: true },
        login: { type: 'string', required: true, isTitle: true },
        password: { type: 'password', required: true },
        full_name: { type: 'string', required: true },
        email: { type: 'string', required: true },
        profile_picture: { type: 'string' },
        rating: { type: 'number' },
        reputation_score: { type: 'number' },
        is_toxic: { type: 'boolean' },
        role: 
        { 
            type: 'string', 
            availableValues: [
                { value: 'guest', label: 'Guest (Гість)' },
                { value: 'user', label: 'User (Користувач)' },
                { value: 'admin', label: 'Admin (Адміністратор)' }
            ]
        },
        email_verified: { type: 'boolean' },
        verification_token: { type: 'string' },
        reset_token_hash: { type: 'string' },
        reset_token_expires_at: { type: 'datetime' },
        password_changed_at: { type: 'datetime' },
        reset_token: { type: 'string' },
        created_at: { type: 'datetime' },
        updated_at: { type: 'datetime' }
    }
};

export const post_model = {
    tableName: 'posts',
    primaryKey: 'id',
    properties: 
    {
        id: { type: 'number', isId: true },
        author_id: { type: 'number', required: true },
        title: { type: 'string', required: true, isTitle: true },
        content: { type: 'richtext', required: true },
        status: 
        { 
            type: 'string',
            availableValues: [
                { value: 'active', label: 'Active (Активний)' },
                { value: 'inactive', label: 'Inactive (Неактивний)' }
            ]
        },
        publish_date: { type: 'datetime' },
        created_at: { type: 'datetime' },
        updated_at: { type: 'datetime' }
    }
};

export const comment_model = {
    tableName: 'comments',
    primaryKey: 'id',
    properties: 
    {
        id: { type: 'number', isId: true },
        post_id: { type: 'number', required: true },
        author_id: { type: 'number', required: true },
        parent_comment_id: { type: 'number' },
        content: { type: 'richtext', required: true, isTitle: true },
        status: 
        { 
            type: 'string',
            availableValues: [
                { value: 'active', label: 'Active (Активний)' },
                { value: 'inactive', label: 'Неactive (Неактивний)' }
            ]
        },
        publish_date: { type: 'datetime' },
        created_at: { type: 'datetime' },
        updated_at: { type: 'datetime' }
    }
};

export const category_model = {
    tableName: 'categories',
    primaryKey: 'id',
    properties: 
    {
        id: { type: 'number', isId: true },
        title: { type: 'string', required: true, isTitle: true },
        description: { type: 'richtext', required: true },
        created_at: { type: 'datetime' },
        updated_at: { type: 'datetime' }
    }
};

export const achievement_model = {
    tableName: 'achievements',
    primaryKey: 'id',
    properties: 
    {
        id: { type: 'number', isId: true },
        key_name: { type: 'string', required: true },
        title: { type: 'string', required: true, isTitle: true },
        description: { type: 'richtext', required: true },
        icon: { type: 'string', required: true },
        points: { type: 'number' },
        is_active: { type: 'boolean' },
        created_at: { type: 'datetime' }
    }
};

export const like_model = {
    tableName: 'likes',
    primaryKey: 'id',
    properties: 
    {
        id: { type: 'number', isId: true },
        author_id: { type: 'number', required: true },
        post_id: { type: 'number' },
        comment_id: { type: 'number' },
        type: { 
            type: 'string',
            availableValues: [
                { value: 'like', label: 'Like (Лайк)' },
                { value: 'dislike', label: 'Dislike (Дизлайк)' },
                { value: 'thanks', label: 'Thanks (Подяка)' }
            ]
        },
        publish_date: { type: 'datetime' }
    }
};
