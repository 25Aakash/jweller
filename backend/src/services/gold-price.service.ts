import pool from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { fetchLiveGoldPrice } from './live-gold-price.service';

/**
 * Get current gold price for a jeweller
 */
export const getCurrentGoldPrice = async (jewellerId: string): Promise<any> => {
    try {
        const result = await pool.query(
            `SELECT * FROM gold_price_config 
       WHERE jeweller_id = $1 
       AND effective_date <= CURRENT_DATE
       ORDER BY effective_date DESC
       LIMIT 1`,
            [jewellerId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Gold price not configured');
        }

        return result.rows[0];
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

        // Get jeweller's margin configuration
        const jewellerResult = await pool.query(
            `SELECT margin_percentage, margin_fixed FROM jewellers WHERE id = $1`,
            [jewellerId]
        );

        if (jewellerResult.rows.length === 0) {
            throw new NotFoundError('Jeweller not found');
        }

        const { margin_percentage, margin_fixed } = jewellerResult.rows[0];

        // Calculate final price
        const marginAmount = (baseMcxPrice * margin_percentage) / 100;
        const finalPrice = baseMcxPrice + marginAmount + margin_fixed;

        // Check if price already exists for this date
        const existingPrice = await pool.query(
            `SELECT id FROM gold_price_config 
       WHERE jeweller_id = $1 AND effective_date = $2`,
            [jewellerId, date]
        );

        let result;
        if (existingPrice.rows.length > 0) {
            // Update existing price
            result = await pool.query(
                `UPDATE gold_price_config 
         SET base_mcx_price = $1, 
             jeweller_margin_percent = $2,
             jeweller_margin_fixed = $3,
             final_price = $4,
             updated_by = $5
         WHERE jeweller_id = $6 AND effective_date = $7
         RETURNING *`,
                [baseMcxPrice, margin_percentage, margin_fixed, finalPrice, updatedBy, jewellerId, date]
            );
        } else {
            // Insert new price
            result = await pool.query(
                `INSERT INTO gold_price_config 
         (jeweller_id, base_mcx_price, jeweller_margin_percent, jeweller_margin_fixed, final_price, effective_date, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
                [jewellerId, baseMcxPrice, margin_percentage, margin_fixed, finalPrice, date, updatedBy]
            );
        }

        logger.info(`Gold price updated for jeweller ${jewellerId}`);
        return result.rows[0];
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
        // Build update query dynamically
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (marginPercentage !== undefined) {
            if (marginPercentage < 0) {
                throw new ValidationError('Margin percentage cannot be negative');
            }
            updates.push(`margin_percentage = $${paramCount++}`);
            values.push(marginPercentage);
        }

        if (marginFixed !== undefined) {
            updates.push(`margin_fixed = $${paramCount++}`);
            values.push(marginFixed);
        }

        if (updates.length === 0) {
            throw new ValidationError('No margin values provided');
        }

        values.push(jewellerId);

        const result = await pool.query(
            `UPDATE jewellers 
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Jeweller not found');
        }

        logger.info(`Margin updated for jeweller ${jewellerId}`);
        return result.rows[0];
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
        // Fetch live MCX/market gold price
        const liveBasePrice = await fetchLiveGoldPrice();

        // Get jeweller's margin configuration
        const jewellerResult = await pool.query(
            `SELECT margin_percentage, margin_fixed FROM jewellers WHERE id = $1`,
            [jewellerId]
        );

        if (jewellerResult.rows.length === 0) {
            throw new NotFoundError('Jeweller not found');
        }

        const marginPercent = parseFloat(jewellerResult.rows[0].margin_percentage) || 0;
        const marginFixed = parseFloat(jewellerResult.rows[0].margin_fixed) || 0;

        // Calculate final price with jeweller margin
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
        // Fallback to DB-stored price if live fetch fails
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
        const result = await pool.query(
            `SELECT * FROM gold_price_config 
       WHERE jeweller_id = $1 
       ORDER BY effective_date DESC
       LIMIT $2`,
            [jewellerId, limit]
        );

        return result.rows;
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
