import { validate as uuidValidate } from 'uuid';

/**
 * Validation utility functions
 */

export const isValidPhoneNumber = (phone: string): boolean => {
    // Indian phone number format: +91XXXXXXXXXX or 10 digits
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidUUID = (uuid: string): boolean => {
    return uuidValidate(uuid);
};

export const isValidAmount = (amount: number): boolean => {
    return amount > 0 && Number.isFinite(amount);
};

export const isValidOTP = (otp: string): boolean => {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
};

export const isValidPassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};

export const normalizePhoneNumber = (phone: string): string => {
    // Remove spaces and ensure +91 prefix
    let normalized = phone.replace(/\s/g, '');
    if (!normalized.startsWith('+91')) {
        normalized = '+91' + normalized;
    }
    return normalized;
};

export const sanitizeString = (str: string): string => {
    return str.trim().replace(/[<>]/g, '');
};
