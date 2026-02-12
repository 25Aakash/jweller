import { SilverPriceConfig, Jeweller } from '../models';
import { NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { fetchLiveSilverPrice } from './live-silver-price.service';

/**
 * Get current silver price for a jeweller
 */
export const getCurrentSilverPrice = async (jewellerId: string): Promise<any> => {
    try {
        const priceConfig = await SilverPriceConfig.findOne({
            jeweller_id: jewellerId,
            effective_date: { $lte: new Date() },
        })
            .sort({ effective_date: -1 })
            .lean();

        if (!priceConfig) {
            throw new NotFoundError('Silver price not configured');
        }

        return priceConfig;
    } catch (error) {
        logger.error('Error in getCurrentSilverPrice:', error);
        throw error;
    }
};

/**
 * Set MCX base silver price (Admin only)
 */
export const setSilverMCXPrice = async (
    jewellerId: string,
    baseMcxPrice: number,
    updatedBy: string,
    effectiveDate?: Date,
    overrideMarginPercent?: number,
    overrideMarginFixed?: number
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

        // Use override values if provided, otherwise fall back to stored values
        const marginPercent = overrideMarginPercent !== undefined ? overrideMarginPercent : ((jeweller as any).silver_margin_percentage || 0);
        const marginFixed = overrideMarginFixed !== undefined ? overrideMarginFixed : ((jeweller as any).silver_margin_fixed || 0);

        // Update margins on the Jeweller model so getLivePrice picks them up
        if (overrideMarginPercent !== undefined || overrideMarginFixed !== undefined) {
            await Jeweller.findOneAndUpdate(
                { jeweller_id: jewellerId },
                { $set: { silver_margin_percentage: marginPercent, silver_margin_fixed: marginFixed } }
            );
        }

        const marginAmount = (baseMcxPrice * marginPercent) / 100;
        const finalPrice = baseMcxPrice + marginAmount + marginFixed;

        const priceConfig = await SilverPriceConfig.findOneAndUpdate(
            { jeweller_id: jewellerId, effective_date: dayStart },
            {
                jeweller_id: jewellerId,
                base_mcx_price: baseMcxPrice,
                jeweller_margin_percent: marginPercent,
                jeweller_margin_fixed: marginFixed,
                final_price: finalPrice,
                effective_date: dayStart,
                updated_by: updatedBy,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        logger.info(`Silver price updated for jeweller ${jewellerId}`);
        return priceConfig;
    } catch (error) {
        logger.error('Error in setSilverMCXPrice:', error);
        throw error;
    }
};

/**
 * Update silver margin for jeweller (Admin only)
 */
export const updateSilverMargin = async (
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
            update.silver_margin_percentage = marginPercentage;
        }

        if (marginFixed !== undefined) {
            update.silver_margin_fixed = marginFixed;
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

        logger.info(`Silver margin updated for jeweller ${jewellerId}`);
        return jeweller;
    } catch (error) {
        logger.error('Error in updateSilverMargin:', error);
        throw error;
    }
};

/**
 * Get live silver price from the internet and apply jeweller's margin
 */
export const getLiveSilverPriceForJeweller = async (jewellerId: string): Promise<any> => {
    try {
        const liveBasePrice = await fetchLiveSilverPrice();

        const jeweller = await Jeweller.findOne({ jeweller_id: jewellerId }).lean();
        if (!jeweller) {
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

        const marginPercent = (jeweller as any).silver_margin_percentage || 0;
        const marginFixed = (jeweller as any).silver_margin_fixed || 0;

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
        logger.warn('Live silver price fetch failed, falling back to DB price:', error);
        return getCurrentSilverPrice(jewellerId);
    }
};

/**
 * Get silver price history for a jeweller
 */
export const getSilverPriceHistory = async (
    jewellerId: string,
    limit: number = 30
): Promise<any[]> => {
    try {
        const history = await SilverPriceConfig.find({ jeweller_id: jewellerId })
            .sort({ effective_date: -1 })
            .limit(limit)
            .lean();

        return history;
    } catch (error) {
        logger.error('Error in getSilverPriceHistory:', error);
        throw error;
    }
};

/**
 * Calculate silver grams for given amount
 */
export const calculateSilverGrams = async (
    jewellerId: string,
    amount: number
): Promise<{ grams: number; pricePerGram: number }> => {
    try {
        if (amount <= 0) {
            throw new ValidationError('Amount must be greater than 0');
        }

        const priceConfig = await getLiveSilverPriceForJeweller(jewellerId);
        const pricePerGram = parseFloat(priceConfig.final_price);
        const grams = amount / pricePerGram;

        return {
            grams: parseFloat(grams.toFixed(4)),
            pricePerGram: parseFloat(pricePerGram.toFixed(2)),
        };
    } catch (error) {
        logger.error('Error in calculateSilverGrams:', error);
        throw error;
    }
};
