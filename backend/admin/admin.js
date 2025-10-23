import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import config from '../config.js';
import bcrypt from 'bcrypt';
import DB_connect from '../utils/dbConnect.js';
import admin_database from './admin_adapter/AdminDatabase.js';
import admin_resource from './admin_adapter/AdminResource.js';
import {
    user_model,
    post_model,
    comment_model,
    category_model,
    achievement_model,
    like_model
} from './models/index.js';

AdminJS.registerAdapter({
    Database: admin_database,
    Resource: admin_resource,
});

const build_resource_options = (model, baseOptions = {}) => {
    const enum_props = Object.entries(model.properties || {}).reduce((acc, [key, definition]) => {
        if(Array.isArray(definition.availableValues)) 
            {
            acc[key] = {
                ...(acc[key] || {}),
                availableValues: definition.availableValues.map((item) => ({
                    value: item.value,
                    label: String(item.label ?? item.value ?? '')
                }))
            };
        }
        return acc;
    }, {});

    const base_props = baseOptions.properties || {};
    const merged_props = { ...enum_props };

    Object.entries(base_props).forEach(([key, value]) => {
        merged_props[key] = {
            ...(merged_props[key] || {}),
            ...value
        };
    });

    return {
        ...baseOptions,
        properties: merged_props
    };
};

