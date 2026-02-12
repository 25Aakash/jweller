import bcrypt from 'bcrypt';
import { User, Wallet, RefreshToken } from '../models';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    JWTPayload,
} from '../config/jwt';
import {
    AuthenticationError,
    ValidationError,
    NotFoundError,
} from '../utils/errors';
import { normalizePhoneNumber, isValidEmail } from '../utils/validators';
import logger from '../utils/logger';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

/**
 * Customer login with OTP (after OTP verification)
 */
export const loginCustomerWithOTP = async (
    phoneNumber: string,
    jewellerId: string,
    name?: string
): Promise<{ accessToken: string; refreshToken: string; user: any }> => {
    try {
        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        // Upsert user
        let userData = await User.findOneAndUpdate(
            { jeweller_id: jewellerId, phone_number: normalizedPhone },
            {
                $setOnInsert: {
                    jeweller_id: jewellerId,
                    phone_number: normalizedPhone,
                    name: name || 'Customer',
                    role: 'CUSTOMER',
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (!userData.is_active) {
            throw new AuthenticationError('Account is deactivated');
        }

        const payload: JWTPayload = {
            user_id: userData._id.toString(),
            jeweller_id: userData.jeweller_id,
            role: userData.role,
            phone_number: userData.phone_number,
        };

        const accessToken = generateAccessToken(payload);
        const refreshTokenStr = generateRefreshToken(payload);

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await RefreshToken.create({
            user_id: userData._id,
            token: refreshTokenStr,
            expires_at: expiresAt,
        });

        logger.info(`Customer logged in: ${userData._id}`);

        return {
            accessToken,
            refreshToken: refreshTokenStr,
            user: {
                id: userData._id,
                phone_number: userData.phone_number,
                name: userData.name,
                role: userData.role,
                jeweller_id: userData.jeweller_id,
            },
        };
    } catch (error) {
        logger.error('Error in loginCustomerWithOTP:', error);
        throw error;
    }
};

/**
 * Register new customer with password
 */
export const registerCustomer = async (
    phoneNumber: string,
    jewellerId: string,
    name: string,
    password: string,
    state: string,
    city: string
): Promise<{ accessToken: string; refreshToken: string; user: any }> => {
    try {
        const normalizedPhone = normalizePhoneNumber(phoneNumber);
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        const userData = await User.create({
            phone_number: normalizedPhone,
            jeweller_id: jewellerId,
            name,
            password_hash: passwordHash,
            role: 'CUSTOMER',
            state,
            city,
        });

        // Create wallet
        await Wallet.create({
            user_id: userData._id,
            jeweller_id: jewellerId,
            balance: 0,
            gold_grams: 0,
        });

        const payload: JWTPayload = {
            user_id: userData._id.toString(),
            jeweller_id: userData.jeweller_id,
            role: userData.role,
            phone_number: userData.phone_number,
        };

        const accessToken = generateAccessToken(payload);
        const refreshTokenStr = generateRefreshToken(payload);

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await RefreshToken.create({
            user_id: userData._id,
            token: refreshTokenStr,
            expires_at: expiresAt,
        });

        logger.info(`New customer registered: ${userData._id}`);

        return {
            accessToken,
            refreshToken: refreshTokenStr,
            user: {
                id: userData._id,
                phone_number: userData.phone_number,
                name: userData.name,
                state: userData.state,
                city: userData.city,
                role: userData.role,
                jeweller_id: userData.jeweller_id,
            },
        };
    } catch (error) {
        logger.error('Error in registerCustomer:', error);
        throw error;
    }
};

/**
 * Unified login with phone + password (works for both Customer and Admin/Jeweller)
 */
export const loginCustomerWithPassword = async (
    phoneNumber: string,
    password: string,
    jewellerId: string
): Promise<{ accessToken: string; refreshToken: string; user: any }> => {
    try {
        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        // Find user by phone number regardless of role
        const userData = await User.findOne({
            phone_number: normalizedPhone,
            jeweller_id: jewellerId,
        });

        if (!userData) {
            throw new AuthenticationError('Invalid credentials');
        }

        if (!userData.is_active) {
            throw new AuthenticationError('Account is deactivated');
        }

        if (!userData.password_hash) {
            throw new AuthenticationError('Please register with a password first');
        }

        const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid credentials');
        }

        const payload: JWTPayload = {
            user_id: userData._id.toString(),
            jeweller_id: userData.jeweller_id,
            role: userData.role,
            phone_number: userData.phone_number,
        };

        const accessToken = generateAccessToken(payload);
        const refreshTokenStr = generateRefreshToken(payload);

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await RefreshToken.create({
            user_id: userData._id,
            token: refreshTokenStr,
            expires_at: expiresAt,
        });

        logger.info(`User logged in with password: ${userData._id} (role: ${userData.role})`);

        return {
            accessToken,
            refreshToken: refreshTokenStr,
            user: {
                id: userData._id,
                phone_number: userData.phone_number,
                name: userData.name,
                state: userData.state,
                city: userData.city,
                role: userData.role,
                jeweller_id: userData.jeweller_id,
            },
        };
    } catch (error) {
        logger.error('Error in loginCustomerWithPassword:', error);
        throw error;
    }
};

/**
 * Admin login with email and password
 */
export const loginAdmin = async (
    email: string,
    password: string,
    jewellerId: string
): Promise<{ accessToken: string; refreshToken: string; user: any }> => {
    try {
        if (!isValidEmail(email)) {
            throw new ValidationError('Invalid email format');
        }

        const userData = await User.findOne({
            email: email.toLowerCase(),
            jeweller_id: jewellerId,
            role: 'ADMIN',
        });

        if (!userData) {
            throw new AuthenticationError('Invalid credentials');
        }

        if (!userData.is_active) {
            throw new AuthenticationError('Account is deactivated');
        }

        if (!userData.password_hash) {
            throw new AuthenticationError('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid credentials');
        }

        const payload: JWTPayload = {
            user_id: userData._id.toString(),
            jeweller_id: userData.jeweller_id,
            role: userData.role,
            phone_number: userData.phone_number,
        };

        const accessToken = generateAccessToken(payload);
        const refreshTokenStr = generateRefreshToken(payload);

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await RefreshToken.create({
            user_id: userData._id,
            token: refreshTokenStr,
            expires_at: expiresAt,
        });

        logger.info(`Admin logged in: ${userData._id}`);

        return {
            accessToken,
            refreshToken: refreshTokenStr,
            user: {
                id: userData._id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                jeweller_id: userData.jeweller_id,
            },
        };
    } catch (error) {
        logger.error('Error in loginAdmin:', error);
        throw error;
    }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
    refreshToken: string
): Promise<{ accessToken: string }> => {
    try {
        const payload = verifyRefreshToken(refreshToken);

        const tokenDoc = await RefreshToken.findOne({
            token: refreshToken,
            expires_at: { $gt: new Date() },
        });

        if (!tokenDoc) {
            throw new AuthenticationError('Invalid or expired refresh token');
        }

        const newAccessToken = generateAccessToken({
            user_id: payload.user_id,
            jeweller_id: payload.jeweller_id,
            role: payload.role,
            phone_number: payload.phone_number,
        });

        return { accessToken: newAccessToken };
    } catch (error) {
        logger.error('Error in refreshAccessToken:', error);
        throw error;
    }
};

/**
 * Logout user (invalidate refresh token)
 */
export const logout = async (refreshToken: string): Promise<void> => {
    try {
        await RefreshToken.deleteOne({ token: refreshToken });
        logger.info('User logged out');
    } catch (error) {
        logger.error('Error in logout:', error);
        throw error;
    }
};

/**
 * Create admin user (for initial setup)
 */
export const createAdminUser = async (
    jewellerId: string,
    email: string,
    password: string,
    name: string,
    phoneNumber: string
): Promise<any> => {
    try {
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        const userData = await User.create({
            jeweller_id: jewellerId,
            email: email.toLowerCase(),
            password_hash: passwordHash,
            name,
            phone_number: normalizePhoneNumber(phoneNumber),
            role: 'ADMIN',
        });

        logger.info(`Admin user created: ${userData._id}`);
        return {
            id: userData._id,
            email: userData.email,
            name: userData.name,
            phone_number: userData.phone_number,
            role: userData.role,
            jeweller_id: userData.jeweller_id,
        };
    } catch (error) {
        logger.error('Error in createAdminUser:', error);
        throw error;
    }
};

/**
 * Clean up expired refresh tokens (should be run periodically)
 */
export const cleanupExpiredTokens = async (): Promise<number> => {
    try {
        const result = await RefreshToken.deleteMany({ expires_at: { $lt: new Date() } });
        logger.info(`Cleaned up ${result.deletedCount} expired refresh tokens`);
        return result.deletedCount;
    } catch (error) {
        logger.error('Error in cleanupExpiredTokens:', error);
        throw error;
    }
};
