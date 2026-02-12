import { SilverBooking, Transaction } from '../models';
import { NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { getCurrentSilverPrice, calculateSilverGrams } from './silver-price.service';
import { deductMoneyFromWallet, addSilverToWallet } from './wallet.service';

/**
 * Create silver booking
 */
export const createSilverBooking = async (
    userId: string,
    jewellerId: string,
    amount: number
): Promise<any> => {
    try {
        if (amount <= 0) {
            throw new ValidationError('Amount must be greater than 0');
        }

        const priceConfig = await getCurrentSilverPrice(jewellerId);
        const lockedPricePerGram = priceConfig.final_price;

        const { grams } = await calculateSilverGrams(jewellerId, amount);

        const booking = await SilverBooking.create({
            user_id: userId,
            jeweller_id: jewellerId,
            amount_paid: amount,
            silver_grams: grams,
            locked_price_per_gram: lockedPricePerGram,
            status: 'ACTIVE',
        });

        await deductMoneyFromWallet(userId, jewellerId, amount, booking._id.toString(), 'SILVER_BOOKING');
        await addSilverToWallet(userId, jewellerId, grams);

        logger.info(`Silver booking created: ${booking._id} for user ${userId}`);
        return booking;
    } catch (error) {
        logger.error('Error in createSilverBooking:', error);
        throw error;
    }
};

/**
 * Get user's silver bookings
 */
export const getUserSilverBookings = async (
    userId: string,
    jewellerId: string,
    limit: number = 50,
    offset: number = 0
): Promise<any[]> => {
    try {
        const bookings = await SilverBooking.find({ user_id: userId, jeweller_id: jewellerId })
            .sort({ booked_at: -1 })
            .skip(offset)
            .limit(limit)
            .lean();

        return bookings;
    } catch (error) {
        logger.error('Error in getUserSilverBookings:', error);
        throw error;
    }
};

/**
 * Get booking by ID
 */
export const getSilverBookingById = async (
    bookingId: string,
    jewellerId: string
): Promise<any> => {
    try {
        const booking = await SilverBooking.findOne({ _id: bookingId, jeweller_id: jewellerId }).lean();

        if (!booking) {
            throw new NotFoundError('Silver booking not found');
        }

        return booking;
    } catch (error) {
        logger.error('Error in getSilverBookingById:', error);
        throw error;
    }
};

/**
 * Get all silver bookings for a jeweller (Admin)
 */
export const getAllSilverBookings = async (
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

        const bookings = await SilverBooking.find(filter)
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
        logger.error('Error in getAllSilverBookings:', error);
        throw error;
    }
};

/**
 * Update silver booking status (Admin)
 */
export const updateSilverBookingStatus = async (
    bookingId: string,
    jewellerId: string,
    status: 'ACTIVE' | 'REDEEMED' | 'CANCELLED'
): Promise<any> => {
    try {
        const booking = await SilverBooking.findOneAndUpdate(
            { _id: bookingId, jeweller_id: jewellerId },
            { status },
            { new: true }
        );

        if (!booking) {
            throw new NotFoundError('Silver booking not found');
        }

        logger.info(`Silver booking ${bookingId} status updated to ${status}`);
        return booking;
    } catch (error) {
        logger.error('Error in updateSilverBookingStatus:', error);
        throw error;
    }
};

/**
 * Get silver booking statistics for a jeweller (Admin)
 */
export const getSilverBookingStatistics = async (jewellerId: string): Promise<any> => {
    try {
        const stats = await SilverBooking.aggregate([
            { $match: { jeweller_id: jewellerId } },
            {
                $group: {
                    _id: null,
                    total_bookings: { $sum: 1 },
                    total_amount: { $sum: '$amount_paid' },
                    total_silver_grams: { $sum: '$silver_grams' },
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
                total_silver_grams: 0,
                active_bookings: 0,
                redeemed_bookings: 0,
                cancelled_bookings: 0,
            }
        );
    } catch (error) {
        logger.error('Error in getSilverBookingStatistics:', error);
        throw error;
    }
};
