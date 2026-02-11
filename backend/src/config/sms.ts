import axios from 'axios';
import logger from '../utils/logger';

/**
 * SMS service using smsnotify.one API
 */

const SMS_API_URL = process.env.SMS_API_URL || '';
const SMS_USER_ID = process.env.SMS_USER_ID || '';
const SMS_PASSWORD = process.env.SMS_PASSWORD || '';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || '';

/**
 * Send SMS using smsnotify.one API
 */
export const sendSMS = async (phoneNumber: string, message: string): Promise<boolean> => {
    try {
        if (!SMS_API_URL || !SMS_USER_ID || !SMS_PASSWORD || !SMS_SENDER_ID) {
            logger.warn('SMS configuration is incomplete. Skipping SMS send in development mode.');
            if (process.env.NODE_ENV === 'development') {
                logger.info(`[DEV MODE] Would send SMS to ${phoneNumber}: ${message}`);
                return true;
            }
            throw new Error('SMS configuration is incomplete');
        }

        // Normalize phone number (remove +91 if present, API expects 10 digits)
        const normalizedPhone = phoneNumber.replace(/^\+91/, '').replace(/\D/g, '');

        // Build the SMS API URL with query parameters
        const url = `${SMS_API_URL}?userid=${encodeURIComponent(SMS_USER_ID)}&password=${encodeURIComponent(SMS_PASSWORD)}&sendMethod=quick&mobile=${normalizedPhone}&msg=${encodeURIComponent(message)}&senderid=${SMS_SENDER_ID}&msgType=text&format=text`;

        logger.info(`Sending SMS to ${normalizedPhone}`);

        const response = await axios.get(url, {
            timeout: 10000,
        });

        logger.info(`SMS API Response: ${JSON.stringify(response.data)}`);

        // Check if SMS was sent successfully
        if (response.status === 200) {
            logger.info(`SMS sent successfully to ${normalizedPhone}`);
            return true;
        } else {
            logger.error(`SMS API returned status ${response.status}`);
            return false;
        }
    } catch (error: any) {
        logger.error('Error sending SMS:', error.message);

        // In development mode, don't fail on SMS errors
        if (process.env.NODE_ENV === 'development') {
            logger.warn('[DEV MODE] SMS send failed, but continuing...');
            return true;
        }

        throw error;
    }
};

export default { sendSMS };