const adminJS_config = {
    databases: [],
    resources: [
        {
            resource: user_model,
            options: build_resource_options(user_model, {
                listProperties: ['id', 'login', 'full_name', 'email', 'role', 'email_verified', 'created_at'],
                filterProperties: ['login', 'email', 'role', 'email_verified'],
                editProperties: ['login', 'full_name', 'email', 'role', 'email_verified'],
                showProperties: ['id', 'login', 'full_name', 'email', 'profile_picture', 'rating', 'role', 'email_verified', 'created_at', 'updated_at'],
                properties: {
                    password: { isVisible: false },
                    verification_token: { isVisible: false },
                    reset_token: { isVisible: false },
                    reset_token_hash: { isVisible: false },
                    reset_token_expires_at: { isVisible: false },
                    password_changed_at: { isVisible: false }
                },
                actions: {
                    edit: {
                        isAccessible: true,
                        before: async (request) => {
                            if(request.payload?.password && request.payload.password.trim() !== '') {
                                request.payload.password = await bcrypt.hash(request.payload.password, 12);
                            } else {
                                delete request.payload.password;
                            }
                            return request;
                        }
                    },
                    new: {
                        isAccessible: true,
                        before: async (request) => {
                            if(request.payload?.password) {
                                request.payload.password = await bcrypt.hash(request.payload.password, 12);
                            }
                            return request;
                        }
                    }
                }
            })
        },
        {
            resource: post_model,
            options: build_resource_options(post_model, {
                listProperties: ['id', 'title', 'author_id', 'status', 'publish_date', 'rating'],
                filterProperties: ['title', 'author_id', 'status'],
                editProperties: ['title', 'content', 'status'],
                showProperties: ['id', 'title', 'content', 'author_id', 'status', 'publish_date', 'rating', 'created_at', 'updated_at']
            })
        },
        {
            resource: comment_model,
            options: build_resource_options(comment_model, {
                listProperties: ['id', 'content', 'author_id', 'post_id', 'status', 'publish_date'],
                filterProperties: ['author_id', 'post_id', 'status'],
                editProperties: ['content', 'status'],
                showProperties: ['id', 'content', 'author_id', 'post_id', 'parent_comment_id', 'status', 'publish_date', 'created_at', 'updated_at']
            })
        },
        {
            resource: category_model,
            options: build_resource_options(category_model, {
                listProperties: ['id', 'title', 'description', 'created_at'],
                filterProperties: ['title'],
                editProperties: ['title', 'description'],
                showProperties: ['id', 'title', 'description', 'created_at', 'updated_at']
            })
        },
        {
            resource: achievement_model,
            options: build_resource_options(achievement_model, {
                listProperties: ['id', 'title', 'key_name', 'points', 'is_active', 'created_at'],
                filterProperties: ['title', 'key_name', 'is_active'],
                editProperties: ['title', 'description', 'key_name', 'icon', 'points', 'is_active'],
                showProperties: ['id', 'title', 'description', 'key_name', 'icon', 'points', 'is_active', 'created_at', 'updated_at']
            })
        },
        {
            resource: like_model,
            options: build_resource_options(like_model, {
                listProperties: ['id', 'author_id', 'post_id', 'comment_id', 'type', 'created_at'],
                filterProperties: ['author_id', 'post_id', 'comment_id', 'type'],
                editProperties: ['type'],
                showProperties: ['id', 'author_id', 'post_id', 'comment_id', 'type', 'created_at']
            })
        }
    ],
    pages: {
        'dashboard': {
            label: 'Dashboard',
            handler: async (request, response, context) => {
                try 
                {
                    const user_count = await DB_connect.make_request('SELECT COUNT(*) as count FROM users');
                    const post_count = await DB_connect.make_request('SELECT COUNT(*) as count FROM posts');
                    const comment_count = await DB_connect.make_request('SELECT COUNT(*) as count FROM comments');
                    const achievement_count = await DB_connect.make_request('SELECT COUNT(*) as count FROM achievements');
                    
                    return {
                        text: `
                            <div style="padding: 20px; font-family: Arial, sans-serif;">
                                <h1 style="color: #333; margin-bottom: 30px;">📊 USOF Admin Dashboard</h1>
                                
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                                        <h3 style="margin: 0; font-size: 18px;">👥 Users</h3>
                                        <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">${user_count[0].count}</p>
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                                        <h3 style="margin: 0; font-size: 18px;">📝 Posts</h3>
                                        <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">${post_count[0].count}</p>
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                                        <h3 style="margin: 0; font-size: 18px;">💬 Comments</h3>
                                        <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">${comment_count[0].count}</p>
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                                        <h3 style="margin: 0; font-size: 18px;">🏆 Achievements</h3>
                                        <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">${achievement_count[0].count}</p>
                                    </div>
                                </div>
                                
                                <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #e0e0e0;">
                                    <h3 style="color: #333; margin-top: 0;">ℹ️ System Information</h3>
                                    <ul style="list-style: none; padding: 0;">
                                        <li style="margin: 10px 0;"><strong>Database:</strong> MySQL (Custom Adapter)</li>
                                        <li style="margin: 10px 0;"><strong>AdminJS Version:</strong> ${AdminJS.VERSION}</li>
                                        <li style="margin: 10px 0;"><strong>Node.js Version:</strong> ${process.version}</li>
                                        <li style="margin: 10px 0;"><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
                                    </ul>
                                </div>
                                
                                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
                                    <h3 style="color: #333; margin-top: 0;">🚀 Quick Actions</h3>
                                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                        <a href="/admin/resources/User" style="background: #007bff; color: white; padding: 10px 15px; border-radius: 5px; text-decoration: none;">Manage Users</a>
                                        <a href="/admin/resources/Post" style="background: #28a745; color: white; padding: 10px 15px; border-radius: 5px; text-decoration: none;">Manage Posts</a>
                                        <a href="/admin/resources/Comment" style="background: #17a2b8; color: white; padding: 10px 15px; border-radius: 5px; text-decoration: none;">Manage Comments</a>
                                        <a href="/admin/resources/Achievement" style="background: #ffc107; color: black; padding: 10px 15px; border-radius: 5px; text-decoration: none;">Manage Achievements</a>
                                    </div>
                                </div>
                            </div>
                        `
                    };
                } catch(error) 
                {
                    console.error('Dashboard error:', error);
                    return {
                        text: `
                            <div style="padding: 20px;">
                                <h1>Dashboard Error</h1>
                                <p>Failed to load dashboard data: ${error.message}</p>
                            </div>
                        `
                    };
                }
            }
        }
    },
    branding: 
    {
        companyName: 'USOF Admin',
        logo: false,
        theme: 
        {
            colors: 
            {
                primary100: '#667eea',
                primary80: '#764ba2',
                primary60: '#f093fb',
                primary40: '#f5576c',
                primary20: '#4facfe'
            }
        }
    },
    locale: 
    {
        language: 'en',
        availableLanguages: ['en', 'ua'],
        translations: 
        {
            labels: 
            {
                User: 'Users',
                Post: 'Posts',
                Comment: 'Comments', 
                Category: 'Categories',
                Achievement: 'Achievements',
                Like: 'Likes'
            },
            properties: 
            {
                id: 'ID',
                login: 'Login',
                full_name: 'Full name',
                email: 'Email',
                password: 'Password',
                role: 'Role',
                email_verified: 'Email verified',
                created_at: 'Created at',
                updated_at: 'Updated at',
                title: 'Title',
                content: 'Content',
                author_id: 'Author ID',
                post_id: 'Post ID',
                comment_id: 'Comment ID',
                parent_comment_id: 'Parent comment ID',
                status: 'Status',
                publish_date: 'Publish date',
                description: 'Description',
                rating: 'Rating',
                profile_picture: 'Profile picture',
                key_name: 'Achievement key',
                icon: 'Icon',
                points: 'Points',
                is_active: 'Active',
                type: 'Type'
            }
        }
    }
};

const admin_js = new AdminJS(adminJS_config);

const authenticate = async (email, password) => {
    console.log('AdminJS login attempt:', email);
    
    if(email === 'admin@usof.com' && password === 'admin123') 
        {
        console.log('AdminJS login successful');
        return { email: 'admin@usof.com', role: 'admin' };
    }
    
    console.log('AdminJS login failed');
    return false;
};

const admin_router = AdminJSExpress.buildAuthenticatedRouter(admin_js, {
    authenticate,
    cookieName: 'adminjs',
    cookiePassword: config.admin?.sessionSecret || 'some-secret-password-used-to-secure-cookie',
}, null, {
    resave: false,
    saveUninitialized: true,
    cookie: 
    {
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
});

export { 
    admin_js as adminJs, 
    admin_router as adminRouter, 
    adminJS_config as adminJsConfig, 
    admin_database as AdminDatabase,
    admin_resource as AdminResource
};
