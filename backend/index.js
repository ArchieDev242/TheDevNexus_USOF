import dbConnect from './utils/dbConnect.js';
import config from './config.json' with { type: 'json' };
import router from './routes/authUser.js';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const port = config.server.port; //get port from config.js
const app = express();

//midlleware
app.use(cookieParser());
app.use(express.json());
app.use(cors());
const upload = multer();
app.use(upload.none());
app.use(session({ secret: 'key', resave: false, saveUninitialized: true }));

app.use((req, res, next) => {
  const url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
  if (url.searchParams.has('token')) {
    url.searchParams.set('token', '***');
  }
  console.log('Запрос:', req.method, url.pathname + (url.search ? url.search : ''));
  next();
});

// Resolve __dirname for ESM and serve static assets
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));

// Explicit route for reset-password page
app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

// Pages: register and login
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register-form.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login-form.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

app.use("/api", router);

app.listen(port, () => {
    console.log(`Server started at http://127.0.0.1:${port}`);
});