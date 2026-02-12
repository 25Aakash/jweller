import Joi from 'joi';

/**
 * Validation schemas for authentication endpoints
 */

export const sendOTPSchema = Joi.object({
    phone_number: Joi.string()
        .pattern(/^(\+91)?[6-9]\d{9}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid phone number format',
            'any.required': 'Phone number is required',
        }),
    jeweller_id: Joi.string().uuid().required().messages({
        'string.guid': 'Invalid jeweller ID format',
        'any.required': 'Jeweller ID is required',
    }),
});

export const verifyOTPSchema = Joi.object({
    phone_number: Joi.string()
        .pattern(/^(\+91)?[6-9]\d{9}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid phone number format',
            'any.required': 'Phone number is required',
        }),
    otp_code: Joi.string()
        .pattern(/^\d{6}$/)
        .required()
        .messages({
            'string.pattern.base': 'OTP must be 6 digits',
            'any.required': 'OTP code is required',
        }),
    jeweller_id: Joi.string().uuid().required(),
    name: Joi.string().min(2).max(100).optional(),
});

export const registerSchema = Joi.object({
    phone_number: Joi.string()
        .pattern(/^(\+91)?[6-9]\d{9}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid phone number format',
            'any.required': 'Phone number is required',
        }),
    otp_code: Joi.string()
        .pattern(/^\d{6}$/)
        .required()
        .messages({
            'string.pattern.base': 'OTP must be 6 digits',
            'any.required': 'OTP code is required',
        }),
    jeweller_id: Joi.string().uuid().required(),
    name: Joi.string().min(2).max(100).required().messages({
        'any.required': 'Name is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required',
    }),
    state: Joi.string().min(2).max(100).required().messages({
        'any.required': 'State is required',
    }),
    city: Joi.string().min(2).max(100).required().messages({
        'any.required': 'City is required',
    }),
});

export const loginSchema = Joi.object({
    phone_number: Joi.string()
        .pattern(/^(\+91)?[6-9]\d{9}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid phone number format',
            'any.required': 'Phone number is required',
        }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required',
    }),
    jeweller_id: Joi.string().uuid().required(),
});

export const adminLoginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required',
    }),
    jeweller_id: Joi.string().uuid().required(),
});

export const refreshTokenSchema = Joi.object({
    refresh_token: Joi.string().required().messages({
        'any.required': 'Refresh token is required',
    }),
});

export const setupSchema = Joi.object({
    jeweller_name: Joi.string().min(2).max(200).optional(),
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required',
    }),
    admin_name: Joi.string().min(2).max(100).required().messages({
        'any.required': 'Admin name is required',
    }),
    phone_number: Joi.string()
        .pattern(/^(\+91)?[6-9]\d{9}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid phone number format',
            'any.required': 'Phone number is required',
        }),
});
