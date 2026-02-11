import mongoose from 'mongoose';
import { GoldBooking, Transaction } from '../models';
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

        // Get current gold price
        const priceConfig = await getCurrentGoldPrice(jewellerId);
        const lockedPricePerGram = priceConfig.final_price;

        // Calculate gold grams
        const { grams } = await calculateGoldGrams(jewellerId, amount);

        // Create booking
        const booking = await GoldBooking.create({
            user_id: userId,
            jeweller_id: jewellerId,
            amount_paid: amount,
            gold_grams: grams,
            locked_price_per_gram: lockedPricePerGram,
            status: 'ACTIVE',
        });

        // Deduct from wallet (this also creates a transaction record)
        await deductMoneyFromWallet(userId, jewellerId, amount, booking._id.toString());

        // Add gold to wallet
        await addGoldToWallet(userId, jewellerId, grams);

        logger.info(`Gold booking created: ${booking._id} for user ${userId}`);
        return booking;
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
        const bookings = await GoldBooking.find({ user_id: userId, jeweller_id: jewellerId })
            .sort({ booked_at: -1 })
            .skip(offset)
            .limit(limit)
            .lean();

        return bookings;
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
        const booking = await GoldBooking.findOne({ _id: bookingId, jeweller_id: jewellerId }).lean();

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        return booking;
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
        const filter: any = { jeweller_id: jewellerId };
        if (status) {
            filter.status = status;
        }

        const bookings = await GoldBooking.find(filter)
            .sort({ booked_at: -1 })
            .skip(offset)
            .limit(limit)
            .populate('user_id', 'name phone_number')
            .lean();

        return bookings.map((b: any) => ({
            ...b,
            user_name: b.user_id?.name,
            phone_number: b.user_id?.phone_number,
        }));
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
        const booking = await GoldBooking.findOneAndUpdate(
            { _id: bookingId, jeweller_id: jewellerId },
            { status },
            { new: true }
        );

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        logger.info(`Booking ${bookingId} status updated to ${status}`);
        return booking;
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
        const stats = await GoldBooking.aggregate([
            { $match: { jeweller_id: jewellerId } },
            {
                $group: {
                    _id: null,
                    total_bookings: { $sum: 1 },
                    total_amount: { $sum: '$amount_paid' },
                    total_gold_grams: { $sum: '$gold_grams' },
                    active_bookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] },
                    },
                    redeemed_bookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'REDEEMED'] }, 1, 0] },
                    },
                    cancelled_bookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] },
                    },
                },
            },
        ]);

        return (
            stats[0] || {
                total_bookings: 0,
                total_amount: 0,
                total_gold_grams: 0,
                active_bookings: 0,
                redeemed_bookings: 0,
                cancelled_bookings: 0,
            }
        );
    } catch (error) {
        logger.error('Error in getBookingStatistics:', error);
        throw error;
    }
};
