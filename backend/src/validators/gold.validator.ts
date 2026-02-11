import Joi from 'joi';

/**
 * Validation schemas for gold price and booking endpoints
 */

export const setMCXPriceSchema = Joi.object({
    base_mcx_price: Joi.number().positive().required().messages({
        'number.positive': 'Base MCX price must be positive',
        'any.required': 'Base MCX price is required',
    }),
    effective_date: Joi.date().optional(),
});

export const updateMarginSchema = Joi.object({
    margin_percentage: Joi.number().min(0).max(100).optional().messages({
        'number.min': 'Margin percentage cannot be negative',
        'number.max': 'Margin percentage cannot exceed 100%',
    }),
    margin_fixed: Joi.number().optional(),
}).or('margin_percentage', 'margin_fixed').messages({
    'object.missing': 'At least one margin value is required',
});

export const createBookingSchema = Joi.object({
    amount: Joi.number().positive().min(100).required().messages({
        'number.positive': 'Amount must be positive',
        'number.min': 'Minimum booking amount is ₹100',
        'any.required': 'Amount is required',
    }),
});

export const updateBookingStatusSchema = Joi.object({
    status: Joi.string().valid('ACTIVE', 'REDEEMED', 'CANCELLED').required().messages({
        'any.only': 'Status must be ACTIVE, REDEEMED, or CANCELLED',
        'any.required': 'Status is required',
    }),
});

export const calculateGramsSchema = Joi.object({
    amount: Joi.number().positive().required().messages({
        'number.positive': 'Amount must be positive',
        'any.required': 'Amount is required',
    }),
});
