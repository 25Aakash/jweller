import { User, Wallet, Transaction, GoldBooking, GoldPriceConfig, Jeweller } from '../models';
import logger from '../utils/logger';

export const getDashboardStats = async (jewellerId: string) => {
    try {
        const [totalCustomers, totalRevenue, totalGoldSold, activeBookings, todayTransactions] =
            await Promise.all([
                User.countDocuments({ jeweller_id: jewellerId, role: 'CUSTOMER' }),
                Transaction.aggregate([
                    { $match: { jeweller_id: jewellerId, status: 'SUCCESS' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                GoldBooking.aggregate([
                    { $match: { jeweller_id: jewellerId, status: 'ACTIVE' } },
                    { $group: { _id: null, total: { $sum: '$gold_grams' } } },
                ]),
                GoldBooking.countDocuments({ jeweller_id: jewellerId, status: 'ACTIVE' }),
                Transaction.countDocuments({
                    jeweller_id: jewellerId,
                    created_at: {
                        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
                    },
                }),
            ]);

        return {
            totalCustomers,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalGoldSold: totalGoldSold[0]?.total || 0,
            activeBookings,
            todayTransactions,
        };
    } catch (error) {
        logger.error('Error in getDashboardStats:', error);
        throw error;
    }
};

export const getAllCustomers = async (jewellerId: string) => {
    try {
        const users = await User.find({ jeweller_id: jewellerId, role: 'CUSTOMER' })
            .sort({ created_at: -1 })
            .lean();

        // Get wallets for all users
        const userIds = users.map((u) => u._id);
        const wallets = await Wallet.find({ user_id: { $in: userIds } }).lean();
        const walletMap = new Map(wallets.map((w) => [w.user_id.toString(), w]));

        return users.map((u: any) => {
            const wallet = walletMap.get(u._id.toString());
            return {
                id: u._id,
                name: u.name,
                phone_number: u.phone_number,
                state: u.state,
                city: u.city,
                created_at: u.created_at,
                wallet_balance: wallet?.balance || 0,
                gold_grams: wallet?.gold_grams || 0,
            };
        });
    } catch (error) {
        logger.error('Error in getAllCustomers:', error);
        throw error;
    }
};

export const getCustomerDetails = async (jewellerId: string, customerId: string) => {
    try {
        const user = await User.findOne({
            _id: customerId,
            jeweller_id: jewellerId,
            role: 'CUSTOMER',
        }).lean();

        if (!user) {
            throw new Error('Customer not found');
        }

        const [wallet, transactions, bookings] = await Promise.all([
            Wallet.findOne({ user_id: customerId }).lean(),
            Transaction.find({ user_id: customerId, jeweller_id: jewellerId })
                .sort({ created_at: -1 })
                .limit(10)
                .lean(),
            GoldBooking.find({ user_id: customerId, jeweller_id: jewellerId })
                .sort({ booked_at: -1 })
                .lean(),
        ]);

        return {
            customer: {
                id: user._id,
                name: user.name,
                phone_number: user.phone_number,
                state: user.state,
                city: user.city,
                created_at: user.created_at,
                wallet_balance: wallet?.balance || 0,
                gold_grams: wallet?.gold_grams || 0,
            },
            transactions,
            bookings,
        };
    } catch (error) {
        logger.error('Error in getCustomerDetails:', error);
        throw error;
    }
};

export const getAllTransactions = async (jewellerId: string) => {
    try {
        const transactions = await Transaction.find({ jeweller_id: jewellerId })
            .sort({ created_at: -1 })
            .populate('user_id', 'name')
            .lean();

        return transactions.map((t: any) => ({
            ...t,
            user_name: t.user_id?.name,
        }));
    } catch (error) {
        logger.error('Error in getAllTransactions:', error);
        throw error;
    }
};

export const getAllBookings = async (jewellerId: string) => {
    try {
        const bookings = await GoldBooking.find({ jeweller_id: jewellerId })
            .sort({ booked_at: -1 })
            .populate('user_id', 'name')
            .lean();

        return bookings.map((b: any) => ({
            ...b,
            user_name: b.user_id?.name,
        }));
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
        const finalPrice = baseMcxPrice + (baseMcxPrice * marginPercent / 100) + marginFixed;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const priceConfig = await GoldPriceConfig.findOneAndUpdate(
            { jeweller_id: jewellerId, effective_date: today },
            {
                jeweller_id: jewellerId,
                base_mcx_price: baseMcxPrice,
                jeweller_margin_percent: marginPercent,
                jeweller_margin_fixed: marginFixed,
                final_price: finalPrice,
                effective_date: today,
                updated_by: userId,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        logger.info(`Gold price updated for jeweller ${jewellerId}: ₹${finalPrice}/g`);
        return priceConfig;
    } catch (error) {
        logger.error('Error in updateGoldPrice:', error);
        throw error;
    }
};
