class RateLimit 
{
    constructor() 
    {
        this.requests = new Map();
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000);
    }

    limit(options = {}) 
    {
        const {
            windowMs = 15 * 60 * 1000, // 15 minutes
            maxRequests = 100,
            message = 'Too many requests, please try again later',
            skipSuccessfulRequests = false,
            skipFailedRequests = false
        } = options;

        return (req, res, next) => {
            const key = this.get_key(req);
            const now = Date.now();
            
            if(!this.requests.has(key)) this.requests.set(key, []); 

            const user_requests = this.requests.get(key);
            
            const valid_requests = user_requests.filter(time => now - time < windowMs);
            
            if(valid_requests.length >= maxRequests) 
                {
                return res.status(429).json({
                    status: 'error',
                    message: message,
                    retryAfter: Math.ceil(windowMs / 1000)
                });
            }

            valid_requests.push(now);
            this.requests.set(key, valid_requests);

            res.set({
                'X-RateLimit-Limit': maxRequests,
                'X-RateLimit-Remaining': Math.max(0, maxRequests - valid_requests.length),
                'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
            });

            next();
        };
    }

    static auth() 
    {
        if (!this._authLimiter) {
            this._authLimiter = new RateLimit();
        }
        return this._authLimiter.limit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 50, // Increased from 5 to 50
            message: 'Too many authentication attempts, please try again later'
        });
    }

    static api() 
    {
        if (!this._apiLimiter) {
            this._apiLimiter = new RateLimit();
        }
        return this._apiLimiter.limit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 100, // 100 requests per 15 minutes
            message: 'Too many API requests, please try again later'
        });
    }

    static password_reset() 
    {
        if (!this._passwordResetLimiter) {
            this._passwordResetLimiter = new RateLimit();
        }
        return this._passwordResetLimiter.limit({
            windowMs: 60 * 60 * 1000, // 1 hour
            maxRequests: 3, // 3 password reset attempts per hour
            message: 'Too many password reset attempts, please try again in an hour'
        });
    }

    static execute_code_limit() 
    {
        if (!this._executeCodeLimiter) {
            this._executeCodeLimiter = new RateLimit();
        }
        return this._executeCodeLimiter.limit({
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 10, // 10 code executions per minute
            message: 'Too many code execution attempts, please wait before trying again'
        });
    }

    get_key(req) 
    {
        // user ID if authenticated, otherwise use IP
        if(req.user) return `user:${req.user.id}`;
        
        return `ip:${req.ip || req.connection.remoteAddress}`;
    }

    cleanup() 
    {
        const now = Date.now();
        const max_age = 60 * 60 * 1000; // 1 hour

        for(const [key, requests] of this.requests.entries()) 
            {
            const valid_requests = requests.filter(time => now - time < max_age);

            if(valid_requests.length === 0) 
                {
                this.requests.delete(key);
            } else 
                {
                this.requests.set(key, valid_requests);
            }
        }
    }

    destroy() 
    {
        if(this.cleanupInterval) clearInterval(this.cleanupInterval);
    }
}

export default RateLimit;
