import { Request, Response, NextFunction } from 'express';
import * as otpService from '../services/otp.service';
import * as authService from '../services/auth.service';
import { ValidationError } from '../utils/errors';

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
