class ResponseHandler 
{
    static send_response(res, statusCode = 200, message = 'Success', data = null) 
    {
        const response = {
            status: 'success',
            message,
            ...(data && { data })
        };

        return res.status(statusCode).json(response);
    }

    static send_error(res, statusCode = 500, message = 'Internal server error', error = null) 
    {
        const response = {
            status: 'error',
            message,
            ...(error && { error })
        };

        return res.status(statusCode).json(response);
    }

    static send_paginated_response(res, data, pagination, message = 'Data retrieved successfully') 
    {
        const response = {
            status: 'success',
            message,
            data,
            pagination: 
            {
                page: pagination.page || 1,
                limit: pagination.limit || 20,
                total: pagination.total || data.length,
                has_more: pagination.has_more || false,
                total_pages: pagination.total_pages || Math.ceil((pagination.total || data.length) / (pagination.limit || 20))
            }
        };

        return res.status(200).json(response);
    }

    static send_validation_error(res, errors) 
    {
        const response = {
            status: 'error',
            message: 'Validation failed',
            errors: Array.isArray(errors) ? errors : [errors]
        };

        return res.status(400).json(response);
    }

    static send_not_found(res, resource = 'Resource') 
    {
        const response = {
            status: 'error',
            message: `${resource} not found`
        };

        return res.status(404).json(response);
    }

    static send_unauthorized(res, message = 'Unauthorized access') 
    {
        const response = {
            status: 'error',
            message
        };

        return res.status(401).json(response);
    }

    static send_forbidden(res, message = 'Access forbidden') 
    {
        const response = {
            status: 'error',
            message
        };

        return res.status(403).json(response);
    }

    static send_created(res, data, message = 'Resource created successfully') 
    {
        const response = {
            status: 'success',
            message,
            data
        };

        return res.status(201).json(response);
    }

    static send_no_content(res) 
    {
        return res.status(204).send();
    }
}

export default ResponseHandler;

export const sendResponse = ResponseHandler.send_response;
export const sendError = ResponseHandler.send_error;
export const sendPaginatedResponse = ResponseHandler.send_paginated_response;
export const sendValidationError = ResponseHandler.send_validation_error;
export const sendNotFound = ResponseHandler.send_not_found;
export const sendUnauthorized = ResponseHandler.send_unauthorized;
export const sendForbidden = ResponseHandler.send_forbidden;
export const sendCreated = ResponseHandler.send_created;
export const sendNoContent = ResponseHandler.send_no_content;