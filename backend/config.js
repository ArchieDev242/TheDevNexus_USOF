import dotenv from 'dotenv';

dotenv.config();

export const config = {
    database: 
    {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'USOF',
        port: process.env.DB_PORT || 3306
    },

    email: 
    {
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASS,
        displayName: process.env.EMAIL_DISPLAY_NAME || 'Dev Nexus Support',
        displayAddress: process.env.EMAIL_DISPLAY_ADDRESS || 'noreply@thedevnexus.org'
    },

    server: 
    {
        port: process.env.PORT || 3000,
        baseUrl: process.env.BASE_URL || 'http://localhost:3000'
    },

    // JWT
    jwt: 
    {
        secret: process.env.JWT_SECRET || 'default-secret-change-this',
        expiresIn: process.env.JWT_EXPIRES_IN || '2h'
    },

    // admin panel
    admin: 
    {
        port: process.env.ADMIN_PORT || 4001,
        cookieSecret: process.env.ADMIN_COOKIE_SECRET || 'default-cookie-secret',
        sessionSecret: process.env.ADMIN_SESSION_SECRET || 'default-session-secret'
    }
};

export default config;
