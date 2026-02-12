import { Router } from 'express';
import * as silverController from '../controllers/silver.controller';
import { authenticate } from '../middleware/auth';
import { enforceJewellerScope } from '../middleware/jeweller-scope';
import { requireAdmin, requireCustomer } from '../middleware/role-guard';
import { validateBody, validateQuery } from '../middleware/validation';
import {
    setSilverMCXPriceSchema,
    updateSilverMarginSchema,
    createSilverBookingSchema,
    updateSilverBookingStatusSchema,
    calculateSilverGramsSchema,
} from '../validators/silver.validator';

const router = Router();

// Apply authentication and jeweller scope to all routes
router.use(authenticate);
router.use(enforceJewellerScope);

/**
 * Customer routes
 */

/**
 * @route   GET /api/silver/current-price
 * @desc    Get current silver price (live from internet + jeweller margin)
 * @access  Private (Customer/Admin)
 */
router.get('/current-price', silverController.getLivePrice);

/**
 * @route   GET /api/silver/live-price
 * @desc    Get live silver price from internet
 * @access  Private (Customer/Admin)
 */
router.get('/live-price', silverController.getLivePrice);

/**
 * @route   GET /api/silver/calculate-grams
 * @desc    Calculate silver grams for given amount
 * @access  Private (Customer/Admin)
 */
router.get(
    '/calculate-grams',
    validateQuery(calculateSilverGramsSchema),
    silverController.calculateGrams
);

/**
 * @route   POST /api/silver/book
 * @desc    Create silver booking
 * @access  Private (Customer)
 */
router.post(
    '/book',
    requireCustomer,
    validateBody(createSilverBookingSchema),
    silverController.createBooking
);

/**
 * @route   GET /api/silver/bookings
 * @desc    Get user's silver bookings
 * @access  Private (Customer)
 */
router.get('/bookings', requireCustomer, silverController.getUserBookings);

/**
 * Admin routes
 */

/**
 * @route   POST /api/silver/admin/set-price
 * @desc    Set MCX base silver price
 * @access  Private (Admin)
 */
router.post(
    '/admin/set-price',
    requireAdmin,
    validateBody(setSilverMCXPriceSchema),
    silverController.setMCXPrice
);

/**
 * @route   PUT /api/silver/admin/margin
 * @desc    Update silver margin
 * @access  Private (Admin)
 */
router.put(
    '/admin/margin',
    requireAdmin,
    validateBody(updateSilverMarginSchema),
    silverController.updateMargin
);

/**
 * @route   GET /api/silver/admin/price-history
 * @desc    Get silver price history
 * @access  Private (Admin)
 */
router.get('/admin/price-history', requireAdmin, silverController.getPriceHistory);

/**
 * @route   GET /api/silver/admin/bookings
 * @desc    Get all silver bookings for jeweller
 * @access  Private (Admin)
 */
router.get('/admin/bookings', requireAdmin, silverController.getAllBookings);

/**
 * @route   PUT /api/silver/admin/bookings/:booking_id/status
 * @desc    Update silver booking status
 * @access  Private (Admin)
 */
router.put(
    '/admin/bookings/:booking_id/status',
    requireAdmin,
    validateBody(updateSilverBookingStatusSchema),
    silverController.updateBookingStatus
);

export default router;
