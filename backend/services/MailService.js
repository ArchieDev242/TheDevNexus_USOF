import nodemailer from 'nodemailer';
import config from '../config.js';
import error_handler from '../middleware/errorHandler.js';

const buildFrontendLink = (path, params = {}) => {
    const base = config.frontend?.baseUrl || config.server.baseUrl || 'http://localhost:5173';
    const url = new URL(path, base);
    Object.entries(params).forEach(([key, value]) => {
        if(value !== undefined && value !== null) url.searchParams.set(key, value);
    });
    return url.toString();
};

class MailService 
{
    constructor() 
    {
        console.log(`Initializing MailService...`);
        console.log(`Email config: user=${config.email.user ? 'SET' : 'NOT SET'}, password=${config.email.password ? 'SET' : 'NOT SET'}`);
        
        if(!config.email.user || !config.email.password) 
            {
            console.warn('Email service: SMTP credentials not configured. Email functionality will be disabled.');
            this.transporter = null;
            return;
        }

        try {
            this.transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: 
                {
                    user: config.email.user,
                    pass: config.email.password
                }
            });
            console.log(`MailService: SMTP transporter created successfully`);
        } catch(error) 
        {
            console.error('Error initializing mail service:', error);
            this.transporter = null;
        }
    }

    async connect_verify() 
    {
        try 
        {
            await this.transporter.verify();
            return true;
        } 
        catch(error) 
        {
            console.error('Mail service connection failed:', error.message);
            return false;
        }
    }

    async send_email(to, subject, html, text = null) 
    {
        console.log('MailService.sendEmail called with:');
        console.log('   To:', to);
        console.log('   Subject:', subject);
        console.log('   Transporter exists:', !!this.transporter);
        
        if(!this.transporter) 
            {
            console.warn(`⚠️  Email not sent to ${to}: SMTP not configured`);
            return { success: false, error: 'SMTP not configured' };
        }

        try 
        {
            const mail_options = {
                from: `TheDevNexus <${config.email.user}>`,
                to: to,
                subject: subject,
                html: html,
                text: text || html.replace(/<[^>]*>/g, '')
            };

            console.log('Mail options prepared:');
            console.log('   From:', mail_options.from);
            console.log('   To:', mail_options.to);
            console.log('   Subject:', mail_options.subject);
            
            console.log('Attempting to send email via transporter...');
            const result = await this.transporter.sendMail(mail_options);
            
            console.log('Email sent successfully!');
            console.log('   Message ID:', result.messageId);
            console.log('   SMTP Response:', result.response);
            
            return {
                success: true,
                messageId: result.messageId,
                response: result.response
            };
        } 
        catch(error) 
        {
            console.error('❌ Email sending failed:', error.message);
            console.error('❌ Error details:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async sending_verification(userEmail, userName, verificationToken) 
    {
        const verification_link = buildFrontendLink('/email-verification', {
            token: verificationToken,
            email: userEmail
        });
        
        const subject = 'Email Verification - TheDevNexus';
        const html = `
            <!DOCTYPE html>
            <html lang = "en">
            <head>
                <meta charset = "UTF-8">
                <meta name = "viewport" content = "width=device-width, initial-scale = 1.0">
                <title>Email Verification</title>
            </head>
            <body style = "margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0d1117;">
                <div style = "max-width: 600px; margin: 0 auto; background-color: #161b22; border: 1px solid #30363d; border-radius: 12px; overflow: hidden;">

                <div style = "background: linear-gradient(135deg, #238636 0%, #2ea043 100%); padding: 40px 30px; text-align: center;">
                        <h1 style = "color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">TheDevNexus</h1>
                        <p style = "color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">Developer Community Platform</p>
                    </div>
                    
                    <div style = "padding: 40px 30px;">
                        <h2 style = "color: #f0f6fc; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Welcome, ${userName}!</h2>
                        
                        <p style = "color: #8b949e; line-height: 1.6; font-size: 16px; margin: 0 0 30px 0;">
                            Thank you for registering on TheDevNexus! To complete your registration and activate your account, 
                            please verify your email address by clicking the button below.
                        </p>

                        <div style = "text-align: center; margin: 40px 0;">
                            <a href = "${verification_link}" 
                               style = "background: linear-gradient(135deg, #238636 0%, #2ea043 100%); 
                                      color: #ffffff; 
                                      text-decoration: none; 
                                      padding: 16px 32px; 
                                      border-radius: 8px; 
                                      font-size: 16px; 
                                      font-weight: 600; 
                                      display: inline-block;
                                      border: 1px solid rgba(255,255,255,0.1);
                                      transition: all 0.2s ease;">
                                Verify Email Address
                            </a>
                        </div>
                        
                        <div style = "background-color: #21262d; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin: 30px 0;">
                            <p style = "color: #8b949e; margin: 0; font-size: 14px; line-height: 1.4;">
                                <strong style = "color: #f0f6fc;">Can't click the button?</strong><br>
                                Copy and paste this link into your browser:<br>
                                <a href = "${verification_link}" style = "color: #58a6ff; word-break: break-all; text-decoration: none;">${verification_link}</a>
                            </p>
                        </div>
                        
                        <hr style = "border: none; border-top: 1px solid #30363d; margin: 40px 0;">
                        
                        <p style = "color: #6e7681; font-size: 13px; line-height: 1.4; margin: 0;">
                            This is an automated message. If you didn't register on TheDevNexus, please ignore this email.
                            <br><br>
                            <strong style = "color: #8b949e;">Best regards,</strong><br>
                            <span style = "color: #f0f6fc;">The TheDevNexus Team</span>
                        </p>
                    </div>
                    
                    <div style = "background-color: #0d1117; padding: 20px 30px; text-align: center; border-top: 1px solid #30363d;">
                        <p style = "color: #6e7681; font-size: 12px; margin: 0;">
                            © 2025 TheDevNexus
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.send_email(userEmail, subject, html);
    }

    async send_pass_reset(userEmail, resetToken) 
    {
        const reset_link = buildFrontendLink('/reset-password', {
            token: resetToken,
            email: userEmail
        });
        
        const subject = 'Password Reset Request - TheDevNexus';
        const html = `
            <!DOCTYPE html>
            <html lang = "en">
            <head>
                <meta charset = "UTF-8">
                <meta name = "viewport" content = "width=device-width, initial-scale = 1.0">
                <title>Password Reset</title>
            </head>
            <body style = "margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0d1117;">
                <div style = "max-width: 600px; margin: 0 auto; background-color: #161b22; border: 1px solid #30363d; border-radius: 12px; overflow: hidden;">

                <div style = "background: linear-gradient(135deg, #da3633 0%, #f85149 100%); padding: 40px 30px; text-align: center;">
                        <h1 style = "color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">TheDevNexus</h1>
                        <p style = "color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">Password Reset Request</p>
                    </div>
                    
                    <div style = "padding: 40px 30px;">
                        <h2 style = "color: #f0f6fc; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                        
                        <p style = "color: #8b949e; line-height: 1.6; font-size: 16px; margin: 0 0 30px 0;">
                            We received a request to reset the password for your account. If this was you, 
                            click the button below to create a new password.
                        </p>
                        
                        <div style = "text-align: center; margin: 40px 0;">
                            <a href = "${reset_link}" 
                               style = "background: linear-gradient(135deg, #da3633 0%, #f85149 100%); 
                                      color: #ffffff; 
                                      text-decoration: none; 
                                      padding: 16px 32px; 
                                      border-radius: 8px; 
                                      font-size: 16px; 
                                      font-weight: 600; 
                                      display: inline-block;
                                      border: 1px solid rgba(255,255,255,0.1);
                                      transition: all 0.2s ease;">
                                Reset Password
                            </a>
                        </div>
                        
                        <div style = "background-color: #332900; border: 1px solid #693e00; border-radius: 8px; padding: 20px; margin: 30px 0;">
                            <p style = "color: #e3b341; margin: 0; font-size: 14px; line-height: 1.4;">
                                <strong style="color: #f2cc60;">Important:</strong> This link is only valid for 30 minutes from when you received this email.
                            </p>
                        </div>
                        
                        <div style = "background-color: #21262d; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin: 30px 0;">
                            <p style = "color: #8b949e; margin: 0; font-size: 14px; line-height: 1.4;">
                                <strong style = "color: #f0f6fc;">Can't click the button?</strong><br>
                                Copy and paste this link into your browser:<br>
                                <a href = "${reset_link}" style = "color: #58a6ff; word-break: break-all; text-decoration: none;">${reset_link}</a>
                            </p>
                        </div>
                        
                        <hr style = "border: none; border-top: 1px solid #30363d; margin: 40px 0;">
                        
                        <p style = "color: #6e7681; font-size: 13px; line-height: 1.4; margin: 0;">
                            If you didn't request a password reset, simply ignore this email. 
                            Your password will remain unchanged.
                            <br><br>
                            <strong style = "color: #8b949e;">Best regards,</strong><br>
                            <span style = "color: #f0f6fc;">The TheDevNexus Team</span>
                        </p>
                    </div>
                    
                    <div style = "background-color: #0d1117; padding: 20px 30px; text-align: center; border-top: 1px solid #30363d;">
                        <p style = "color: #6e7681; font-size: 12px; margin: 0;">
                            © 2025 TheDevNexus
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        console.log('MailService: Attempting to send password reset email to:', userEmail);
        console.log('MailService: Reset token provided:', resetToken);
        console.log('MailService: Subject line:', subject);
        console.log('MailService: Reset link generated:', reset_link);
        
        try 
        {
            const result = await this.send_email(userEmail, subject, html);
            console.log('MailService: Password reset email sent successfully:', result);
            return result;
        } catch(error) 
        {
            console.error('❌ MailService: Failed to send password reset email:', error);
            throw error;
        }
    }

    async send_pass_change_confirmation(userEmail, userName) 
    {
        const subject = 'Password Successfully Changed - TheDevNexus';
        const html = `
            <!DOCTYPE html>
            <html lang = "en">
            <head>
                <meta charset = "UTF-8">
                <meta name = "viewport" content = "width=device-width, initial-scale = 1.0">
                <title>Password Changed</title>
            </head>
            <body style = "margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0d1117;">
                <div style = "max-width: 600px; margin: 0 auto; background-color: #161b22; border: 1px solid #30363d; border-radius: 12px; overflow: hidden;">

                <div style = "background: linear-gradient(135deg, #238636 0%, #2ea043 100%); padding: 40px 30px; text-align: center;">
                        <h1 style = "color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">TheDevNexus</h1>
                        <p style = "color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">Password Successfully Changed</p>
                    </div>
                    
                    <div style = "padding: 40px 30px;">
                        <h2 style = "color: #f0f6fc; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hello, ${userName}!</h2>
                        
                        <div style = "background-color: #0f2419; border: 1px solid #1a7f37; border-radius: 8px; padding: 20px; margin: 30px 0;">
                            <p style = "color: #3fb950; margin: 0; font-size: 16px; text-align: center; font-weight: 600;">
                                Your password has been successfully changed!
                            </p>
                        </div>
                        
                        <p style = "color: #8b949e; line-height: 1.6; font-size: 16px; margin: 0 0 30px 0;">
                            This is a confirmation that the password for your TheDevNexus account was successfully updated.
                        </p>
                        
                        <div style = "background-color: #21262d; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin: 30px 0;">
                            <p style = "color: #8b949e; margin: 0; font-size: 14px; line-height: 1.4;">
                                <strong style = "color: #f0f6fc;">Security tip:</strong><br>
                                If you didn't make this change, please contact our support team immediately.
                            </p>
                        </div>
                        
                        <hr style = "border: none; border-top: 1px solid #30363d; margin: 40px 0;">
                        
                        <p style = "color: #6e7681; font-size: 13px; line-height: 1.4; margin: 0;">
                            <strong style = "color: #8b949e;">Best regards,</strong><br>
                            <span style = "color: #f0f6fc;">The TheDevNexus Team</span>
                        </p>
                    </div>
                    
                    <div style = "background-color: #0d1117; padding: 20px 30px; text-align: center; border-top: 1px solid #30363d;">
                        <p style = "color: #6e7681; font-size: 12px; margin: 0;">
                            © 2025 TheDevNexus
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.send_email(userEmail, subject, html);
    }

    async send_new_comment_notification(authorEmail, authorName, commenterName, postTitle, commentContent) 
    {
        const subject = `Новий коментар до вашого поста "${postTitle}"`;
        const html = `
            <div style = "font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style = "color: #27ae60;">Новий коментар!</h2>
                <p>Привіт, ${authorName}!</p>
                <p><strong>${commenterName}</strong> залишив коментар до вашого поста <strong>"${postTitle}"</strong>:</p>
                <div style = "background-color: #f8f9fa; padding: 15px; border-left: 4px solid #27ae60; margin: 20px 0;">
                    <p style = "margin: 0; font-style: italic;">${commentContent}</p>
                </div>
                <p style = "color: #7f8c8d; font-size: 12px;">
                    Ви можете відповісти на коментар, увійшовши на сайт.
                </p>
            </div>
        `;

        return await this.send_email(authorEmail, subject, html);
    }

    async send_post_liked_notification(authorEmail, authorName, likerName, postTitle) 
    {
        const subject = `Ваш пост "${postTitle}" сподобався!`;
        const html = `
            <div style = "font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style = "color: #3498db;">👍 Ваш пост сподобався!</h2>
                <p>Привіт, ${authorName}!</p>
                <p><strong>${likerName}</strong> поставив лайк вашому посту <strong>"${postTitle}"</strong>!</p>
                <p style = "color: #7f8c8d; font-size: 12px;">
                    Продовжуйте створювати цікавий контент!
                </p>
            </div>
        `;

        return await this.send_email(authorEmail, subject, html);
    }

    async send_weekly_digest(userEmail, userName, topPosts) 
    {
        const subject = 'Щотижневий дайджест - Найкращі пости тижня';
        
        const posts_html = topPosts.map(post => `
            <div style = "border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
                <h3 style = "color: #2c3e50; margin-top: 0;">${post.title}</h3>
                <p style = "color: #7f8c8d;">Автор: ${post.author_name} | Лайків: ${post.like_count}</p>
                <p>${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</p>
            </div>
        `).join('');

        const html = `
            <div style = "font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style = "color: #8e44ad;">Найкращі пости тижня</h2>
                <p>Привіт, ${userName}!</p>
                <p>Ось найпопулярніші пости цього тижня, які ви могли пропустити:</p>
                ${posts_html}
                <p style = "color: #7f8c8d; font-size: 12px;">
                    Щоб відписатись від розсилки, увійдіть в налаштування профілю.
                </p>
            </div>
        `;

        return await this.send_email(userEmail, subject, html);
    }
}

export default MailService;