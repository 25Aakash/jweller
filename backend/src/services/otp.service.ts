import { OtpVerification } from '../models';
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
        if (!isValidPhoneNumber(phoneNumber)) {
            throw new ValidationError('Invalid phone number format');
        }

        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        // Check rate limiting (max 3 OTPs per phone in 15 minutes)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const recentCount = await OtpVerification.countDocuments({
            phone_number: normalizedPhone,
            jeweller_id: jewellerId,
            created_at: { $gt: fifteenMinutesAgo },
        });

        if (recentCount >= 3) {
            throw new RateLimitError('Too many OTP requests. Please try again later.');
        }

        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await OtpVerification.create({
            phone_number: normalizedPhone,
            otp_code: otpCode,
            jeweller_id: jewellerId,
            expires_at: expiresAt,
        });

        const message = `Dear User, ${otpCode} is your OTP to register your Riddhi Siddhi Trading Co account. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.`;

        try {
            await sendSMS(normalizedPhone, message);
            logger.info(`OTP sent to ${normalizedPhone}`);
        } catch (smsError) {
            logger.error('Failed to send OTP SMS:', smsError);
            if (process.env.NODE_ENV !== 'development') {
                throw new Error('Failed to send OTP. Please try again.');
            }
        }

        return { success: true, expiresAt };
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

        const otpDoc = await OtpVerification.findOne({
            phone_number: normalizedPhone,
            otp_code: otpCode,
            jeweller_id: jewellerId,
            is_verified: false,
            expires_at: { $gt: new Date() },
        }).sort({ created_at: -1 });

        if (!otpDoc) {
            // Debug: check existing OTPs
            const allOtps = await OtpVerification.find({
                phone_number: normalizedPhone,
                jeweller_id: jewellerId,
            })
                .sort({ created_at: -1 })
                .limit(3)
                .lean();
            logger.info(`All OTPs for phone ${normalizedPhone}: ${JSON.stringify(allOtps)}`);
            return false;
        }

        // Mark OTP as verified
        otpDoc.is_verified = true;
        await otpDoc.save();

        // Clean up old OTPs for this phone number
        await OtpVerification.deleteMany({
            phone_number: normalizedPhone,
            jeweller_id: jewellerId,
            _id: { $ne: otpDoc._id },
        });

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
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const result = await OtpVerification.deleteMany({
            $or: [
                { expires_at: { $lt: new Date() } },
                { is_verified: true, created_at: { $lt: oneDayAgo } },
            ],
        });

        logger.info(`Cleaned up ${result.deletedCount} expired OTPs`);
        return result.deletedCount;
    } catch (error) {
        logger.error('Error in cleanupExpiredOTPs:', error);
        throw error;
    }
};
