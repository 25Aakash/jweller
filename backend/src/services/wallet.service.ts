import pool, { transaction } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Get wallet for a user
 */
export const getWallet = async (userId: string, jewellerId: string): Promise<any> => {
    try {
        const result = await pool.query(
            `SELECT * FROM wallet 
       WHERE user_id = $1 AND jeweller_id = $2`,
            [userId, jewellerId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Wallet not found');
        }

        return result.rows[0];
    } catch (error) {
        logger.error('Error in getWallet:', error);
        throw error;
    }
};

/**
 * Update wallet balance (add money)
 */
export const addMoneyToWallet = async (
    userId: string,
    jewellerId: string,
    amount: number,
    transactionRef: string,
    paymentGatewayResponse?: any
): Promise<any> => {
    try {
        if (amount <= 0) {
            throw new ValidationError('Amount must be greater than 0');
        }

        return await transaction(async (client) => {
            // Update wallet balance
            const walletResult = await client.query(
                `UPDATE wallet 
         SET balance = balance + $1, updated_at = NOW()
         WHERE user_id = $2 AND jeweller_id = $3
         RETURNING *`,
                [amount, userId, jewellerId]
            );

            if (walletResult.rows.length === 0) {
                throw new NotFoundError('Wallet not found');
            }

            // Record transaction
            await client.query(
                `INSERT INTO transactions 
         (user_id, jeweller_id, transaction_ref, amount, type, status, payment_gateway_response)
         VALUES ($1, $2, $3, $4, 'WALLET_CREDIT', 'SUCCESS', $5)`,
                [userId, jewellerId, transactionRef, amount, JSON.stringify(paymentGatewayResponse || {})]
            );

            logger.info(`Added ₹${amount} to wallet for user ${userId}`);
            return walletResult.rows[0];
        });
    } catch (error) {
        logger.error('Error in addMoneyToWallet:', error);
        throw error;
    }
};

/**
 * Deduct money from wallet (for gold booking)
 */
export const deductMoneyFromWallet = async (
    userId: string,
    jewellerId: string,
    amount: number,
    bookingId: string
): Promise<any> => {
    try {
        if (amount <= 0) {
            throw new ValidationError('Amount must be greater than 0');
        }

        return await transaction(async (client) => {
            // Check wallet balance
            const walletCheck = await client.query(
                `SELECT balance FROM wallet 
         WHERE user_id = $1 AND jeweller_id = $2`,
                [userId, jewellerId]
            );

            if (walletCheck.rows.length === 0) {
                throw new NotFoundError('Wallet not found');
            }

            if (walletCheck.rows[0].balance < amount) {
                throw new ValidationError('Insufficient wallet balance');
            }

            // Deduct from wallet
            const walletResult = await client.query(
                `UPDATE wallet 
         SET balance = balance - $1, updated_at = NOW()
         WHERE user_id = $2 AND jeweller_id = $3
         RETURNING *`,
                [amount, userId, jewellerId]
            );

            // Record transaction
            await client.query(
                `INSERT INTO transactions 
         (user_id, jeweller_id, booking_id, amount, type, status)
         VALUES ($1, $2, $3, $4, 'GOLD_BOOKING', 'SUCCESS')`,
                [userId, jewellerId, bookingId, amount]
            );

            logger.info(`Deducted ₹${amount} from wallet for user ${userId}`);
            return walletResult.rows[0];
        });
    } catch (error) {
        logger.error('Error in deductMoneyFromWallet:', error);
        throw error;
    }
};

/**
 * Add gold to wallet
 */
export const addGoldToWallet = async (
    userId: string,
    jewellerId: string,
    goldGrams: number
): Promise<any> => {
    try {
        if (goldGrams <= 0) {
            throw new ValidationError('Gold grams must be greater than 0');
        }

        const result = await pool.query(
            `UPDATE wallet 
       SET gold_grams = gold_grams + $1, updated_at = NOW()
       WHERE user_id = $2 AND jeweller_id = $3
       RETURNING *`,
            [goldGrams, userId, jewellerId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Wallet not found');
        }

        logger.info(`Added ${goldGrams}g gold to wallet for user ${userId}`);
        return result.rows[0];
    } catch (error) {
        logger.error('Error in addGoldToWallet:', error);
        throw error;
    }
};

/**
 * Get transaction history for a user
 */
export const getTransactionHistory = async (
    userId: string,
    jewellerId: string,
    limit: number = 50,
    offset: number = 0
): Promise<any[]> => {
    try {
        const result = await pool.query(
            `SELECT * FROM transactions 
       WHERE user_id = $1 AND jeweller_id = $2
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
            [userId, jewellerId, limit, offset]
        );

        return result.rows;
    } catch (error) {
        logger.error('Error in getTransactionHistory:', error);
        throw error;
    }
};

/**
 * Get all transactions for a jeweller (Admin)
 */
export const getAllTransactions = async (
    jewellerId: string,
    limit: number = 100,
    offset: number = 0
): Promise<any[]> => {
    try {
        const result = await pool.query(
            `SELECT t.*, u.name as user_name, u.phone_number 
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.jeweller_id = $1
       ORDER BY t.created_at DESC
       LIMIT $2 OFFSET $3`,
            [jewellerId, limit, offset]
        );

        return result.rows;
    } catch (error) {
        logger.error('Error in getAllTransactions:', error);
        throw error;
    }
};
