const { sendResponse: send_response, sendError: send_error } = require('../utils/responseHandler');

class services_controller 
{
    // GET /api/services/status
    static async get_services_status(req, res) {
        try 
        {
            const services_status = {
                code_snippet_service: 
                {
                    name: 'Code Snippet Service',
                    status: 'available',
                    features: ['syntax highlighting', 'code execution (JavaScript)', 'code validation', 'code formatting'],
                    supported_languages: ['javascript', 'python', 'java', 'cpp', 'html', 'css', 'sql']
                },
                mail_service: 
                {
                    name: 'Mail Service', 
                    status: 'available',
                    features: ['email verification', 'password reset', 'notifications', 'weekly digest'],
                    configured: process.env.SMTP_HOST ? true : false
                },
                file_processing_service: 
                {
                    name: 'File Processing Service',
                    status: 'available',
                    features: ['image processing', 'thumbnail generation', 'image optimization', 'format conversion'],
                    supported_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
                },
                notification_service: 
                {
                    name: 'Notification Service',
                    status: 'available',
                    features: ['in-app notifications', 'email integration', 'push notifications', 'system announcements']
                }
            };

            return send_response(res, 200, 'Services status retrieved successfully', services_status);
        } catch(error) 
        {
            return send_error(res, 500, 'Error retrieving services status', error.message);
        }
    }

    // POST /api/services/code/execute
    static async execute_code(req, res) 
    {
        try 
        {
            return send_error(res, 501, 'Code execution service temporarily disabled', 
                'Service needs to be converted to ES6 modules');
        } catch(error) 
        {
            return send_error(res, 500, 'Code execution error', error.message);
        }
    }

    // POST /api/services/code/highlight
    static async highlight_code(req, res) 
    {
        try 
        {
            return send_error(res, 501, 'Code highlighting service temporarily disabled',
                'Service needs to be converted to ES6 modules');
        } catch(error) 
        {
            return send_error(res, 500, 'Code highlighting error', error.message);
        }
    }

    // POST /api/services/mail/test
    static async test_mail_service(req, res) 
    {
        try 
        {
            return send_error(res, 501, 'Mail service temporarily disabled',
                'Service needs to be converted to ES6 modules and configured');
        } catch(error) 
        {
            return send_error(res, 500, 'Mail service error', error.message);
        }
    }

    // GET /api/services/documentation
    static async get_documentation(req, res) 
    {
        try 
        {
            const documentation = {
                overview: 'TheDevNexus Services Layer - Enhanced functionality for the platform',
                services: 
                {
                    code_snippet_service: 
                    {
                        description: 'Handle code syntax highlighting, safe execution, and validation',
                        endpoints: [
                            'POST /api/posts/execute-code - Execute JavaScript code safely',
                            'POST /api/posts/highlight-code - Highlight code syntax',
                            'POST /api/posts/validate-code - Validate code syntax'
                        ],
                        features: [
                            'VM2 sandbox for safe JavaScript execution',
                            'Highlight.js integration for syntax highlighting',
                            'Support for multiple programming languages',
                            'Execution timeout and memory limits',
                            'Code validation and error reporting'
                        ]
                    },
                    mail_service: 
                    {
                        description: 'Handle email notifications and communications',
                        features: [
                            'User email verification',
                            'Password reset emails', 
                            'New comment notifications',
                            'Weekly digest emails',
                            'HTML and text email templates'
                        ],
                        configuration: 'Requires SMTP configuration in environment variables'
                    },
                    file_processing_service: 
                    {
                        description: 'Process and optimize uploaded files',
                        features: [
                            'Image resizing and optimization',
                            'Thumbnail generation',
                            'Format conversion',
                            'File validation',
                            'Automatic cleanup of processed files'
                        ]
                    },
                    notification_service: 
                    {
                        description: 'Manage in-app notifications and alerts',
                        endpoints: [
                            'GET /api/notifications - Get user notifications',
                            'GET /api/notifications/unread - Get unread notifications',
                            'PUT /api/notifications/:id/read - Mark notification as read',
                            'DELETE /api/notifications/:id - Delete notification'
                        ],
                        features: [
                            'Real-time notifications',
                            'Email integration',
                            'Notification categories (like, comment, reply, follow, system)',
                            'Read/unread status tracking',
                            'Automatic cleanup of old notifications'
                        ]
                    }
                },
                setup_instructions: 
                {
                    code_service: 'npm install highlight.js vm2',
                    mail_service: 'npm install nodemailer + configure SMTP settings',
                    file_service: 'npm install sharp',
                    notification_service: 'Already integrated with database'
                }
            };

            return send_response(res, 200, 'Services documentation retrieved successfully', documentation);
        } catch(error) 
        {
            return send_error(res, 500, 'Error retrieving documentation', error.message);
        }
    }
}

module.exports = services_controller;
