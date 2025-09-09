import dbConnect from './utils/dbConnect.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import session from 'express-session';
import router from 'router';
import config from './config.json' with { type: 'json' };
import bodyParser from 'body-parser';
import path from 'path';

const port = config.server.port;//get port from config.js
const app = express();

//midlleware
app.use(cookieParser());
app.use(express.json());
app.use(multer);
app.use(cors);
app.use(session);

app.use("/api", router);

app.listen(port, () => {
    console.log(`Server started at http://127.0.0.1:${port}`);
});

(async () => {
  try {
    const [rows] = await dbConnect.makeRequest('SELECT 1');
    console.log('Подключение к БД успешно:', rows);
  } catch (err) {
    console.error('Ошибка подключения к БД:', err.message);
  }
})();