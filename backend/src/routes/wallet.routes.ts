import { Router } from 'express';
import * as walletController from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth';
import { enforceJewellerScope } from '../middleware/jeweller-scope';
import { requireCustomer } from '../middleware/role-guard';
import { validateBody } from '../middleware/validation';
import { paymentLimiter } from '../middleware/rate-limit';
import {
    createPaymentOrderSchema,
    verifyPaymentSchema,
} from '../validators/wallet.validator';

const router = Router();

// Apply authentication and jeweller scope to all routes except webhook
router.use((req, res, next) => {
    if (req.path === '/webhook') {
        return next();
    }
    authenticate(req, res, next);
});

router.use((req, res, next) => {
    if (req.path === '/webhook') {
        return next();
    }
    enforceJewellerScope(req, res, next);
});

/**
 * @route   GET /api/wallet/balance
 * @desc    Get wallet balance
 * @access  Private (Customer)
 */
router.get('/balance', requireCustomer, walletController.getWalletBalance);

/**
 * @route   GET /api/wallet/transactions
 * @desc    Get transaction history
 * @access  Private (Customer)
 */
router.get('/transactions', requireCustomer, walletController.getTransactions);

/**
 * @route   POST /api/wallet/add-money
 * @desc    Create payment order for adding money
 * @access  Private (Customer)
 */
router.post(
    '/add-money',
    requireCustomer,
    paymentLimiter,
    validateBody(createPaymentOrderSchema),
    walletController.createPaymentOrder
);

/**
 * @route   POST /api/wallet/verify-payment
 * @desc    Verify payment and add money to wallet
 * @access  Private (Customer)
 */
router.post(
    '/verify-payment',
    requireCustomer,
    validateBody(verifyPaymentSchema),
    walletController.verifyPayment
);

/**
 * @route   POST /api/wallet/webhook
 * @desc    Razorpay webhook handler
 * @access  Public (Razorpay only)
 */
router.post('/webhook', walletController.handleWebhook);

export default router;
