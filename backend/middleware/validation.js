import error_handler from './errorHandler.js';

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

        if(errors.length > 0) return next(error_handler.validation_error(errors));

        next();
    }

    static validate_user_login(req, res, next) 
    {
        const { login, email, loginOrEmail, password } = req.body;
        const errors = [];

        if(!password) errors.push('Password is required');

        if(!login && !email && !loginOrEmail) errors.push('Login or email is required');

        if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email format required');

        if(errors.length > 0) return next(error_handler.validation_error(errors));

        next();
    }

    static validate_post(req, res, next) 
    {
        const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
        const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
        const raw_categories = req.body.categories;
        const errors = [];

        let categories = Array.isArray(raw_categories) ? raw_categories : [];

        if(!Array.isArray(raw_categories) && typeof raw_categories === 'string')
        {
            try
            {
                const parsed = JSON.parse(raw_categories);
                if(Array.isArray(parsed)) categories = parsed;
            } catch
            {
                categories = raw_categories.split(',').map(item => item.trim()).filter(Boolean);
            }
        }

        categories = categories
            .map(category => {
                if(typeof category === 'number') return category;

                if(typeof category === 'string' && category.trim() !== '')
                {
                    const parsed = parseInt(category, 10);
                    return isNaN(parsed) ? null : parsed;
                }
                return null;
            })
            
            .filter(category => category !== null);

        req.body.title = title;
        req.body.content = content;
        req.body.categories = categories;

        console.log('=== POST VALIDATION ===');
        console.log('Title:', title, '(length:', title.length, ')');
        console.log('Content:', content, '(length:', content.length, ')');
        console.log('Categories:', categories);
        console.log('User:', req.user?.id, 'Role:', req.user?.role);

        if(!title || title.length < 3) errors.push('Post title must be at least 3 characters long');

        if(!content || content.length < 5) errors.push('Post content must be at least 5 characters long');

        if(!categories || categories.length === 0) 
        {
            errors.push('At least one category is required');
        }

        if(errors.length > 0) 
        {
            console.log('Validation errors:', errors);
            console.log('======================');
            return next(error_handler.validation_error(errors));
        }

        console.log('Validation passed!');
        console.log('======================');
        next();
    }

    static validate_comment(req, res, next) 
    {
        const { content } = req.body;
        const errors = [];

        if(!content || content.length < 1) errors.push('Comment content is required');

        if(content && content.length > 1000) errors.push('Comment content cannot exceed 1000 characters');

        if(errors.length > 0) return next(error_handler.validation_error(errors));

        next();
    }

    static validate_category(req, res, next) 
    {
        const { title, description } = req.body;
        const errors = [];

        if(!title || title.length < 2) errors.push('Category title must be at least 2 characters long');

        if(description && description.length > 500) errors.push('Category description cannot exceed 500 characters');

        if(errors.length > 0) return next(error_handler.validation_error(errors));

        next();
    }

    // password reset validation
    static validate_password_reset(req, res, next) 
    {
        const { email } = req.body;
        const errors = [];

        const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if(!email || !email_regex.test(email)) errors.push('Valid email is required');

        if(errors.length > 0) return next(error_handler.validation_error(errors));

        next();
    }

    static validate_new_password(req, res, next) 
    {
        const { new_password, newPassword, email, token } = req.body;
        const password = new_password || newPassword;
        const errors = [];

        if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
        if(!token || typeof token !== 'string') errors.push('Valid token is required');
        if(!password || password.length < 8) errors.push('Password must be at least 8 characters long');

        if(errors.length > 0) return next(error_handler.validation_error(errors));

        next();
    }

    static validate_id(paramName = 'id') 
    {
        return (req, res, next) => {
            const id = req.params[paramName];
            
            if(!id || isNaN(parseInt(id))) return next(error_handler.validation_error([`Invalid ${paramName} parameter`]));

            next();
        };
    }

    static validate_like_action(req, res, next) 
    {
        const { type } = req.body;
        const errors = [];

        if(!type) 
            {
            errors.push('Like type is required');
        } else if(!['like', 'dislike', 'thanks'].includes(type)) 
            {
            errors.push('Like type must be one of: like, dislike, thanks');
        }

        if(errors.length > 0) return next(error_handler.validation_error(errors));

        next();
    }

    static validate_reputation_action(req, res, next) 
    {
        const { value } = req.body;
        const errors = [];

        const numeric_value = parseInt(value);

        if(value === undefined) 
            {
            errors.push('Reputation value is required');
        } else if(isNaN(numeric_value) || ![-1, 1].includes(numeric_value)) 
            {
            errors.push('Reputation value must be +1 or -1');
        }

        if(errors.length > 0) return next(error_handler.validation_error(errors));

        req.body.value = numeric_value;

        next();
    }
}

export default Validator;
