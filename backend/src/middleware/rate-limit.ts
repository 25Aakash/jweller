import rateLimit from 'express-rate-limit';

/**
 * Rate limiting configurations for different endpoints
 */

// General API rate limiter
export const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// OTP request rate limiter (stricter)
export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.OTP_RATE_LIMIT_MAX || '3'),
    message: 'Too many OTP requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Rate limit by phone number + IP
        const phone = req.body.phone_number || '';
        const ip = req.ip || '';
        return `${phone}_${ip}`;
    },
});

// Login rate limiter
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many login attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Payment rate limiter
export const paymentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: 'Too many payment requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Admin action rate limiter
export const adminLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: 'Too many admin actions, please slow down',
    standardHeaders: true,
    legacyHeaders: false,
});
