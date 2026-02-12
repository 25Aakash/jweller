import axios from 'axios';
import logger from '../utils/logger';

/**
 * Shared MCX price fetcher for both gold and silver
 * Uses metals.dev MCX authority API — single call returns both metals
 * Prices are per gram in INR
 */

interface MCXPrices {
    gold: number;
    silver: number;
    timestamp: number;
}

let cachedPrices: MCXPrices | null = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const MCX_API_KEY = '2AI8U3R1DCAORLBKZXDG211BKZXDG';

/**
 * Fetch both gold and silver MCX prices in a single API call
 */
export const fetchMCXPrices = async (): Promise<MCXPrices> => {
    // Return cached if fresh
    if (cachedPrices && Date.now() - cachedPrices.timestamp < CACHE_DURATION_MS) {
        logger.info(`Returning cached MCX prices — Gold: ₹${cachedPrices.gold}/g, Silver: ₹${cachedPrices.silver}/g`);
        return cachedPrices;
    }

    const apiKey = process.env.METALS_DEV_API_KEY || MCX_API_KEY;

    try {
        const response = await axios.get(
            `https://api.metals.dev/v1/metal/authority?api_key=${apiKey}&authority=mcx&currency=INR&unit=g`,
            { timeout: 10000 }
        );

        const rates = response.data?.rates;
        if (rates?.mcx_gold && rates?.mcx_silver) {
            const prices: MCXPrices = {
                gold: Math.round(rates.mcx_gold * 100) / 100,
                silver: Math.round(rates.mcx_silver * 100) / 100,
                timestamp: Date.now(),
            };
            cachedPrices = prices;
            logger.info(`MCX prices fetched — Gold: ₹${prices.gold}/g, Silver: ₹${prices.silver}/g`);
            return prices;
        }
        throw new Error('Invalid MCX API response — missing gold/silver rates');
    } catch (error) {
        if (cachedPrices) {
            logger.warn('MCX API failed, returning stale cached prices');
            return cachedPrices;
        }
        logger.error('MCX API failed and no cache available:', error);
        throw error;
    }
};

/**
 * Get just the MCX gold price per gram in INR
 */
export const fetchMCXGoldPrice = async (): Promise<number> => {
    const prices = await fetchMCXPrices();
    return prices.gold;
};

/**
 * Get just the MCX silver price per gram in INR
 */
export const fetchMCXSilverPrice = async (): Promise<number> => {
    const prices = await fetchMCXPrices();
    return prices.silver;
};

/**
 * Get cached prices without API call
 */
export const getCachedMCXPrices = (): MCXPrices | null => {
    return cachedPrices;
};

/**
 * Clear cache
 */
export const clearMCXCache = (): void => {
    cachedPrices = null;
};
