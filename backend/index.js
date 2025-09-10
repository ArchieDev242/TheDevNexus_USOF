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
  console.log('Запрос:', req.method, req.url);
  next();
});

app.use("/api", router);

app.listen(port, () => {
    console.log(`Server started at http://127.0.0.1:${port}`);
});