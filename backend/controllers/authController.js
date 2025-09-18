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
            from: `USOF <${config.email.user}>`,
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

        // Issue JWT and set as HttpOnly cookie
        const token = jwt.sign(
            { id: user.id, role: user.role },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('auth', token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 2 * 60 * 60 * 1000 // sync with expiresIn 2h
        });

        res.json({
            message: 'Вход выполнен успешно',
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

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const genericMsg = 'If the email exists, a reset link was sent';

        if (!email) return res.status(200).json({ message: genericMsg });

        const user = await userModel.find_by_email(email);
        if (!user) return res.status(200).json({ message: genericMsg });
        // only users
        if (user.role !== 'user') {
            return res.status(200).json({ message: genericMsg });
        }

        if (!user.email_verified) {
            return res.status(200).json({ message: genericMsg });
        }

        const plainToken = await bcrypt.genSalt(10);
        const tokenHash = await bcrypt.hash(plainToken, 10);
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        await dbConnect.makeRequest(
            'UPDATE users SET reset_token_hash = ?, reset_token_expires_at = ? WHERE id = ?',
            [tokenHash, expiresAt, user.id]
        );

    const resetLink = `http://127.0.0.1:3000/reset-password#token=${encodeURIComponent(plainToken)}&email=${encodeURIComponent(email)}`;

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
            from: `USOF <${config.email.user}>`,
            to: email,
            subject: 'Сброс пароля',
            html: `
                <h1>Сброс пароля</h1>
                <p>Для сброса пароля перейдите по ссылке (действительна 30 минут):</p>
                <a href="${resetLink}">${resetLink}</a>
            `
        });

        return res.status(200).json({ message: genericMsg });
    } catch (err) {
        return res.status(200).json({ message: 'If the email exists, a reset link was sent' });
    }
};

export const verifyResetToken = async (req, res) => {
    try {
        const { token, email } = req.body;
        if (!token || !email) {
            return res.status(400).json({ error: 'Отсутствует токен или email' });
        }
        const [rows] = await dbConnect.makeRequest(
            'SELECT role, email_verified, reset_token_hash, reset_token_expires_at FROM users WHERE email = ?',
            [email]
        );
        if (!rows.length) return res.status(404).json({ error: 'Неверный токен или email' });

        const { role, email_verified, reset_token_hash: hash, reset_token_expires_at: expiresAt } = rows[0];
        if (role !== 'user') return res.status(403).json({ error: 'Доступ запрещён' });
        if (!email_verified) return res.status(403).json({ error: 'Email не подтверждён' });
        if (!hash || !expiresAt) return res.status(400).json({ error: 'Неверный или устаревший токен' });

        const notExpired = new Date(expiresAt) > new Date();
        const ok = notExpired && (await bcrypt.compare(token, hash));
        if (!ok) return res.status(400).json({ error: 'Неверный или устаревший токен' });

        return res.status(200).json({ message: 'Токен валиден' });
    } catch (err) {
        return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        if (!email || !token || !newPassword) {
            return res.status(400).json({ error: 'email, token и newPassword обязательны' });
        }
        if (typeof newPassword !== 'string' || newPassword.length < 8) {
            return res.status(400).json({ error: 'Пароль должен быть не менее 8 символов' });
        }

        const [rows] = await dbConnect.makeRequest(
            'SELECT id, role, email_verified, reset_token_hash, reset_token_expires_at FROM users WHERE email = ?',
            [email]
        );
        if (!rows.length) return res.status(400).json({ error: 'Неверные данные' });
        const { id: userId, role, email_verified, reset_token_hash: hash, reset_token_expires_at: expiresAt } = rows[0];
        if (role !== 'user') return res.status(403).json({ error: 'Доступ запрещён' });
        if (!email_verified) return res.status(403).json({ error: 'Email не подтверждён' });
        if (!hash || !expiresAt) return res.status(400).json({ error: 'Неверный или устаревший токен' });

        const notExpired = new Date(expiresAt) > new Date();
        const ok = notExpired && (await bcrypt.compare(token, hash));
        if (!ok) return res.status(400).json({ error: 'Неверный или устаревший токен' });

        const newHash = await bcrypt.hash(newPassword, 10);
        const changedAt = new Date();
        await dbConnect.makeRequest(
            'UPDATE users SET password = ?, password_changed_at = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?',
            [newHash, changedAt, userId]
        );

        return res.status(200).json({ message: 'Пароль успешно обновлён' });
    } catch (err) {
        return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('auth', { path: '/' });
        return res.status(200).json({ message: 'Выход выполнен' });
    } catch (err) {
        return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};