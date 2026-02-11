import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../utils/errors';

/**
 * Role-based access control middleware
 * Restricts access to routes based on user role
 */
export const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new AuthorizationError('User not authenticated');
            }

            const { role } = req.user;

            if (!allowedRoles.includes(role)) {
                throw new AuthorizationError(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Customer-only middleware
 */
export const requireCustomer = requireRole('CUSTOMER');

/**
 * Admin or Customer middleware
 */
export const requireAuthenticated = requireRole('ADMIN', 'CUSTOMER');
