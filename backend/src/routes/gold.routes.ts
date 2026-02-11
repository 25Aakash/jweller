import { Router } from 'express';
import * as goldController from '../controllers/gold.controller';
import { authenticate } from '../middleware/auth';
import { enforceJewellerScope } from '../middleware/jeweller-scope';
import { requireAdmin, requireCustomer } from '../middleware/role-guard';
import { validateBody, validateQuery } from '../middleware/validation';
import {
    setMCXPriceSchema,
    updateMarginSchema,
    createBookingSchema,
    updateBookingStatusSchema,
    calculateGramsSchema,
} from '../validators/gold.validator';

const router = Router();

// Apply authentication and jeweller scope to all routes
router.use(authenticate);
router.use(enforceJewellerScope);

/**
 * Customer routes
 */

/**
 * @route   GET /api/gold/current-price
 * @desc    Get current gold price (live from internet + jeweller margin)
 * @access  Private (Customer/Admin)
 */
router.get('/current-price', goldController.getLivePrice);

/**
 * @route   GET /api/gold/live-price
 * @desc    Get live gold price from internet
 * @access  Private (Customer/Admin)
 */
router.get('/live-price', goldController.getLivePrice);

/**
 * @route   GET /api/gold/calculate-grams
 * @desc    Calculate gold grams for given amount
 * @access  Private (Customer/Admin)
 */
router.get(
    '/calculate-grams',
    validateQuery(calculateGramsSchema),
    goldController.calculateGrams
);

/**
 * @route   POST /api/gold/book
 * @desc    Create gold booking
 * @access  Private (Customer)
 */
router.post(
    '/book',
    requireCustomer,
    validateBody(createBookingSchema),
    goldController.createBooking
);

/**
 * @route   GET /api/gold/bookings
 * @desc    Get user's gold bookings
 * @access  Private (Customer)
 */
router.get('/bookings', requireCustomer, goldController.getUserBookings);

/**
 * Admin routes
 */

/**
 * @route   POST /api/gold/admin/set-price
 * @desc    Set MCX base gold price
 * @access  Private (Admin)
 */
router.post(
    '/admin/set-price',
    requireAdmin,
    validateBody(setMCXPriceSchema),
    goldController.setMCXPrice
);

/**
 * @route   PUT /api/gold/admin/margin
 * @desc    Update jeweller margin
 * @access  Private (Admin)
 */
router.put(
    '/admin/margin',
    requireAdmin,
    validateBody(updateMarginSchema),
    goldController.updateMargin
);

/**
 * @route   GET /api/gold/admin/price-history
 * @desc    Get gold price history
 * @access  Private (Admin)
 */
router.get('/admin/price-history', requireAdmin, goldController.getPriceHistory);

/**
 * @route   GET /api/gold/admin/bookings
 * @desc    Get all bookings for jeweller
 * @access  Private (Admin)
 */
router.get('/admin/bookings', requireAdmin, goldController.getAllBookings);

/**
 * @route   PUT /api/gold/admin/bookings/:booking_id/status
 * @desc    Update booking status
 * @access  Private (Admin)
 */
router.put(
    '/admin/bookings/:booking_id/status',
    requireAdmin,
    validateBody(updateBookingStatusSchema),
    goldController.updateBookingStatus
);

export default router;
