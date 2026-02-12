import { Request, Response, NextFunction } from 'express';
import * as otpService from '../services/otp.service';
import * as authService from '../services/auth.service';
import { ValidationError } from '../utils/errors';
import { User, Jeweller } from '../models';

/**
 * Send OTP to phone number
 */
export const sendOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { phone_number, jeweller_id } = req.body;

        const result = await otpService.sendOTP(phone_number, jeweller_id);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            expires_at: result.expiresAt,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Register new customer with OTP verification
 */
export const registerCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { phone_number, otp_code, jeweller_id, name, password, state, city } = req.body;

        // Verify OTP
        const isValid = await otpService.verifyOTP(phone_number, otp_code, jeweller_id);

        if (!isValid) {
            throw new ValidationError('Invalid or expired OTP');
        }

        // Register customer
        const authResult = await authService.registerCustomer(
            phone_number,
            jeweller_id,
            name,
            password,
            state,
            city
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            ...authResult,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login customer with password
 */
export const loginCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { phone_number, password, jeweller_id } = req.body;

        const authResult = await authService.loginCustomerWithPassword(
            phone_number,
            password,
            jeweller_id
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            ...authResult,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify OTP and login customer (legacy - for OTP-only login)
 */
export const verifyOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { phone_number, otp_code, jeweller_id, name } = req.body;

        // Verify OTP
        const isValid = await otpService.verifyOTP(phone_number, otp_code, jeweller_id);

        if (!isValid) {
            throw new ValidationError('Invalid or expired OTP');
        }

        // Login customer
        const authResult = await authService.loginCustomerWithOTP(
            phone_number,
            jeweller_id,
            name
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            ...authResult,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin login with email and password
 */
export const loginAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password, jeweller_id } = req.body;

        const authResult = await authService.loginAdmin(email, password, jeweller_id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            ...authResult,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Refresh access token
 */
export const refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            throw new ValidationError('Refresh token is required');
        }

        const result = await authService.refreshAccessToken(refresh_token);

        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Logout user
 */
export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { refresh_token } = req.body;

        if (refresh_token) {
            await authService.logout(refresh_token);
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user info
 */
export const getCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        res.status(200).json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * One-time setup: Create Jeweller + first Admin account
 * Only works if no admin user exists yet
 */
export const setupJeweller = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { jeweller_name, email, password, admin_name, phone_number } = req.body;

        // Check if any admin already exists - if so, block setup
        const existingAdmin = await User.findOne({ role: 'ADMIN' });
        if (existingAdmin) {
            res.status(403).json({
                success: false,
                error: 'Setup already completed. Use admin login instead.',
            });
            return;
        }

        const jewellerId = '550e8400-e29b-41d4-a716-446655440000';

        // Create or update jeweller
        await Jeweller.findOneAndUpdate(
            { jeweller_id: jewellerId },
            {
                jeweller_id: jewellerId,
                name: jeweller_name || 'Riddhi Siddhi Trading Co.',
                margin_percentage: 3,
                margin_fixed: 0,
            },
            { upsert: true, new: true }
        );

        // Create admin user
        const admin = await authService.createAdminUser(
            jewellerId,
            email,
            password,
            admin_name,
            phone_number
        );

        res.status(201).json({
            success: true,
            message: 'Jeweller setup completed. You can now login as admin.',
            jeweller_id: jewellerId,
            admin,
        });
    } catch (error) {
        next(error);
    }
};
