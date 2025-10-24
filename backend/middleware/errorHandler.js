class error_handler 
{
    static not_found(req, res, next) 
    {
        const error = new Error(`Not Found - ${req.originalUrl}`);
        error.status = 404;
        next(error);
    }

    static handler(error, req, res, next) 
    {
        const status_code = error.status || error.statusCode || 500;
        
        // log error for debugging
        console.error(`Error ${status_code}: ${error.message}`);
        if(error.details) console.error('Validation details:', error.details);
        
        if(process.env.NODE_ENV === 'development') console.error(error.stack);

        res.status(status_code).json({
            status: 'error',
            message: error.message || 'Internal Server Error',
            ...(error.details && { errors: error.details }),
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }

    static async_handler(fn) 
    {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }

    static validation_error(errors) 
    {
        const error = new Error('Validation Error');
        error.status = 400;
        error.details = errors;
        return error;
    }

    static not_found_error(resource) 
    {
        const error = new Error(`${resource} not found`);
        error.status = 404;
        return error;
    }

    static forbidden_error(message = 'Access forbidden') 
    {
        const error = new Error(message);
        error.status = 403;
        return error;
    }

    static unauthorized_error(message = 'Authentication required') 
    {
        const error = new Error(message);
        error.status = 401;
        return error;
    }
}

export default error_handler;
