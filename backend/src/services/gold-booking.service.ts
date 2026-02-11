import pool, { transaction } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { getCurrentGoldPrice, calculateGoldGrams } from './gold-price.service';
import { deductMoneyFromWallet, addGoldToWallet } from './wallet.service';

/**
 * Create gold booking
 */
export const createGoldBooking = async (
    userId: string,
    jewellerId: string,
    amount: number
): Promise<any> => {
    try {
        if (amount <= 0) {
            throw new ValidationError('Amount must be greater than 0');
        }

        return await transaction(async (client) => {
            // Get current gold price
            const priceConfig = await getCurrentGoldPrice(jewellerId);
            const lockedPricePerGram = priceConfig.final_price;

            // Calculate gold grams
            const { grams } = await calculateGoldGrams(jewellerId, amount);

            // Create booking
            const bookingResult = await client.query(
                `INSERT INTO gold_bookings 
         (user_id, jeweller_id, amount_paid, gold_grams, locked_price_per_gram, status)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
         RETURNING *`,
                [userId, jewellerId, amount, grams, lockedPricePerGram]
            );

            const booking = bookingResult.rows[0];

            // Deduct from wallet (this also creates a transaction record)
            await deductMoneyFromWallet(userId, jewellerId, amount, booking.id);

            // Add gold to wallet
            await addGoldToWallet(userId, jewellerId, grams);

            logger.info(`Gold booking created: ${booking.id} for user ${userId}`);

            return booking;
        });
    } catch (error) {
        logger.error('Error in createGoldBooking:', error);
        throw error;
    }
};

/**
 * Get user's gold bookings
 */
export const getUserBookings = async (
    userId: string,
    jewellerId: string,
    limit: number = 50,
    offset: number = 0
): Promise<any[]> => {
    try {
        const result = await pool.query(
            `SELECT * FROM gold_bookings 
       WHERE user_id = $1 AND jeweller_id = $2
       ORDER BY booked_at DESC
       LIMIT $3 OFFSET $4`,
            [userId, jewellerId, limit, offset]
        );

        return result.rows;
    } catch (error) {
        logger.error('Error in getUserBookings:', error);
        throw error;
    }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (
    bookingId: string,
    jewellerId: string
): Promise<any> => {
    try {
        const result = await pool.query(
            `SELECT * FROM gold_bookings 
       WHERE id = $1 AND jeweller_id = $2`,
            [bookingId, jewellerId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Booking not found');
        }

        return result.rows[0];
    } catch (error) {
        logger.error('Error in getBookingById:', error);
        throw error;
    }
};

/**
 * Get all bookings for a jeweller (Admin)
 */
export const getAllBookings = async (
    jewellerId: string,
    status?: string,
    limit: number = 100,
    offset: number = 0
): Promise<any[]> => {
    try {
        let query = `
      SELECT b.*, u.name as user_name, u.phone_number 
      FROM gold_bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.jeweller_id = $1
    `;
        const params: any[] = [jewellerId];

        if (status) {
            query += ` AND b.status = $2`;
            params.push(status);
            query += ` ORDER BY b.booked_at DESC LIMIT $3 OFFSET $4`;
            params.push(limit, offset);
        } else {
            query += ` ORDER BY b.booked_at DESC LIMIT $2 OFFSET $3`;
            params.push(limit, offset);
        }

        const result = await pool.query(query, params);
        return result.rows;
    } catch (error) {
        logger.error('Error in getAllBookings:', error);
        throw error;
    }
};

/**
 * Update booking status (Admin)
 */
export const updateBookingStatus = async (
    bookingId: string,
    jewellerId: string,
    status: 'ACTIVE' | 'REDEEMED' | 'CANCELLED'
): Promise<any> => {
    try {
        const result = await pool.query(
            `UPDATE gold_bookings 
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND jeweller_id = $3
       RETURNING *`,
            [status, bookingId, jewellerId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Booking not found');
        }

        logger.info(`Booking ${bookingId} status updated to ${status}`);
        return result.rows[0];
    } catch (error) {
        logger.error('Error in updateBookingStatus:', error);
        throw error;
    }
};

/**
 * Get booking statistics for a jeweller (Admin)
 */
export const getBookingStatistics = async (jewellerId: string): Promise<any> => {
    try {
        const result = await pool.query(
            `SELECT 
        COUNT(*) as total_bookings,
        SUM(amount_paid) as total_amount,
        SUM(gold_grams) as total_gold_grams,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_bookings,
        COUNT(CASE WHEN status = 'REDEEMED' THEN 1 END) as redeemed_bookings,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_bookings
       FROM gold_bookings 
       WHERE jeweller_id = $1`,
            [jewellerId]
        );

        return result.rows[0];
    } catch (error) {
        logger.error('Error in getBookingStatistics:', error);
        throw error;
    }
};
