import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../utils/errors';

/**
 * Jeweller scope enforcement middleware
 * Ensures that requests are scoped to the authenticated user's jeweller
 * This prevents cross-tenant data access
 */
export const enforceJewellerScope = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        if (!req.user) {
            throw new AuthorizationError('User not authenticated');
        }

        const { jeweller_id } = req.user;

        // Check if request body contains jeweller_id
        if (req.body && req.body.jeweller_id) {
            if (req.body.jeweller_id !== jeweller_id) {
                throw new AuthorizationError('Access denied to this jeweller');
            }
        }

        // Check if query params contain jeweller_id
        if (req.query && req.query.jeweller_id) {
            if (req.query.jeweller_id !== jeweller_id) {
                throw new AuthorizationError('Access denied to this jeweller');
            }
        }

        // Check if route params contain jeweller_id
        if (req.params && req.params.jeweller_id) {
            if (req.params.jeweller_id !== jeweller_id) {
                throw new AuthorizationError('Access denied to this jeweller');
            }
        }

        // Attach jeweller_id to request for easy access
        (req as any).jeweller_id = jeweller_id;

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to add jeweller_id header validation
 * Ensures X-Jeweller-ID header matches authenticated user's jeweller
 */
export const validateJewellerHeader = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const headerJewellerId = req.headers['x-jeweller-id'] as string;

        if (headerJewellerId && req.user) {
            if (headerJewellerId !== req.user.jeweller_id) {
                throw new AuthorizationError('Jeweller ID mismatch');
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};
