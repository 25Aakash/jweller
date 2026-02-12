import { GoldPriceConfig, Jeweller } from '../models';
import { NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { fetchLiveGoldPrice } from './live-gold-price.service';

/**
 * Get current gold price for a jeweller
 */
export const getCurrentGoldPrice = async (jewellerId: string): Promise<any> => {
    try {
        const priceConfig = await GoldPriceConfig.findOne({
            jeweller_id: jewellerId,
            effective_date: { $lte: new Date() },
        })
            .sort({ effective_date: -1 })
            .lean();

        if (!priceConfig) {
            throw new NotFoundError('Gold price not configured');
        }

        return priceConfig;
    } catch (error) {
        logger.error('Error in getCurrentGoldPrice:', error);
        throw error;
    }
};

/**
 * Set MCX base gold price (Admin only)
 */
export const setMCXPrice = async (
    jewellerId: string,
    baseMcxPrice: number,
    updatedBy: string,
    effectiveDate?: Date
): Promise<any> => {
    try {
        if (baseMcxPrice <= 0) {
            throw new ValidationError('Base MCX price must be greater than 0');
        }

        const date = effectiveDate || new Date();
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        const jeweller = await Jeweller.findOne({ jeweller_id: jewellerId }).lean();
        if (!jeweller) {
            throw new NotFoundError('Jeweller not found');
        }

        const { margin_percentage, margin_fixed } = jeweller;
        const marginAmount = (baseMcxPrice * margin_percentage) / 100;
        const finalPrice = baseMcxPrice + marginAmount + margin_fixed;

        const priceConfig = await GoldPriceConfig.findOneAndUpdate(
            { jeweller_id: jewellerId, effective_date: dayStart },
            {
                jeweller_id: jewellerId,
                base_mcx_price: baseMcxPrice,
                jeweller_margin_percent: margin_percentage,
                jeweller_margin_fixed: margin_fixed,
                final_price: finalPrice,
                effective_date: dayStart,
                updated_by: updatedBy,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        logger.info(`Gold price updated for jeweller ${jewellerId}`);
        return priceConfig;
    } catch (error) {
        logger.error('Error in setMCXPrice:', error);
        throw error;
    }
};

/**
 * Update jeweller margin (Admin only)
 */
export const updateJewellerMargin = async (
    jewellerId: string,
    marginPercentage?: number,
    marginFixed?: number
): Promise<any> => {
    try {
        const update: any = {};

        if (marginPercentage !== undefined) {
            if (marginPercentage < 0) {
                throw new ValidationError('Margin percentage cannot be negative');
            }
            update.margin_percentage = marginPercentage;
        }

        if (marginFixed !== undefined) {
            update.margin_fixed = marginFixed;
        }

        if (Object.keys(update).length === 0) {
            throw new ValidationError('No margin values provided');
        }

        const jeweller = await Jeweller.findOneAndUpdate(
            { jeweller_id: jewellerId },
            { $set: update },
            { new: true }
        );

        if (!jeweller) {
            throw new NotFoundError('Jeweller not found');
        }

        logger.info(`Margin updated for jeweller ${jewellerId}`);
        return jeweller;
    } catch (error) {
        logger.error('Error in updateJewellerMargin:', error);
        throw error;
    }
};

/**
 * Get live gold price from the internet and apply jeweller's margin
 */
export const getLiveGoldPriceForJeweller = async (jewellerId: string): Promise<any> => {
    try {
        const liveBasePrice = await fetchLiveGoldPrice();

        const jeweller = await Jeweller.findOne({ jeweller_id: jewellerId }).lean();
        if (!jeweller) {
            // No jeweller config found, use 0 margins
            logger.warn(`No jeweller config for ${jewellerId}, using 0 margins`);
            return {
                base_mcx_price: liveBasePrice,
                jeweller_margin_percent: 0,
                jeweller_margin_fixed: 0,
                final_price: Math.round(liveBasePrice * 100) / 100,
                source: 'live',
                fetched_at: new Date().toISOString(),
            };
        }

        const marginPercent = jeweller.margin_percentage || 0;
        const marginFixed = jeweller.margin_fixed || 0;

        const marginAmount = (liveBasePrice * marginPercent) / 100;
        const finalPrice = liveBasePrice + marginAmount + marginFixed;

        return {
            base_mcx_price: liveBasePrice,
            jeweller_margin_percent: marginPercent,
            jeweller_margin_fixed: marginFixed,
            final_price: Math.round(finalPrice * 100) / 100,
            source: 'live',
            fetched_at: new Date().toISOString(),
        };
    } catch (error) {
        logger.warn('Live gold price fetch failed, falling back to DB price:', error);
        return getCurrentGoldPrice(jewellerId);
    }
};

/**
 * Get gold price history for a jeweller
 */
export const getGoldPriceHistory = async (
    jewellerId: string,
    limit: number = 30
): Promise<any[]> => {
    try {
        const history = await GoldPriceConfig.find({ jeweller_id: jewellerId })
            .sort({ effective_date: -1 })
            .limit(limit)
            .lean();

        return history;
    } catch (error) {
        logger.error('Error in getGoldPriceHistory:', error);
        throw error;
    }
};

/**
 * Calculate gold grams for given amount
 */
export const calculateGoldGrams = async (
    jewellerId: string,
    amount: number
): Promise<{ grams: number; pricePerGram: number }> => {
    try {
        if (amount <= 0) {
            throw new ValidationError('Amount must be greater than 0');
        }

        const priceConfig = await getLiveGoldPriceForJeweller(jewellerId);
        const pricePerGram = parseFloat(priceConfig.final_price);
        const grams = amount / pricePerGram;

        return {
            grams: parseFloat(grams.toFixed(4)),
            pricePerGram: parseFloat(pricePerGram.toFixed(2)),
        };
    } catch (error) {
        logger.error('Error in calculateGoldGrams:', error);
        throw error;
    }
};
