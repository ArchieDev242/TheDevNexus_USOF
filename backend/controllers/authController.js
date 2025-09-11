import userModel from '../models/User.js';
import config from '../config.json' with { type: 'json' };
import dbConnect from '../utils/dbConnect.js';

import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
    try {
        const { login, password, full_name, email } = req.body;

        if (await userModel.find_by_login(login)) {
            return res.status(400).json({ error: 'Login already exists' });
        }
        if (await userModel.find_by_email(email)) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        //create user
        const user = new userModel({ login, password, full_name, email });
        const { plainToken } = await user.create(); // create() должен вернуть plainToken

        // link for accept
        const verificationLink = `http://127.0.0.1:3000/api/verify?token=${encodeURIComponent(plainToken)}&email=${encodeURIComponent(email)}`;

        // send mail
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: config.email.user,
                pass: config.email.pass
            }
        });

        await transporter.sendMail({
            from: '"USOF" <your_email@gmail.com>',
            to: email,
            subject: 'Подтверждение регистрации',
            html: `
                <h1>Здравствуйте, ${full_name}!</h1>
                <h3>Для подтверждения email перейдите по ссылке:</h3>
                <a href="${verificationLink}">${verificationLink}</a>
            `
        });

        res.status(201).json({ message: 'Пользователь создан. Проверьте почту для подтверждения.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { loginOrEmail, password } = req.body;

        if (!loginOrEmail || !password) {
            return res.status(400).json({ error: 'Введите логин/почту и пароль' });
        }

        //ind user by login
        let user = await userModel.find_by_login(loginOrEmail);
        // find user by email
        if (!user) {
            user = await userModel.find_by_email(loginOrEmail);
        }

        if (!user) {
            return res.status(400).json({ error: 'Неверный логин или пароль' });
        }

        // check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Неверный логин или пароль' });
        }

        // verify email
        console.log('Email verified status:', user.email_verified);
        if (!user.email_verified) {
            console.warn('Email not verified');
            return res.status(403).json({ error: 'Email не подтверждён' });
        }

        // generic JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            config.jwt.secret,
            {expiresIn: config.jwt.expiresIn}
        );

        res.json({
            message: 'Вход выполнен успешно',
            token,
            user: {
                id: user.id,
                login: user.login,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token, email } = req.query;

        if (!token || !email) {
            return res.status(400).send('Отсутствует токен или email');
        }

        const [rows] = await dbConnect.makeRequest(
            'SELECT verification_token, email_verified FROM users WHERE email = ?',
            [email]
        );

        if (!rows.length) {
            return res.status(404).send('Пользователь не найден');
        }

        const user = rows[0];

        if (user.email_verified) {
            return res.send('Email уже подтверждён');
        }

        const isMatch = await bcrypt.compare(token, user.verification_token);

        if (!isMatch) {
            return res.status(400).send('Неверный или устаревший токен');
        }

        await dbConnect.makeRequest(
            'UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE email = ?',
            [email]
        );

        res.send('Email успешно подтверждён!');
    } catch (err) {
        res.status(500).send('Внутренняя ошибка сервера');
    }
};