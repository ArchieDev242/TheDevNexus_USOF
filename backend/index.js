import dbConnect from './utils/dbConnect.js';

const express = require('express');
const cors = require('cors');
const cookie_parser = require('cookie-parser');
const multer = require('multer');
const session = require('express-session');
const router = require('router');
const configPort = require('./config.json');//include config port

const body_parser = require('body-parser');
const path = require('path');

const port = configPort.server.port;//get port from config.js
const app = express();

//midlleware
app.use(cookie_parser());
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