import pool from '../config/database';
import logger from '../utils/logger';

export const getDashboardStats = async (jewellerId: string) => {
    try {
        // Get total customers
        const customersResult = await pool.query(
            `SELECT COUNT(*) as total FROM users 
             WHERE jeweller_id = $1 AND role = 'CUSTOMER'`,
            [jewellerId]
        );

        // Get total revenue from transactions
        const revenueResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) as total 
             FROM transactions 
             WHERE jeweller_id = $1 AND status = 'SUCCESS'`,
            [jewellerId]
        );

        // Get total gold sold
        const goldResult = await pool.query(
            `SELECT COALESCE(SUM(gold_grams), 0) as total 
             FROM gold_bookings 
             WHERE jeweller_id = $1 AND status = 'ACTIVE'`,
            [jewellerId]
        );

        // Get active bookings count
        const bookingsResult = await pool.query(
            `SELECT COUNT(*) as total 
             FROM gold_bookings 
             WHERE jeweller_id = $1 AND status = 'ACTIVE'`,
            [jewellerId]
        );

        // Get today's transactions count
        const todayResult = await pool.query(
            `SELECT COUNT(*) as total 
             FROM transactions 
             WHERE jeweller_id = $1 
             AND DATE(created_at) = CURRENT_DATE`,
            [jewellerId]
        );

        return {
            totalCustomers: parseInt(customersResult.rows[0].total),
            totalRevenue: parseFloat(revenueResult.rows[0].total),
            totalGoldSold: parseFloat(goldResult.rows[0].total),
            activeBookings: parseInt(bookingsResult.rows[0].total),
            todayTransactions: parseInt(todayResult.rows[0].total),
        };
    } catch (error) {
        logger.error('Error in getDashboardStats:', error);
        throw error;
    }
};

export const getAllCustomers = async (jewellerId: string) => {
    try {
        const result = await pool.query(
            `SELECT 
                u.id,
                u.name,
                u.phone_number,
                u.state,
                u.city,
                u.created_at,
                COALESCE(w.balance, 0) as wallet_balance,
                COALESCE(w.gold_grams, 0) as gold_grams
             FROM users u
             LEFT JOIN wallet w ON u.id = w.user_id
             WHERE u.jeweller_id = $1 AND u.role = 'CUSTOMER'
             ORDER BY u.created_at DESC`,
            [jewellerId]
        );

        return result.rows;
    } catch (error) {
        logger.error('Error in getAllCustomers:', error);
        throw error;
    }
};

export const getCustomerDetails = async (jewellerId: string, customerId: string) => {
    try {
        // Get customer info
        const customerResult = await pool.query(
            `SELECT 
                u.id,
                u.name,
                u.phone_number,
                u.state,
                u.city,
                u.created_at,
                COALESCE(w.balance, 0) as wallet_balance,
                COALESCE(w.gold_grams, 0) as gold_grams
             FROM users u
             LEFT JOIN wallet w ON u.id = w.user_id
             WHERE u.id = $1 AND u.jeweller_id = $2 AND u.role = 'CUSTOMER'`,
            [customerId, jewellerId]
        );

        if (customerResult.rows.length === 0) {
            throw new Error('Customer not found');
        }

        // Get customer transactions
        const transactionsResult = await pool.query(
            `SELECT * FROM transactions 
             WHERE user_id = $1 AND jeweller_id = $2
             ORDER BY created_at DESC
             LIMIT 10`,
            [customerId, jewellerId]
        );

        // Get customer bookings
        const bookingsResult = await pool.query(
            `SELECT * FROM gold_bookings 
             WHERE user_id = $1 AND jeweller_id = $2
             ORDER BY booked_at DESC`,
            [customerId, jewellerId]
        );

        return {
            customer: customerResult.rows[0],
            transactions: transactionsResult.rows,
            bookings: bookingsResult.rows,
        };
    } catch (error) {
        logger.error('Error in getCustomerDetails:', error);
        throw error;
    }
};

export const getAllTransactions = async (jewellerId: string) => {
    try {
        const result = await pool.query(
            `SELECT 
                t.*,
                u.name as user_name
             FROM transactions t
             JOIN users u ON t.user_id = u.id
             WHERE t.jeweller_id = $1
             ORDER BY t.created_at DESC`,
            [jewellerId]
        );

        return result.rows;
    } catch (error) {
        logger.error('Error in getAllTransactions:', error);
        throw error;
    }
};

export const getAllBookings = async (jewellerId: string) => {
    try {
        const result = await pool.query(
            `SELECT 
                b.*,
                u.name as user_name
             FROM gold_bookings b
             JOIN users u ON b.user_id = u.id
             WHERE b.jeweller_id = $1
             ORDER BY b.booked_at DESC`,
            [jewellerId]
        );

        return result.rows;
    } catch (error) {
        logger.error('Error in getAllBookings:', error);
        throw error;
    }
};

export const updateGoldPrice = async (
    jewellerId: string,
    userId: string,
    baseMcxPrice: number,
    marginPercent: number,
    marginFixed: number
) => {
    try {
        // Calculate final price
        const finalPrice = baseMcxPrice + (baseMcxPrice * marginPercent / 100) + marginFixed;

        // Insert or update today's price
        const result = await pool.query(
            `INSERT INTO gold_price_config 
                (jeweller_id, base_mcx_price, jeweller_margin_percent, jeweller_margin_fixed, final_price, effective_date, updated_by)
             VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6)
             ON CONFLICT (jeweller_id, effective_date)
             DO UPDATE SET
                base_mcx_price = $2,
                jeweller_margin_percent = $3,
                jeweller_margin_fixed = $4,
                final_price = $5,
                updated_by = $6
             RETURNING *`,
            [jewellerId, baseMcxPrice, marginPercent, marginFixed, finalPrice, userId]
        );

        logger.info(`Gold price updated for jeweller ${jewellerId}: ₹${finalPrice}/g`);

        return result.rows[0];
    } catch (error) {
        logger.error('Error in updateGoldPrice:', error);
        throw error;
    }
};
