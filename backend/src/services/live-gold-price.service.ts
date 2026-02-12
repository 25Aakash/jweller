import axios from 'axios';
import logger from '../utils/logger';
import { fetchMCXGoldPrice } from './live-mcx-price.service';

/**
 * Live gold price fetcher
 * Primary: MCX authority API (shared fetcher for gold + silver)
 * Fallbacks: goldprice.org, exchange rate conversion
 * Price is for 24K gold per gram in INR
 */

// Separate fallback cache (MCX service has its own cache)
let fallbackCachedPrice: { price: number; timestamp: number } | null = null;

/**
 * Fetch live gold price per gram in INR
 * MCX is the primary source, other APIs are fallbacks only
 */
export const fetchLiveGoldPrice = async (): Promise<number> => {
    // Try MCX first (has its own caching)
    try {
        const price = await fetchMCXGoldPrice();
        if (price && price > 0) {
            fallbackCachedPrice = { price, timestamp: Date.now() };
            return price;
        }
    } catch (error) {
        logger.warn('MCX gold price failed, trying fallback sources...');
    }

    // Fallbacks
    const fallbacks = [
        fetchFromGoldPriceIndia,
        fetchFromExchangeRate,
    ];

    for (const fetcher of fallbacks) {
        try {
            const price = await fetcher();
            if (price && price > 0) {
                fallbackCachedPrice = { price, timestamp: Date.now() };
                logger.info(`Fallback gold price fetched: ₹${price}/gram`);
                return price;
            }
        } catch (error) {
            logger.warn(`Gold price fallback failed, trying next...`);
        }
    }

    if (fallbackCachedPrice) {
        logger.warn(`All sources failed, using stale cached price: ₹${fallbackCachedPrice.price}/gram`);
        return fallbackCachedPrice.price;
    }

    throw new Error('Unable to fetch live gold price from any source');
};

/**
 * Fallback 1: Gold Price India via public JSON endpoint
 */
async function fetchFromGoldPriceIndia(): Promise<number> {
    const response = await axios.get(
        'https://data-asg.goldprice.org/dbXRates/INR',
        {
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0' },
        }
    );

    if (response.data?.items?.[0]?.xauPrice) {
        const pricePerOunce = response.data.items[0].xauPrice;
        const pricePerGram = pricePerOunce / 31.1035;
        logger.info(`goldprice.org gold price: ₹${pricePerGram.toFixed(2)}/gram`);
        return Math.round(pricePerGram * 100) / 100;
    }
    throw new Error('Invalid response from goldprice.org');
}

/**
 * Fallback 2: Convert XAU/USD via exchange rates
 */
async function fetchFromExchangeRate(): Promise<number> {
    const goldResponse = await axios.get(
        'https://api.frankfurter.app/latest?from=XAU&to=USD',
        { timeout: 10000 }
    );

    const forexResponse = await axios.get(
        'https://api.frankfurter.app/latest?from=USD&to=INR',
        { timeout: 10000 }
    );

    if (goldResponse.data?.rates?.USD && forexResponse.data?.rates?.INR) {
        const goldUsdPerOunce = goldResponse.data.rates.USD;
        const usdToInr = forexResponse.data.rates.INR;
        const pricePerGram = (goldUsdPerOunce * usdToInr) / 31.1035;
        logger.info(`Exchange rate gold price: ₹${pricePerGram.toFixed(2)}/gram`);
        return Math.round(pricePerGram * 100) / 100;
    }
    throw new Error('Invalid response from exchange rate API');
}

/**
 * Get cached price without making an API call
 */
export const getCachedPrice = (): number | null => {
    return fallbackCachedPrice?.price ?? null;
};

/**
 * Clear the price cache
 */
export const clearCache = (): void => {
    fallbackCachedPrice = null;
};
