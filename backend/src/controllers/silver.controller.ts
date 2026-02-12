import { Request, Response, NextFunction } from 'express';
import * as silverPriceService from '../services/silver-price.service';
import * as silverBookingService from '../services/silver-booking.service';

/**
 * Get current silver price (live from internet + jeweller margin)
 */
export const getCurrentPrice = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const jewellerId = req.user!.jeweller_id;
        const price = await silverPriceService.getLiveSilverPriceForJeweller(jewellerId);

        res.status(200).json({
            success: true,
            price: {
                base_mcx_price: parseFloat(price.base_mcx_price),
                margin_percent: parseFloat(price.jeweller_margin_percent),
                margin_fixed: parseFloat(price.jeweller_margin_fixed),
                final_price: parseFloat(price.final_price),
                source: price.source || 'live',
                fetched_at: price.fetched_at || new Date().toISOString(),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get live silver price from internet
 */
export const getLivePrice = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const jewellerId = req.user!.jeweller_id;
        const price = await silverPriceService.getLiveSilverPriceForJeweller(jewellerId);

        res.status(200).json({
            success: true,
            price: {
                base_mcx_price: parseFloat(price.base_mcx_price),
                margin_percent: parseFloat(price.jeweller_margin_percent),
                margin_fixed: parseFloat(price.jeweller_margin_fixed),
                final_price: parseFloat(price.final_price),
                source: price.source || 'live',
                fetched_at: price.fetched_at || new Date().toISOString(),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Calculate silver grams for amount
 */
export const calculateGrams = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { amount } = req.query;
        const jewellerId = req.user!.jeweller_id;

        const result = await silverPriceService.calculateSilverGrams(
            jewellerId,
            parseFloat(amount as string)
        );

        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create silver booking
 */
export const createBooking = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { amount } = req.body;
        const userId = req.user!.user_id;
        const jewellerId = req.user!.jeweller_id;

        const booking = await silverBookingService.createSilverBooking(
            userId,
            jewellerId,
            amount
        );

        res.status(201).json({
            success: true,
            message: 'Silver booking created successfully',
            booking,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's silver bookings
 */
export const getUserBookings = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.user_id;
        const jewellerId = req.user!.jeweller_id;
        const { limit, offset } = req.query;

        const bookings = await silverBookingService.getUserSilverBookings(
            userId,
            jewellerId,
            parseInt(limit as string) || 50,
            parseInt(offset as string) || 0
        );

        res.status(200).json({
            success: true,
            bookings,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Set MCX silver price (Admin only)
 */
export const setMCXPrice = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { base_mcx_price, margin_percent, margin_fixed, effective_date } = req.body;
        const jewellerId = req.user!.jeweller_id;
        const updatedBy = req.user!.user_id;

        const price = await silverPriceService.setSilverMCXPrice(
            jewellerId,
            base_mcx_price,
            updatedBy,
            effective_date ? new Date(effective_date) : undefined,
            margin_percent,
            margin_fixed
        );

        res.status(200).json({
            success: true,
            message: 'Silver price updated successfully',
            price,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update silver margin (Admin only)
 */
export const updateMargin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { margin_percentage, margin_fixed } = req.body;
        const jewellerId = req.user!.jeweller_id;

        const jeweller = await silverPriceService.updateSilverMargin(
            jewellerId,
            margin_percentage,
            margin_fixed
        );

        res.status(200).json({
            success: true,
            message: 'Silver margin updated successfully',
            jeweller,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get silver price history (Admin only)
 */
export const getPriceHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const jewellerId = req.user!.jeweller_id;
        const { limit } = req.query;

        const history = await silverPriceService.getSilverPriceHistory(
            jewellerId,
            parseInt(limit as string) || 30
        );

        res.status(200).json({
            success: true,
            history,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all silver bookings (Admin only)
 */
export const getAllBookings = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const jewellerId = req.user!.jeweller_id;
        const { status, limit, offset } = req.query;

        const bookings = await silverBookingService.getAllSilverBookings(
            jewellerId,
            status as string,
            parseInt(limit as string) || 100,
            parseInt(offset as string) || 0
        );

        res.status(200).json({
            success: true,
            bookings,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update silver booking status (Admin only)
 */
export const updateBookingStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { booking_id } = req.params;
        const { status } = req.body;
        const jewellerId = req.user!.jeweller_id;

        const booking = await silverBookingService.updateSilverBookingStatus(
            booking_id,
            jewellerId,
            status
        );

        res.status(200).json({
            success: true,
            message: 'Silver booking status updated',
            booking,
        });
    } catch (error) {
        next(error);
    }
};
