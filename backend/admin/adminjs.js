import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';
import express from 'express';
import { sequelize, User, Post, Comment, Category } from './sequelize.js';
import config from '../config.js';

AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database,
});

const adminJs = new AdminJS({
    resources: [
        {
            resource: User,
            options: 
            {
                listProperties: ['id', 'login', 'full_name', 'email', 'role', 'email_verified', 'created_at'],
                filterProperties: ['login', 'email', 'role', 'email_verified'],
                editProperties: ['login', 'full_name', 'email', 'role', 'email_verified'],
                showProperties: ['id', 'login', 'full_name', 'email', 'profile_picture', 'rating', 'role', 'email_verified', 'created_at', 'updated_at'],
                actions: 
                {
                    edit: { isAccessible: true },
                    delete: { isAccessible: true },
                    new: { isAccessible: true }
                }
            }
        },
        {
            resource: Post,
            options: 
            {
                listProperties: ['id', 'title', 'author_id', 'status', 'publish_date'],
                filterProperties: ['title', 'author_id', 'status'],
                editProperties: ['title', 'content', 'author_id', 'status'],
                showProperties: ['id', 'title', 'content', 'author_id', 'status', 'publish_date', 'created_at'],
                actions: 
                {
                    edit: { isAccessible: true },
                    delete: { isAccessible: true },
                    new: { isAccessible: true }
                }
            }
        },
        {
            resource: Comment,
            options: 
            {
                listProperties: ['id', 'content', 'author_id', 'post_id', 'publish_date'],
                filterProperties: ['author_id', 'post_id'],
                editProperties: ['content', 'author_id', 'post_id'],
                showProperties: ['id', 'content', 'author_id', 'post_id', 'publish_date', 'created_at'],
                actions: 
                {
                    edit: { isAccessible: true },
                    delete: { isAccessible: true },
                    new: { isAccessible: true }
                }
            }
        },
        {
            resource: Category,
            options: 
            {
                listProperties: ['id', 'title', 'description', 'created_at'],
                filterProperties: ['title'],
                editProperties: ['title', 'description'],
                showProperties: ['id', 'title', 'description', 'created_at', 'updated_at'],
                actions: 
                {
                    edit: { isAccessible: true },
                    delete: { isAccessible: true },
                    new: { isAccessible: true }
                }
            }
        }
    ],
    rootPath: '/admin',
    branding: 
    {
        companyName: 'USOF Admin Panel',
        softwareBrothers: false,
        logo: false,
        favicon: 'https://adminjs.co/assets/favicon.ico'
    },
    locale: {
        language: 'uk',
        translations: 
        {
            labels: 
            {
                User: 'Користувачі',
                Post: 'Пости',
                Comment: 'Коментарі',
                Category: 'Категорії'
            },
            actions: 
            {
                new: 'Створити',
                edit: 'Редагувати',
                delete: 'Видалити',
                list: 'Список',
                show: 'Переглянути'
            },
            properties: 
            {
                id: 'ID',
                login: 'Логін',
                full_name: 'Повне імя',
                email: 'Email',
                role: 'Роль',
                email_verified: 'Email підтверджено',
                created_at: 'Створено',
                updated_at: 'Оновлено',
                title: 'Заголовок',
                content: 'Контент',
                author_id: 'ID автора',
                post_id: 'ID поста',
                status: 'Статус',
                publish_date: 'Дата публікації',
                description: 'Опис',
                rating: 'Рейтинг',
                profile_picture: 'Фото профілю'
            }
        }
    }
});

const authenticate = async (email, password) => {
    console.log('AdminJS login attempt:', email, password);
    
    if(email === 'admin@usof.com' && password === 'admin123') 
        {
        console.log('AdminJS login successful');
        return { email: 'admin@usof.com', role: 'admin' };
    }
    
    console.log('AdminJS login failed');
    return false;
};

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
    authenticate,
    cookieName: 'adminjs',
    cookiePassword: 'some-secret-password-used-to-secure-cookie',
});

export { adminJs, adminRouter, sequelize };
