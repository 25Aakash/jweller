import mongoose from 'mongoose';
import { Wallet, Transaction } from '../models';
import { NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Get wallet for a user
 */
export const getWallet = async (userId: string, jewellerId: string): Promise<any> => {
    try {
        const wallet = await Wallet.findOne({ user_id: userId, jeweller_id: jewellerId });

        if (!wallet) {
            throw new NotFoundError('Wallet not found');
        }

        return wallet;
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
    const session = await mongoose.startSession();
    try {
        if (amount <= 0) {
            throw new ValidationError('Amount must be greater than 0');
        }

        session.startTransaction();

        const wallet = await Wallet.findOneAndUpdate(
            { user_id: userId, jeweller_id: jewellerId },
            { $inc: { balance: amount } },
            { new: true, session }
        );

        if (!wallet) {
            throw new NotFoundError('Wallet not found');
        }

        await Transaction.create(
            [
                {
                    user_id: userId,
                    jeweller_id: jewellerId,
                    transaction_ref: transactionRef,
                    amount,
                    type: 'WALLET_CREDIT',
                    status: 'SUCCESS',
                    payment_gateway_response: paymentGatewayResponse || {},
                },
            ],
            { session }
        );

        await session.commitTransaction();
        logger.info(`Added ₹${amount} to wallet for user ${userId}`);
        return wallet;
    } catch (error) {
        await session.abortTransaction();
        logger.error('Error in addMoneyToWallet:', error);
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Deduct money from wallet (for gold booking)
 */
export const deductMoneyFromWallet = async (
    userId: string,
    jewellerId: string,
    amount: number,
    bookingId: string,
    transactionType: 'GOLD_BOOKING' | 'SILVER_BOOKING' = 'GOLD_BOOKING'
): Promise<any> => {
    const session = await mongoose.startSession();
    try {
        if (amount <= 0) {
            throw new ValidationError('Amount must be greater than 0');
        }

        session.startTransaction();

        const wallet = await Wallet.findOne({ user_id: userId, jeweller_id: jewellerId }).session(session);

        if (!wallet) {
            throw new NotFoundError('Wallet not found');
        }

        if (wallet.balance < amount) {
            throw new ValidationError('Insufficient wallet balance');
        }

        wallet.balance -= amount;
        await wallet.save({ session });

        await Transaction.create(
            [
                {
                    user_id: userId,
                    jeweller_id: jewellerId,
                    booking_id: bookingId,
                    amount,
                    type: transactionType,
                    status: 'SUCCESS',
                },
            ],
            { session }
        );

        await session.commitTransaction();
        logger.info(`Deducted ₹${amount} from wallet for user ${userId}`);
        return wallet;
    } catch (error) {
        await session.abortTransaction();
        logger.error('Error in deductMoneyFromWallet:', error);
        throw error;
    } finally {
        session.endSession();
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

        const wallet = await Wallet.findOneAndUpdate(
            { user_id: userId, jeweller_id: jewellerId },
            { $inc: { gold_grams: goldGrams } },
            { new: true }
        );

        if (!wallet) {
            throw new NotFoundError('Wallet not found');
        }

        logger.info(`Added ${goldGrams}g gold to wallet for user ${userId}`);
        return wallet;
    } catch (error) {
        logger.error('Error in addGoldToWallet:', error);
        throw error;
    }
};

/**
 * Add silver to wallet
 */
export const addSilverToWallet = async (
    userId: string,
    jewellerId: string,
    silverGrams: number
): Promise<any> => {
    try {
        if (silverGrams <= 0) {
            throw new ValidationError('Silver grams must be greater than 0');
        }

        const wallet = await Wallet.findOneAndUpdate(
            { user_id: userId, jeweller_id: jewellerId },
            { $inc: { silver_grams: silverGrams } },
            { new: true }
        );

        if (!wallet) {
            throw new NotFoundError('Wallet not found');
        }

        logger.info(`Added ${silverGrams}g silver to wallet for user ${userId}`);
        return wallet;
    } catch (error) {
        logger.error('Error in addSilverToWallet:', error);
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
        const transactions = await Transaction.find({ user_id: userId, jeweller_id: jewellerId })
            .sort({ created_at: -1 })
            .skip(offset)
            .limit(limit)
            .lean();

        return transactions;
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
        const transactions = await Transaction.find({ jeweller_id: jewellerId })
            .sort({ created_at: -1 })
            .skip(offset)
            .limit(limit)
            .populate('user_id', 'name phone_number')
            .lean();

        // Map to match expected format
        return transactions.map((t: any) => ({
            ...t,
            user_name: t.user_id?.name,
            phone_number: t.user_id?.phone_number,
        }));
    } catch (error) {
        logger.error('Error in getAllTransactions:', error);
        throw error;
    }
};
