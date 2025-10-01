import userModel from '../models/User.js';
import config from '../config.js';
import DB_connect from '../utils/dbConnect.js';
import MailService from '../services/MailService.js';

import bcrypt from 'bcrypt';
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

        // send verification email using MailService
        const mailService = new MailService();
        await mailService.sending_verification(email, full_name, plainToken);

        res.status(201).json({ message: 'Пользователь создан. Проверьте почту для подтверждения.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    try 
    {
        const { loginOrEmail, password } = req.body;

        console.log('Login attempt:', { loginOrEmail, passwordLength: password?.length });

        if(!loginOrEmail || !password) 
            {
            return res.status(400).json({ error: 'Введите логин/почту и пароль' });
        }

        //ind user by login
        let user = await userModel.find_by_login(loginOrEmail);
        console.log('User found by login:', !!user);
        
        // find user by email
        if(!user) 
            {
            user = await userModel.find_by_email(loginOrEmail);
            console.log('User found by email:', !!user);
        }

        if(!user) 
            {
            console.log('No user found for:', loginOrEmail);
            return res.status(400).json({ error: 'Неверный логин или пароль' });
        }

        // check password
        console.log('Comparing passwords...');
        console.log('Input password:', password);
        console.log('Stored password hash:', user.password);

        const is_match = await bcrypt.compare(password, user.password);
        console.log('Password match result:', is_match);

        if(!is_match) 
            {
            console.log('Password does not match!');
            return res.status(400).json({ error: 'Неверный логин или пароль' });
        }

        // verify email
        console.log('Email verified status:', user.email_verified);
        if(!user.email_verified) 
            {
            console.warn('Email not verified');
            return res.status(403).json({ error: 'Email не подтверждён' });
        }

        // issue JWT and set as HttpOnly cookie
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
    } catch (err) 
    {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token, email } = req.query;

        if(!token || !email) return res.status(400).send('Отсутствует токен или email');

        const [rows] = await DB_connect.make_request(
            'SELECT verification_token, email_verified FROM users WHERE email = ?',
            [email]
        );

        if(!rows.length) return res.status(404).send('Пользователь не найден');

        const user = rows[0];

        if (user.email_verified) {
            return res.send('Email уже подтверждён');
        }

        const isMatch = await bcrypt.compare(token, user.verification_token);

        if (!isMatch) {
            return res.status(400).send('Неверный или устаревший токен');
        }

        await DB_connect.make_request(
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

        await DB_connect.make_request(
            'UPDATE users SET reset_token_hash = ?, reset_token_expires_at = ? WHERE id = ?',
            [tokenHash, expiresAt, user.id]
        );

        // send password reset email using MailService
        try {
            const mailService = new MailService();
            console.log(`🔄 Attempting to send password reset email to: ${email}`);
            await mailService.send_pass_reset(email, plainToken);
            console.log(`✅ Password reset email sent successfully to: ${email}`);
        } catch (emailError) {
            console.error(`❌ Failed to send password reset email to ${email}:`, emailError);
            // Не зупиняємо процес, але логуємо помилку
        }

        return res.status(200).json({ message: genericMsg });
    } catch (err) {
        console.error('❌ Error in forgotPassword:', err);
        return res.status(200).json({ message: 'If the email exists, a reset link was sent' });
    }
};

export const verifyResetToken = async (req, res) => {
    try {
        const { token, email } = req.body;
        if (!token || !email) {
            return res.status(400).json({ error: 'Отсутствует токен или email' });
        }
        const [rows] = await DB_connect.make_request(
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

        const [rows] = await DB_connect.make_request(
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
        await DB_connect.make_request(
            'UPDATE users SET password = ?, password_changed_at = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?',
            [newHash, changedAt, userId]
        );

        try {
            const [userRows] = await DB_connect.make_request(
                'SELECT full_name FROM users WHERE id = ?',
                [userId]
            );
            const fullName = userRows[0]?.full_name || 'User';

            // send password change confirmation email using MailService
            const mailService = new MailService();
            await mailService.send_pass_change_confirmation(email, fullName);
        } catch (emailError) {
            console.error('Error sending password change confirmation email:', emailError);
        }
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