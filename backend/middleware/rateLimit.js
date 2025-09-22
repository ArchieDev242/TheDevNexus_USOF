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
            const key = this.getKey(req);
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

            // Add rate limit headers
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
        const limiter = new RateLimit();
        return limiter.limit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 5, // 5 login attempts per 15 minutes
            message: 'Too many authentication attempts, please try again in 15 minutes'
        });
    }

    static api() 
    {
        const limiter = new RateLimit();
        return limiter.limit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 100, // 100 requests per 15 minutes
            message: 'Too many API requests, please try again later'
        });
    }

    static posting() 
    {
        const limiter = new RateLimit();
        return limiter.limit({
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 5, // 5 posts per minute
            message: 'Too many posts created, please wait before posting again'
        });
    }

    static commenting() 
    {
        const limiter = new RateLimit();
        return limiter.limit({
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 10, // 10 comments per minute
            message: 'Too many comments created, please wait before commenting again'
        });
    }

    static password_reset() 
    {
        const limiter = new RateLimit();
        return limiter.limit({
            windowMs: 60 * 60 * 1000, // 1 hour
            maxRequests: 3, // 3 password reset attempts per hour
            message: 'Too many password reset attempts, please try again in an hour'
        });
    }

    getKey(req) 
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
