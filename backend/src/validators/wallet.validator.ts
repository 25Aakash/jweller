import Joi from 'joi';

/**
 * Validation schemas for wallet and payment endpoints
 */

export const createPaymentOrderSchema = Joi.object({
    amount: Joi.number().positive().min(100).max(100000).required().messages({
        'number.positive': 'Amount must be positive',
        'number.min': 'Minimum amount is ₹100',
        'number.max': 'Maximum amount is ₹1,00,000',
        'any.required': 'Amount is required',
    }),
});

export const verifyPaymentSchema = Joi.object({
    razorpay_order_id: Joi.string().required().messages({
        'any.required': 'Order ID is required',
    }),
    razorpay_payment_id: Joi.string().required().messages({
        'any.required': 'Payment ID is required',
    }),
    razorpay_signature: Joi.string().required().messages({
        'any.required': 'Payment signature is required',
    }),
});
