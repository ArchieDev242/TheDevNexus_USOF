import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import session from 'express-session';
import { adminJsConfig } from './adminjs.js';

const PORT = 4001;

const start = async () => {
    const app = express();
    
    app.use(session({
        secret: 'your-secret-key-change-this-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // true for HTTPS
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    }));

    const admin = new AdminJS(adminJsConfig);

    const admin_router = AdminJSExpress.buildAuthenticatedRouter(
        admin,
        {
            authenticate: async (email, password) => {
                if(email === 'admin@usof.com' && password === 'admin123') 
                {
                    return { email: 'admin@usof.com', role: 'admin' };
                }
                return null;
            },
            cookieName: 'adminjs',
            cookiePassword: 'complex-cookie-password-change-this',
        },
        null,
        {
            resave: false,
            saveUninitialized: false,
            secret: 'session-secret-change-this',
        }
    );

    app.use(admin.options.rootPath, admin_router);

    app.listen(PORT, () => {
        console.log(`AdminJS server running on http://localhost:${PORT}${admin.options.rootPath}`);
        console.log(`Login: admin@usof.com`);
        console.log(`Password: admin123`);
    });
};

start().catch((error) => {
    console.error('❌ Error starting AdminJS server:', error);
    process.exit(1);
});
