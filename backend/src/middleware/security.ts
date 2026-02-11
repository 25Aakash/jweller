import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Environment validation middleware
 * Ensures critical environment variables are set
 */
export const validateEnvironment = (req: Request, res: Response, next: NextFunction): void => {
    const requiredVars = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'DB_HOST',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0 && process.env.NODE_ENV === 'production') {
        logger.error(`Missing required environment variables: ${missing.join(', ')}`);
        res.status(500).json({
            success: false,
            error: 'Server configuration error',
        });
        return;
    }

    next();
};

/**
 * Security headers middleware
 * Adds additional security headers beyond helmet
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy (adjust as needed)
    if (process.env.NODE_ENV === 'production') {
        res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
        );
    }

    next();
};

/**
 * Request sanitization middleware
 * Removes potentially dangerous characters from input
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
    const sanitize = (obj: any): any => {
        if (typeof obj === 'string') {
            // Remove null bytes and control characters
            return obj.replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, '');
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
            const sanitized: any = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    sanitized[key] = sanitize(obj[key]);
                }
            }
            return sanitized;
        }
        return obj;
    };

    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }
    if (req.params) {
        req.params = sanitize(req.params);
    }

    next();
};
