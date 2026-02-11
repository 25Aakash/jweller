import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { otpLimiter, loginLimiter } from '../middleware/rate-limit';
import {
    sendOTPSchema,
    verifyOTPSchema,
    registerSchema,
    loginSchema,
    adminLoginSchema,
    refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to phone number
 * @access  Public
 */
router.post(
    '/send-otp',
    otpLimiter,
    validateBody(sendOTPSchema),
    authController.sendOTP
);

/**
 * @route   POST /api/auth/register
 * @desc    Register new customer with OTP verification
 * @access  Public
 */
router.post(
    '/register',
    validateBody(registerSchema),
    authController.registerCustomer
);

/**
 * @route   POST /api/auth/login
 * @desc    Customer login with password
 * @access  Public
 */
router.post(
    '/login',
    loginLimiter,
    validateBody(loginSchema),
    authController.loginCustomer
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and login customer (legacy)
 * @access  Public
 */
router.post(
    '/verify-otp',
    validateBody(verifyOTPSchema),
    authController.verifyOTP
);

/**
 * @route   POST /api/auth/admin/login
 * @desc    Admin login with email and password
 * @access  Public
 */
router.post(
    '/admin/login',
    loginLimiter,
    validateBody(adminLoginSchema),
    authController.loginAdmin
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
    '/refresh-token',
    validateBody(refreshTokenSchema),
    authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
