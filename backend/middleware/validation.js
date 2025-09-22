import ErrorHandler from './errorHandler.js';

class Validator 
{
    // user validation
    static validate_user_registration(req, res, next) 
    {
        const { login, password, password_confirmation, email, full_name } = req.body;
        const errors = [];

        // login
        if(!login || login.length < 3) errors.push('Login must be at least 3 characters long');
    
        if(!/^[a-zA-Z0-9_]+$/.test(login)) errors.push('Login can only contain letters, numbers and underscores');

        // password
        if(!password || password.length < 6) errors.push('Password must be at least 6 characters long');

        if(password_confirmation && password !== password_confirmation) errors.push('Passwords do not match');

        // email
        const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if(!email || !email_regex.test(email)) errors.push('Valid email is required');

        // full name
        if(!full_name || full_name.length < 2) errors.push('Full name must be at least 2 characters long');

        if(errors.length > 0) return next(ErrorHandler.validation_error(errors));

        next();
    }

    static validate_user_login(req, res, next) 
    {
        const { login, email, password } = req.body;
        const errors = [];

        if(!password) errors.push('Password is required');

        if(!login && !email) errors.push('Login or email is required');

        if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email format required');

        if(errors.length > 0) return next(ErrorHandler.validation_error(errors));

        next();
    }

    static validate_post(req, res, next) 
    {
        const { title, content, categories } = req.body;
        const errors = [];

        if(!title || title.length < 5) errors.push('Post title must be at least 5 characters long');

        if(!content || content.length < 10) errors.push('Post content must be at least 10 characters long');

        if(!categories || !Array.isArray(categories) || categories.length === 0) errors.push('At least one category is required');

        if(errors.length > 0) return next(ErrorHandler.validation_error(errors));

        next();
    }

    static validate_comment(req, res, next) 
    {
        const { content } = req.body;
        const errors = [];

        if(!content || content.length < 1) errors.push('Comment content is required');

        if(content && content.length > 1000) errors.push('Comment content cannot exceed 1000 characters');

        if(errors.length > 0) return next(ErrorHandler.validation_error(errors));

        next();
    }

    static validate_category(req, res, next) 
    {
        const { title, description } = req.body;
        const errors = [];

        if(!title || title.length < 2) errors.push('Category title must be at least 2 characters long');

        if(description && description.length > 500) errors.push('Category description cannot exceed 500 characters');

        if(errors.length > 0) return next(ErrorHandler.validation_error(errors));

        next();
    }

    // password reset validation
    static validate_password_reset(req, res, next) 
    {
        const { email } = req.body;
        const errors = [];

        const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if(!email || !email_regex.test(email)) errors.push('Valid email is required');

        if(errors.length > 0) return next(ErrorHandler.validation_error(errors));

        next();
    }

    static validate_new_password(req, res, next) 
    {
        const { new_password } = req.body;
        const errors = [];

        if(!new_password || new_password.length < 6) errors.push('New password must be at least 6 characters long');

        if(errors.length > 0) return next(ErrorHandler.validation_error(errors));

        next();
    }

    static validate_id(paramName = 'id') 
    {
        return (req, res, next) => {
            const id = req.params[paramName];
            
            if(!id || isNaN(parseInt(id))) return next(ErrorHandler.validation_error([`Invalid ${paramName} parameter`]));

            next();
        };
    }
}

export default Validator;
