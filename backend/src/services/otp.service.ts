import pool from '../config/database';
import { sendSMS } from '../config/sms';
import { ValidationError, RateLimitError } from '../utils/errors';
import { isValidPhoneNumber, normalizePhoneNumber } from '../utils/validators';
import logger from '../utils/logger';

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || '6');

/**
 * Generate a random OTP code
 */
const generateOTP = (): string => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < OTP_LENGTH; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};

/**
 * Send OTP to phone number
 */
export const sendOTP = async (
    phoneNumber: string,
    jewellerId: string
): Promise<{ success: boolean; expiresAt: Date }> => {
    try {
        // Validate phone number
        if (!isValidPhoneNumber(phoneNumber)) {
            throw new ValidationError('Invalid phone number format');
        }

        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        // Check rate limiting (max 3 OTPs per phone in 15 minutes)
        const rateLimitCheck = await pool.query(
            `SELECT COUNT(*) as count 
       FROM otp_verifications 
       WHERE phone_number = $1 
       AND jeweller_id = $2 
       AND created_at > NOW() - INTERVAL '15 minutes'`,
            [normalizedPhone, jewellerId]
        );

        if (parseInt(rateLimitCheck.rows[0].count) >= 3) {
            throw new RateLimitError('Too many OTP requests. Please try again later.');
        }

        // Generate OTP
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Store OTP in database
        await pool.query(
            `INSERT INTO otp_verifications (phone_number, otp_code, jeweller_id, expires_at)
       VALUES ($1, $2, $3, $4)`,
            [normalizedPhone, otpCode, jewellerId, expiresAt]
        );

        // Send OTP via SMS
        const message = `Dear User, ${otpCode} is your OTP to register your Riddhi Siddhi Trading Co account. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.`;

        try {
            await sendSMS(normalizedPhone, message);
            logger.info(`OTP sent to ${normalizedPhone}`);
        } catch (smsError) {
            logger.error('Failed to send OTP SMS:', smsError);
            // In development, we'll continue even if SMS fails
            if (process.env.NODE_ENV !== 'development') {
                throw new Error('Failed to send OTP. Please try again.');
            }
        }

        return {
            success: true,
            expiresAt,
        };
    } catch (error) {
        logger.error('Error in sendOTP:', error);
        throw error;
    }
};

/**
 * Verify OTP code
 */
export const verifyOTP = async (
    phoneNumber: string,
    otpCode: string,
    jewellerId: string
): Promise<boolean> => {
    try {
        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        logger.info(`Verifying OTP - Phone: ${normalizedPhone}, OTP: ${otpCode}, Jeweller: ${jewellerId}`);

        // Find valid OTP
        const result = await pool.query(
            `SELECT * FROM otp_verifications 
       WHERE phone_number = $1 
       AND otp_code = $2 
       AND jeweller_id = $3 
       AND is_verified = false 
       AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
            [normalizedPhone, otpCode, jewellerId]
        );

        logger.info(`OTP verification query result: ${result.rows.length} rows found`);

        if (result.rows.length > 0) {
            logger.info(`Found OTP: ${JSON.stringify(result.rows[0])}`);
        } else {
            // Check what OTPs exist for this phone
            const allOtps = await pool.query(
                `SELECT phone_number, otp_code, is_verified, expires_at > NOW() as is_valid 
                 FROM otp_verifications 
                 WHERE phone_number = $1 AND jeweller_id = $2 
                 ORDER BY created_at DESC LIMIT 3`,
                [normalizedPhone, jewellerId]
            );
            logger.info(`All OTPs for phone ${normalizedPhone}: ${JSON.stringify(allOtps.rows)}`);
        }

        if (result.rows.length === 0) {
            return false;
        }

        // Mark OTP as verified
        await pool.query(
            `UPDATE otp_verifications 
       SET is_verified = true 
       WHERE id = $1`,
            [result.rows[0].id]
        );

        // Clean up old OTPs for this phone number
        await pool.query(
            `DELETE FROM otp_verifications 
       WHERE phone_number = $1 
       AND jeweller_id = $2 
       AND id != $3`,
            [normalizedPhone, jewellerId, result.rows[0].id]
        );

        logger.info(`OTP verified for ${normalizedPhone}`);
        return true;
    } catch (error) {
        logger.error('Error in verifyOTP:', error);
        throw error;
    }
};

/**
 * Clean up expired OTPs (should be run periodically)
 */
export const cleanupExpiredOTPs = async (): Promise<number> => {
    try {
        const result = await pool.query(
            `DELETE FROM otp_verifications 
       WHERE expires_at < NOW() 
       OR (is_verified = true AND created_at < NOW() - INTERVAL '1 day')`
        );

        logger.info(`Cleaned up ${result.rowCount} expired OTPs`);
        return result.rowCount || 0;
    } catch (error) {
        logger.error('Error in cleanupExpiredOTPs:', error);
        throw error;
    }
};
