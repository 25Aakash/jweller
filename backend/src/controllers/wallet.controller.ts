import { Request, Response, NextFunction } from 'express';
import * as walletService from '../services/wallet.service';
import * as paymentService from '../services/payment.service';

/**
 * Get wallet balance
 */
export const getWalletBalance = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.user_id;
        const jewellerId = req.user!.jeweller_id;

        const wallet = await walletService.getWallet(userId, jewellerId);

        res.status(200).json({
            success: true,
            wallet: {
                balance: wallet.balance,
                gold_grams: wallet.gold_grams,
                updated_at: wallet.updated_at,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get transaction history
 */
export const getTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.user_id;
        const jewellerId = req.user!.jeweller_id;
        const { limit, offset } = req.query;

        const transactions = await walletService.getTransactionHistory(
            userId,
            jewellerId,
            parseInt(limit as string) || 50,
            parseInt(offset as string) || 0
        );

        res.status(200).json({
            success: true,
            transactions,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create payment order for adding money
 */
export const createPaymentOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { amount } = req.body;
        const userId = req.user!.user_id;
        const jewellerId = req.user!.jeweller_id;

        const order = await paymentService.createPaymentOrder(
            userId,
            jewellerId,
            amount
        );

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify payment and add money to wallet
 */
export const verifyPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const result = await paymentService.processSuccessfulPayment(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        res.status(200).json({
            success: true,
            message: 'Payment verified and wallet updated',
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Razorpay webhook handler
 */
export const handleWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const signature = req.headers['x-razorpay-signature'] as string;
        const body = req.body;

        await paymentService.handleWebhook(body, signature);

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};
