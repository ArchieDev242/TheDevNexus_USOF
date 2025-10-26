import DB_connect from './utils/dbConnect.js';
import config from './config.js';
import authRouter from './routes/authUser.js';
import usersRouter from './routes/users.js';
import postsRouter from './routes/posts.js';
import commentsRouter from './routes/comments.js';
import categoriesRouter from './routes/categories.js';
import likesRouter from './routes/likes.js';
import commentsAdditionalRouter from './routes/comments-additional.js';
import notificationsRouter from './routes/notifications.js';
import achievementsRouter from './routes/achievements.js';
import reportsRouter from './routes/reports.js';
import adminStatsRouter from './routes/adminStats.js';
import codeExecutionRouter from './routes/codeExecution.js';
import blueprintsRouter from './routes/blueprints.js';
import error_handler from './middleware/errorHandler.js';
import auth_middleware from './middleware/auth.js';
import RateLimit from './middleware/rateLimit.js';
import { adminJs, adminRouter } from './admin/admin.js';
import customAdminRouter from './admin/routes/customAdmin.js';


import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const port = config.server.port; //get port from config.js
const app = express();

//middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: config.frontend?.url || 'http://localhost:5173',
    credentials: true
}));

app.use('/api/users/me', (req, res, next) => {
    next();
});

app.use('/api', RateLimit.api());

app.use(session({ secret: 'key', resave: false, saveUninitialized: true }));

app.use(auth_middleware.identify_user);

app.use((req, res, next) => {
  const url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);

  if(url.searchParams.has('token')) url.searchParams.set('token', '***');

  console.log('Запрос:', req.method, url.pathname + (url.search ? url.search : ''));
  next();
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

// register and login
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register-form.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login-form.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

// main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const frontend_dist = path.join(__dirname, '../frontend/dist');
const has_frontend_build = fs.existsSync(path.join(frontend_dist, 'index.html'));

if (has_frontend_build) {
  app.use(express.static(frontend_dist));
}

// API routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/comments", commentsAdditionalRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/likes", likesRouter);
app.use("/api/blueprints", blueprintsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/achievements", achievementsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/admin/stats", adminStatsRouter);
app.use("/api/code", codeExecutionRouter);

// AdminJS routes
app.use(adminJs.options.rootPath, adminRouter);

// custom Admin Panel
app.use('/admin-panel', customAdminRouter);

// Admin Dashboard Selector
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/views/dashboard.html'));
});

if (has_frontend_build) {
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api') || req.path.startsWith('/admin') || req.path.startsWith('/admin-panel')) {
      return next();
    }

    res.sendFile(path.join(frontend_dist, 'index.html'));
  });
}

app.use(error_handler.not_found);
app.use(error_handler.handler);

app.listen(port, () => {
    console.log(`Server started at http://127.0.0.1:${port}`);
    console.log(`Main site available at http://127.0.0.1:${port}`);
    console.log(`Admin Dashboard Selector: http://127.0.0.1:${port}/dashboard`);
    console.log(`Custom Admin Panel: http://127.0.0.1:${port}/admin-panel`);
    console.log(`AdminJS panel: http://127.0.0.1:${port}/admin`);
    console.log(`AdminJS credentials: admin@usof.com / admin123`);
});