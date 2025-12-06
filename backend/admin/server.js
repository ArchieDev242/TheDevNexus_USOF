import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import session from 'express-session';
import config from '../config.js';
import { adminJs, adminRouter } from './admin.js';

const PORT = config.admin.port;

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

    app.use(adminJs.options.rootPath, adminRouter);

    app.listen(PORT, () => {
        console.log(`AdminJS server running on http://localhost:${PORT}${adminJs.options.rootPath}`);
        console.log(`Login: admin@usof.com`);
        console.log(`Password: admin123`);
        console.log('AdminJS is now running without ORM dependency');
    });
};

start().catch((error) => {
    console.error('Error starting AdminJS server:', error);
    process.exit(1);
});
