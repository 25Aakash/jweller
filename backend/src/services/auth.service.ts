import bcrypt from 'bcrypt';
import pool from '../config/database';
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

        // Use UPSERT to create or get existing user
        const result = await pool.query(
            `INSERT INTO users (phone_number, jeweller_id, name, role)
       VALUES ($1, $2, $3, 'CUSTOMER')
       ON CONFLICT (jeweller_id, phone_number) 
       DO UPDATE SET name = COALESCE(users.name, EXCLUDED.name)
       RETURNING *`,
            [normalizedPhone, jewellerId, name || 'Customer']
        );

        const userData = result.rows[0];
        logger.info(`Customer logged in: ${userData.id}`);

        // Check if user is active
        if (!userData.is_active) {
            throw new AuthenticationError('Account is deactivated');
        }

        // Generate tokens
        const payload: JWTPayload = {
            user_id: userData.id,
            jeweller_id: userData.jeweller_id,
            role: userData.role,
            phone_number: userData.phone_number,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Store refresh token
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await pool.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
            [userData.id, refreshToken, expiresAt]
        );

        logger.info(`Customer logged in: ${userData.id}`);

        return {
            accessToken,
            refreshToken,
            user: {
                id: userData.id,
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
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        // Hash password
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        // Create new customer
        const result = await client.query(
            `INSERT INTO users (phone_number, jeweller_id, name, password_hash, role, state, city)
       VALUES ($1, $2, $3, $4, 'CUSTOMER', $5, $6)
       RETURNING *`,
            [normalizedPhone, jewellerId, name, passwordHash, state, city]
        );

        const userData = result.rows[0];
        logger.info(`New customer registered: ${userData.id}`);

        // Create wallet for new customer
        await client.query(
            `INSERT INTO wallet (user_id, jeweller_id, balance)
       VALUES ($1, $2, 0)`,
            [userData.id, jewellerId]
        );

        // Generate tokens
        const payload: JWTPayload = {
            user_id: userData.id,
            jeweller_id: userData.jeweller_id,
            role: userData.role,
            phone_number: userData.phone_number,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Store refresh token
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await client.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
            [userData.id, refreshToken, expiresAt]
        );

        await client.query('COMMIT');

        return {
            accessToken,
            refreshToken,
            user: {
                id: userData.id,
                phone_number: userData.phone_number,
                name: userData.name,
                state: userData.state,
                city: userData.city,
                role: userData.role,
                jeweller_id: userData.jeweller_id,
            },
        };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error in registerCustomer:', error);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Customer login with password
 */
export const loginCustomerWithPassword = async (
    phoneNumber: string,
    password: string,
    jewellerId: string
): Promise<{ accessToken: string; refreshToken: string; user: any }> => {
    try {
        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        // Find customer
        const result = await pool.query(
            `SELECT * FROM users 
       WHERE phone_number = $1 
       AND jeweller_id = $2 
       AND role = 'CUSTOMER'`,
            [normalizedPhone, jewellerId]
        );

        if (result.rows.length === 0) {
            throw new AuthenticationError('Invalid credentials');
        }

        const userData = result.rows[0];

        // Check if user is active
        if (!userData.is_active) {
            throw new AuthenticationError('Account is deactivated');
        }

        // Verify password
        if (!userData.password_hash) {
            throw new AuthenticationError('Please register with a password first');
        }

        const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid credentials');
        }

        // Generate tokens
        const payload: JWTPayload = {
            user_id: userData.id,
            jeweller_id: userData.jeweller_id,
            role: userData.role,
            phone_number: userData.phone_number,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Store refresh token
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await pool.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
            [userData.id, refreshToken, expiresAt]
        );

        logger.info(`Customer logged in with password: ${userData.id}`);

        return {
            accessToken,
            refreshToken,
            user: {
                id: userData.id,
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
        // Validate email
        if (!isValidEmail(email)) {
            throw new ValidationError('Invalid email format');
        }

        // Find admin user
        const result = await pool.query(
            `SELECT * FROM users 
       WHERE email = $1 
       AND jeweller_id = $2 
       AND role = 'ADMIN'`,
            [email.toLowerCase(), jewellerId]
        );

        if (result.rows.length === 0) {
            throw new AuthenticationError('Invalid credentials');
        }

        const userData = result.rows[0];

        // Check if user is active
        if (!userData.is_active) {
            throw new AuthenticationError('Account is deactivated');
        }

        // Verify password
        if (!userData.password_hash) {
            throw new AuthenticationError('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid credentials');
        }

        // Generate tokens
        const payload: JWTPayload = {
            user_id: userData.id,
            jeweller_id: userData.jeweller_id,
            role: userData.role,
            phone_number: userData.phone_number,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Store refresh token
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await pool.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
            [userData.id, refreshToken, expiresAt]
        );

        logger.info(`Admin logged in: ${userData.id}`);

        return {
            accessToken,
            refreshToken,
            user: {
                id: userData.id,
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
        // Verify refresh token
        const payload = verifyRefreshToken(refreshToken);

        // Check if refresh token exists in database
        const result = await pool.query(
            `SELECT * FROM refresh_tokens 
       WHERE token = $1 
       AND expires_at > NOW()`,
            [refreshToken]
        );

        if (result.rows.length === 0) {
            throw new AuthenticationError('Invalid or expired refresh token');
        }

        // Generate new access token
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
        await pool.query(
            `DELETE FROM refresh_tokens WHERE token = $1`,
            [refreshToken]
        );
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
        // Hash password
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        // Create admin user
        const result = await pool.query(
            `INSERT INTO users (jeweller_id, email, password_hash, name, phone_number, role)
       VALUES ($1, $2, $3, $4, $5, 'ADMIN')
       RETURNING id, email, name, phone_number, role, jeweller_id`,
            [jewellerId, email.toLowerCase(), passwordHash, name, normalizePhoneNumber(phoneNumber)]
        );

        logger.info(`Admin user created: ${result.rows[0].id}`);
        return result.rows[0];
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
        const result = await pool.query(
            `DELETE FROM refresh_tokens WHERE expires_at < NOW()`
        );
        logger.info(`Cleaned up ${result.rowCount} expired refresh tokens`);
        return result.rowCount || 0;
    } catch (error) {
        logger.error('Error in cleanupExpiredTokens:', error);
        throw error;
    }
};
