import crypto from 'crypto';
import razorpay, { RAZORPAY_WEBHOOK_SECRET } from '../config/razorpay';
import { PaymentError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { addMoneyToWallet } from './wallet.service';

/**
 * Create Razorpay order for wallet top-up
 */
export const createPaymentOrder = async (
    userId: string,
    jewellerId: string,
    amount: number
): Promise<{ orderId: string; keyId: string; amount: number }> => {
    try {
        if (amount < 100) {
            throw new ValidationError('Minimum amount is ₹100');
        }

        if (amount > 100000) {
            throw new ValidationError('Maximum amount is ₹1,00,000');
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt: `rcpt_${Date.now()}_${userId.substring(0, 8)}`,
            notes: {
                user_id: userId,
                jeweller_id: jewellerId,
            },
        });

        logger.info(`Payment order created: ${order.id} for user ${userId}`);

        return {
            orderId: order.id,
            keyId: process.env.RAZORPAY_KEY_ID || '',
            amount: amount,
        };
    } catch (error) {
        logger.error('Error in createPaymentOrder:', error);
        throw new PaymentError('Failed to create payment order');
    }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPaymentSignature = (
    orderId: string,
    paymentId: string,
    signature: string
): boolean => {
    try {
        const text = `${orderId}|${paymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(text)
            .digest('hex');

        return expectedSignature === signature;
    } catch (error) {
        logger.error('Error in verifyPaymentSignature:', error);
        return false;
    }
};

/**
 * Process successful payment
 */
export const processSuccessfulPayment = async (
    orderId: string,
    paymentId: string,
    signature: string
): Promise<any> => {
    try {
        // Verify signature
        const isValid = verifyPaymentSignature(orderId, paymentId, signature);
        if (!isValid) {
            throw new PaymentError('Invalid payment signature');
        }

        // Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(paymentId);

        if (payment.status !== 'captured' && payment.status !== 'authorized') {
            throw new PaymentError('Payment not successful');
        }

        const userId = payment.notes.user_id;
        const jewellerId = payment.notes.jeweller_id;
        const amount = payment.amount / 100; // Convert from paise to rupees

        // Add money to wallet
        const wallet = await addMoneyToWallet(
            userId,
            jewellerId,
            amount,
            paymentId,
            payment
        );

        logger.info(`Payment processed successfully: ${paymentId}`);

        return {
            success: true,
            wallet,
            payment: {
                id: paymentId,
                amount: amount,
                status: payment.status,
            },
        };
    } catch (error) {
        logger.error('Error in processSuccessfulPayment:', error);
        throw error;
    }
};

/**
 * Handle Razorpay webhook
 */
export const handleWebhook = async (
    body: any,
    signature: string
): Promise<void> => {
    try {
        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
            .update(JSON.stringify(body))
            .digest('hex');

        if (expectedSignature !== signature) {
            throw new PaymentError('Invalid webhook signature');
        }

        const event = body.event;
        const payload = body.payload.payment.entity;

        logger.info(`Webhook received: ${event}`);

        // Handle different webhook events
        switch (event) {
            case 'payment.captured':
                // Payment successful
                const userId = payload.notes.user_id;
                const jewellerId = payload.notes.jeweller_id;
                const amount = payload.amount / 100;

                await addMoneyToWallet(
                    userId,
                    jewellerId,
                    amount,
                    payload.id,
                    payload
                );
                break;

            case 'payment.failed':
                // Payment failed - log for debugging
                logger.warn(`Payment failed: ${payload.id}`, payload);
                break;

            default:
                logger.info(`Unhandled webhook event: ${event}`);
        }
    } catch (error) {
        logger.error('Error in handleWebhook:', error);
        throw error;
    }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (paymentId: string): Promise<any> => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return {
            id: payment.id,
            amount: payment.amount / 100,
            status: payment.status,
            method: payment.method,
            created_at: payment.created_at,
        };
    } catch (error) {
        logger.error('Error in getPaymentStatus:', error);
        throw new PaymentError('Failed to fetch payment status');
    }
};
