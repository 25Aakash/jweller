import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../config/jwt';
import { AuthenticationError } from '../utils/errors';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError('No token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            const payload = verifyAccessToken(token);
            req.user = payload;
            next();
        } catch (error) {
            throw new AuthenticationError('Invalid or expired token');
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't fail if not
 */
export const optionalAuthenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const payload = verifyAccessToken(token);
                req.user = payload;
            } catch (error) {
                // Silently ignore invalid tokens for optional auth
            }
        }
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Authorization middleware
 * Checks if user has required role(s)
 */
export const authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new AuthenticationError('Authentication required');
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new AuthenticationError('Insufficient permissions');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
