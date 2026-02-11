import { Request, Response, NextFunction } from 'express';
import * as jewellerService from '../services/jeweller.service';
import logger from '../utils/logger';

export const getDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const jewellerId = req.user!.jeweller_id;
        const dashboard = await jewellerService.getDashboardStats(jewellerId);

        res.json({
            success: true,
            data: dashboard,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllCustomers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const jewellerId = req.user!.jeweller_id;
        const customers = await jewellerService.getAllCustomers(jewellerId);

        res.json({
            success: true,
            data: customers,
        });
    } catch (error) {
        next(error);
    }
};

export const getCustomerDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const jewellerId = req.user!.jeweller_id;
        const { customerId } = req.params;

        const customer = await jewellerService.getCustomerDetails(jewellerId, customerId);

        res.json({
            success: true,
            data: customer,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const jewellerId = req.user!.jeweller_id;
        const transactions = await jewellerService.getAllTransactions(jewellerId);

        res.json({
            success: true,
            data: transactions,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllBookings = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const jewellerId = req.user!.jeweller_id;
        const bookings = await jewellerService.getAllBookings(jewellerId);

        res.json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

export const updateGoldPrice = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const jewellerId = req.user!.jeweller_id;
        const userId = req.user!.user_id;
        const { base_mcx_price, margin_percent, margin_fixed } = req.body;

        const priceConfig = await jewellerService.updateGoldPrice(
            jewellerId,
            userId,
            base_mcx_price,
            margin_percent,
            margin_fixed
        );

        res.json({
            success: true,
            message: 'Gold price updated successfully',
            data: priceConfig,
        });
    } catch (error) {
        next(error);
    }
};
