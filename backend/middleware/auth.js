import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Permission from '../models/Permission.js';
import GuestSession from '../models/GuestSession.js';

class AuthMiddleware 
{
    static async identify_user(req, res, next) 
    {
        try 
        {
            req.user = null; // guest by default
            req.guestSession = null;
            
            // check JWT token for registered users
            const auth_header = req.headers.authorization;
            
            if(auth_header && auth_header.startsWith('Bearer ')) 
                {
                const token = auth_header.substring(7);
                
                try 
                {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    req.user = await User.find_by_id(decoded.userId);
                } catch(jwtError) 
                {
                    console.log('Invalid JWT token:', jwtError.message);
                }
            }
            
            if(!req.user) 
                {
                const session_token = req.headers['x-guest-session'] || req.cookies?.guestSession;
                
                if(session_token) 
                    {
                    req.guestSession = await GuestSession.find_by_token(session_token);
                    
                    if(req.guestSession) 
                        {
                        await req.guestSession.update_activity();
                    }
                }
                
                // if guest session not exists, create a new one
                if(!req.guestSession) 
                    {
                    const user_agent = req.headers['user-agent'] || '';
                    const ip_address = req.ip || req.connection.remoteAddress;
                    
                    req.guestSession = await GuestSession.create_new_session(ip_address, user_agent);

                    // set cookie for guest
                    res.cookie('guestSession', req.guestSession.session_token, {
                        maxAge: 24 * 60 * 60 * 1000, // 24 hours
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production'
                    });
                }
            }
            
            next();
        } 
        catch(error) 
        {
            console.error('Error in identifyUser middleware:', error);
            next(error);
        }
    }

    static require_permission(permission) 
    {
        return async (req, res, next) => {
            try {
                const has_permission = await Permission.check_user_permission(req.user, permission);
                
                if(!has_permission) 
                    {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Insufficient permissions',
                        required_permission: permission,
                        user_role: req.user ? req.user.role : 'guest'
                    });
                }
                
                next();
            } catch(error) 
            {
                console.error('Error checking permission:', error);
                res.status(500).json({
                    status: 'error',
                    message: 'Error checking permissions'
                });
            }
        };
    }

    static require_auth(req, res, next) 
    {
        if(!req.user) 
            {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }
        
        next();
    }

    static require_admin(req, res, next) 
    {
        if(!req.user || req.user.role !== 'admin') 
            {
            return res.status(403).json({
                status: 'error',
                message: 'Admin access required'
            });
        }
        
        next();
    }

    static require_ownership_or_admin(getResourceOwnerId) 
    {
        return (req, res, next) => {
            if(!req.user) 
                {
                return res.status(401).json({
                    status: 'error',
                    message: 'Authentication required'
                });
            }
            
            const resource_owner_id = getResourceOwnerId(req);
            
            if(req.user.role === 'admin' || req.user.id === resource_owner_id) 
                {
                next();
            } else 
                {
                res.status(403).json({
                    status: 'error',
                    message: 'Access denied: insufficient permissions'
                });
            }
        };
    }

    static get_user_info(req) 
    {
        if(req.user) 
            {
            return {
                type: 'user',
                id: req.user.id,
                role: req.user.role,
                login: req.user.login
            };
        } else if(req.guestSession) 
            {
            return {
                type: 'guest',
                sessionId: req.guestSession.id,
                sessionToken: req.guestSession.session_token
            };
        } else 
            {
            return {
                type: 'anonymous'
            };
        }
    }

    static async cleanup_guest_sessions() 
    {
        try 
        {
            const deleted_count = await GuestSession.cleanup_old_sessions(24);
            console.log(`Cleaned up ${deleted_count} old guest sessions`);
        } catch(error) 
        {
            console.error('Error cleaning up guest sessions:', error);
        }
    }

    static cors_for_guests(req, res, next) 
    {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Guest-Session');
        
        if(req.method === 'OPTIONS')
            {
            res.sendStatus(200);
        } else 
            {
            next();
        }
    }
}

export default AuthMiddleware;