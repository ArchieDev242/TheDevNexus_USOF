import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';

import User from './models/User.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';
import Like from './models/Like.js';
import Category from './models/Category.js';
import dbConnect from './utils/dbConnect.js';
import AdminAdapter from './utils/adminAdapter.js';

const PORT = process.env.ADMIN_PORT || 4000;

async function create_admin_panel() 
{
    try 
    {
        const admin = new AdminJS({
            databases: [],
            rootPath: '/admin',
            branding: 
            {
                companyName: 'TheDevNexus USOF',
                logo: false,
                softwareBrothers: false,
                theme: 
                {
                    colors: 
                    {
                        primary100: '#667eea',
                        primary80: '#764ba2',
                        primary60: '#4a5568',
                        primary40: '#2d3748',
                        primary20: '#1a202c',
                    }
                }
            },
            resources: [
                {
                    resource: 
                    {
                        model: 'User',
                        client: dbConnect
                    },
                    options: 
                    {
                        navigation: 
                        {
                            name: 'Управління користувачами',
                            icon: 'User'
                        },
                        properties: 
                        {
                            id: { isVisible: { list: true, filter: true, show: true, edit: false } },
                            login: { isRequired: true },
                            full_name: { isRequired: true },
                            email: { isRequired: true, type: 'email' },
                            password: 
                            { 
                                isVisible: { list: false, filter: false, show: false, edit: true },
                                type: 'password'
                            },
                            profile_picture: { type: 'string' },
                            rating: { type: 'number' },
                            role: 
                            {
                                availableValues: [
                                    { value: 'user', label: 'Користувач' },
                                    { value: 'admin', label: 'Адміністратор' }
                                ]
                            },
                            email_verified: { type: 'boolean' },
                            created_at: 
                            { 
                                isVisible: { list: true, filter: true, show: true, edit: false },
                                type: 'datetime'
                            },
                            updated_at: 
                            { 
                                isVisible: { list: true, filter: true, show: true, edit: false },
                                type: 'datetime'
                            }
                        },
                        actions: 
                        {
                            new: 
                            {
                                before: async (request) => {
                                    if(request.payload.password) request.payload.password = await bcrypt.hash(request.payload.password, 12);
                                    
                                    return request;
                                }
                            },
                            edit: 
                            {
                                before: async (request) => {
                                    if(request.payload.password) request.payload.password = await bcrypt.hash(request.payload.password, 12);

                                    return request;
                                }
                            }
                        }
                    }
                },
                {
                    resource: 
                    {
                        model: 'Post',
                        client: dbConnect
                    },
                    options: 
                    {
                        navigation: 
                        {
                            name: 'Управління постами',
                            icon: 'FileText'
                        },
                        properties: 
                        {
                            id: { isVisible: { list: true, filter: true, show: true, edit: false } },
                            title: { isRequired: true },
                            content: 
                            { 
                                type: 'richtext',
                                isVisible: { list: false, filter: false, show: true, edit: false }
                            },
                            author_id: 
                            { 
                                type: 'reference',
                                reference: 'User'
                            },
                            category_id: 
                            { 
                                type: 'reference',
                                reference: 'Category'
                            },
                            status: 
                            {
                                availableValues: [
                                    { value: 'active', label: 'Активний' },
                                    { value: 'inactive', label: 'Неактивний' }
                                ]
                            },
                            created_at: 
                            { 
                                isVisible: { list: true, filter: true, show: true, edit: false },
                                type: 'datetime'
                            },
                            updated_at: 
                            { 
                                isVisible: { list: true, filter: true, show: true, edit: false },
                                type: 'datetime'
                            }
                        },
                        actions: 
                        {
                            edit: 
                            {
                                isVisible: (context) => {
                                    return ['category_id', 'status'].includes(context.property?.name) || !context.property;
                                }
                            }
                        }
                    }
                },
                {
                    resource: 
                    {
                        model: 'Comment',
                        client: dbConnect
                    },
                    options: 
                    {
                        navigation: 
                        {
                            name: 'Управління коментарями',
                            icon: 'MessageSquare'
                        },
                        properties: 
                        {
                            id: { isVisible: { list: true, filter: true, show: true, edit: false } },
                            content: 
                            { 
                                type: 'textarea',
                                isVisible: { list: true, filter: false, show: true, edit: false }
                            },
                            author_id: 
                            { 
                                type: 'reference',
                                reference: 'User'
                            },
                            post_id: 
                            { 
                                type: 'reference',
                                reference: 'Post'
                            },
                            status: 
                            {
                                availableValues: [
                                    { value: 'active', label: 'Активний' },
                                    { value: 'inactive', label: 'Неактивний' }
                                ]
                            },
                            created_at: 
                            { 
                                isVisible: { list: true, filter: true, show: true, edit: false },
                                type: 'datetime'
                            }
                        },
                        actions: 
                        {
                            edit: 
                            {
                                isVisible: (context) => {
                                    return context.property?.name === 'status' || !context.property;
                                }
                            }
                        }
                    }
                },
                {
                    resource: 
                    {
                        model: 'Category',
                        client: dbConnect
                    },
                    options: 
                    {
                        navigation: 
                        {
                            name: 'Управління категоріями',
                            icon: 'Folder'
                        },
                        properties: 
                        {
                            id: { isVisible: { list: true, filter: true, show: true, edit: false } },
                            title: { isRequired: true },
                            description: { type: 'textarea' },
                            created_at: 
                            { 
                                isVisible: { list: true, filter: true, show: true, edit: false },
                                type: 'datetime'
                            },
                            updated_at: 
                            { 
                                isVisible: { list: true, filter: true, show: true, edit: false },
                                type: 'datetime'
                            }
                        }
                    }
                },
                {
                    resource: 
                    {
                        model: 'Like',
                        client: dbConnect
                    },
                    options: 
                    {
                        navigation: 
                        {
                            name: 'Управління лайками',
                            icon: 'Heart'
                        },
                        properties: 
                        {
                            id: { isVisible: { list: true, filter: true, show: true, edit: false } },
                            author_id: 
                            { 
                                type: 'reference',
                                reference: 'User'
                            },
                            post_id: 
                            { 
                                type: 'reference',
                                reference: 'Post'
                            },
                            comment_id: 
                            { 
                                type: 'reference',
                                reference: 'Comment'
                            },
                            type: 
                            {
                                availableValues: [
                                    { value: 'like', label: 'Лайк' },
                                    { value: 'dislike', label: 'Дизлайк' }
                                ]
                            },
                            created_at: 
                            { 
                                isVisible: { list: true, filter: true, show: true, edit: false },
                                type: 'datetime'
                            }
                        }
                    }
                }
            ]
        });

        const admin_router = AdminJSExpress.buildAuthenticatedRouter(admin, {
            authenticate: async (email, password) => {
                try 
                {
                    const user = await User.find_by_email(email);
                    
                    if(!user || user.role !== 'admin') return null;

                    const is_password_valid = await bcrypt.compare(password, user.password);
                    
                    if(is_password_valid) 
                        {
                        return {
                            id: user.id,
                            login: user.login,
                            email: user.email,
                            role: user.role
                        };
                    }
                    
                    return null;
                } catch(error) 
                {
                    console.error('Admin authentication error:', error);
                    return null;
                }
            },
            cookieName: 'adminjs',
            cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'very-secure-admin-secret-key',
        }, null, {
            store: null,
            resave: true,
            saveUninitialized: true,
            secret: process.env.ADMIN_SESSION_SECRET || 'very-secure-admin-session-secret',
            cookie: 
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 1000 * 60 * 60 * 24
            },
            name: 'adminjs'
        });

        return { admin, adminRouter: admin_router };
    } catch(error) 
    {
        console.error('Error creating admin panel:', error);
        throw error;
    }
}

export default create_admin_panel;
