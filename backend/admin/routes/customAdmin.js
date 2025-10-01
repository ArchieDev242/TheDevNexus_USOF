import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import config from '../../config.js';
import User from '../../models/User.js';
import auth_middleware from '../../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const admin_auth = async (req, res, next) => {
    try 
    {
        await auth_middleware.identify_user(req, res, () => {});
        
        if(!req.user) 
            {
            if(req.path.startsWith('/api/')) 
                {
                return res.status(401).json({
                    status: 'error',
                    message: 'Authentication required. Please log in to access admin panel.',
                    redirect: '/admin-panel/login'
                });
            }
            return res.redirect('/admin-panel/login');
        }

        if(!req.user.is_admin()) 
            {
            const errorResponse = {
                status: 'error',
                message: 'Admin access required. You do not have permission to access this resource.',
                userRole: req.user.role
            };
            
            if(req.path.startsWith('/api/')) return res.status(403).json(errorResponse);

            return res.status(403).send(`
                <h1>Access Denied</h1>
                <p>Admin access required. Your role: ${req.user.role}</p>
                <a href = "/admin-panel/login">Return to login</a>
            `);
        }

        if(!req.user.email_verified) 
            {
            const errorResponse = {
                status: 'error',
                message: 'Email verification required. Please verify your email before accessing admin panel.',
                userId: req.user.id
            };
            
            if(req.path.startsWith('/api/')) return res.status(403).json(errorResponse);

            return res.status(403).send(`
                <h1>Email Verification Required</h1>
                <p>Please verify your email before accessing admin panel.</p>
                <a href = "/admin-panel/login">Return to login</a>
            `);
        }

        console.log(`Admin access granted: ${req.user.login} (ID: ${req.user.id}) at ${new Date().toISOString()}`);
        
        next();
    } catch(error) 
    {
        console.error('Error in admin authentication:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error during authentication'
        });
    }
};

router.get('/login', (req, res) => {
    try 
    {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin Login - Dev Nexus</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
                    .login-form { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 300px; }
                    .form-group { margin-bottom: 1rem; }
                    label { display: block; margin-bottom: 0.5rem; }
                    input { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
                    button { width: 100%; padding: 0.75rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
                    button:hover { background: #0056b3; }
                    .error { color: red; margin-top: 0.5rem; }
                    .success { color: green; margin-top: 0.5rem; }
                </style>
            </head>
            <body>
                <div class = "login-form">
                    <h2>Admin Panel Login</h2>
                    <form id = "loginForm">
                        <div class = "form-group">
                            <label for = "login">Login:</label>
                            <input type = "text" id = "login" name = "login" required>
                        </div>
                        <div class = "form-group">
                            <label for = "password">Password:</label>
                            <input type = "password" id = "password" name = "password" required>
                        </div>
                        <button type="submit">Login</button>
                        <div id="message"></div>
                    </form>
                </div>
                
                <script>
                    document.getElementById('loginForm').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const messageDiv = document.getElementById('message');
                        
                        const loginData = {
                            loginOrEmail: document.getElementById('login').value,
                            password: document.getElementById('password').value
                        };
                        
                        try {

                            const response = await fetch('/api/auth/login', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify(loginData)
                            });
                            
                            const result = await response.json();
                            
                            if(response.ok) 
                            {
                                messageDiv.innerHTML = '<div class="success">Login successful! Redirecting...</div>';
                                setTimeout(() => window.location.href = '/admin-panel/', 1000);
                            } else 
                                {
                                messageDiv.innerHTML = '<div class="error">' + result.message + '</div>';
                            }
                        } catch(error) 
                         {
                            messageDiv.innerHTML = '<div class="error">Network error. Please try again.</div>';
                        }
                    });
                </script>
            </body>
            </html>
        `);
    } catch(error) 
    {
        console.error('Error serving login page:', error);
        res.status(500).send('Error loading login page');
    }
});

router.use('/assets', admin_auth, express.static(path.join(__dirname, '../custom/assets')));

router.get('/', admin_auth, (req, res) => {
    try 
    {
        res.locals.user = {
            id: req.user.id,
            login: req.user.login,
            full_name: req.user.full_name,
            role: req.user.role
        };
        
        res.sendFile(path.join(__dirname, '../custom/dashboard.html'));
    } catch(error) 
    {
        console.error('Error serving dashboard:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error loading admin dashboard'
        });
    }
});

router.get('/dashboard', admin_auth, (req, res) => {
    try 
    {
        res.locals.user = {
            id: req.user.id,
            login: req.user.login,
            full_name: req.user.full_name,
            role: req.user.role
        };
        
        res.sendFile(path.join(__dirname, '../custom/dashboard.html'));
    } catch(error) 
    {
        console.error('Error serving dashboard:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error loading admin dashboard'
        });
    }
});

// API endpoints
router.get('/api/me', admin_auth, (req, res) => {
    try 
    {
        res.json({
            status: 'success',
            data: 
            {
                id: req.user.id,
                login: req.user.login,
                full_name: req.user.full_name,
                email: req.user.email,
                role: req.user.role,
                rating: req.user.rating,
                created_at: req.user.created_at,
                email_verified: req.user.email_verified
            }
        });
    } catch(error) 
    {
        console.error('Error getting admin info:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving admin information'
        });
    }
});

router.post('/api/logout', admin_auth, (req, res) => {
    try 
    {
        res.clearCookie('auth');
        res.clearCookie('guestSession');
        
        res.json({
            status: 'success',
            message: 'Successfully logged out'
        });
    } catch(error) 
    {
        console.error('Error during logout:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error during logout'
        });
    }
});

router.get('/api/status', (req, res) => {
    auth_middleware.identify_user(req, res, () => {
        res.json({
            status: 'success',
            authenticated: !!req.user,
            isAdmin: req.user ? req.user.is_admin() : false,
            emailVerified: req.user ? req.user.email_verified : false,
            user: req.user ? {
                id: req.user.id,
                login: req.user.login,
                role: req.user.role
            } : null
        });
    });
});

export default router;
